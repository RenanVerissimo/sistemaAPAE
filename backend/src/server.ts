import express, { Request, Response } from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { db } from "./config/db.js";
import laudoRoutes from "./routes/laudoRoute.js";
import { executarBackupLocal, iniciarAgendadorBackup } from "./services/backup.service.js";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

async function garantirTabelaLaudos() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS laudos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      paciente_id INT NOT NULL,
      nome_arquivo VARCHAR(255) NOT NULL,
      caminho_arquivo VARCHAR(500) NOT NULL,
      tamanho INT NOT NULL,
      tipo VARCHAR(100) NOT NULL,
      observacao TEXT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_laudos_paciente_id (paciente_id)
    )
  `);

  const [columns]: any = await db.query("SHOW COLUMNS FROM laudos");
  const columnNames = new Set(columns.map((column: any) => column.Field));

  if (!columnNames.has("observacao")) {
    await db.query("ALTER TABLE laudos ADD COLUMN observacao TEXT NULL");
  }

  if (!columnNames.has("created_at")) {
    await db.query(
      "ALTER TABLE laudos ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
    );
  }

  await db.query("ALTER TABLE laudos MODIFY caminho_arquivo VARCHAR(500) NOT NULL");
  await db.query("ALTER TABLE laudos MODIFY tamanho INT NOT NULL");
  await db.query("ALTER TABLE laudos MODIFY tipo VARCHAR(100) NOT NULL");
}

/* ================= PACIENTES ================= */

app.get("/pacientes", async (req: Request, res: Response) => {
  try {
    const [rows] = await db.query(`
      SELECT
        p.id,
        p.nome,
        p.cpf,
        p.prontuario,
        p.dataNasc,
        p.cartaoSUS,
        p.status,
        p.descricao,
        COALESCE(atendimentos_total.qtdConsultasRealizadas, 0) AS qtdConsultasRealizadas,
        COALESCE(atendimentos_mes.qtdConsultasMesAtual, 0) AS qtdConsultasMesAtual
      FROM pacientes p
      LEFT JOIN (
        SELECT paciente_id, COUNT(*) AS qtdConsultasRealizadas
        FROM atendimentos
        GROUP BY paciente_id
      ) atendimentos_total ON atendimentos_total.paciente_id = p.id
      LEFT JOIN (
        SELECT paciente_id, COUNT(*) AS qtdConsultasMesAtual
        FROM atendimentos
        WHERE dataConsulta >= DATE_FORMAT(CURDATE(), '%Y-%m-01')
          AND dataConsulta < DATE_ADD(DATE_FORMAT(CURDATE(), '%Y-%m-01'), INTERVAL 1 MONTH)
        GROUP BY paciente_id
      ) atendimentos_mes ON atendimentos_mes.paciente_id = p.id
    `);
    res.json(rows);
  } catch (error) {
    console.error("Erro ao buscar pacientes:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

app.get("/pacientes/qtd", async (req: Request, res: Response) => {
  try {
    const [rows]: any = await db.query("SELECT COUNT(*) AS total FROM pacientes");
    res.json({ total: rows[0].total });
  } catch (error) {
    console.error("Erro ao contar pacientes:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

app.post("/pacientes", async (req: Request, res: Response) => {
  try {
    const {
      nome, cpf, prontuario, dataNasc, cartaoSUS,
      status, descricao,
    } = req.body;

    const [result]: any = await db.query(
      `INSERT INTO pacientes
        (nome, cpf, prontuario, dataNasc, cartaoSUS, status, descricao)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        nome, cpf, prontuario, dataNasc, cartaoSUS,
        status ?? "Ativo", descricao ?? null,
      ]
    );
    res.status(201).json({
      message: "Paciente cadastrado com sucesso",
      id: result.insertId,
    });
  } catch (error) {
    console.error("Erro ao cadastrar paciente:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

app.put("/pacientes/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      nome, cpf, prontuario, dataNasc, cartaoSUS,
      status, descricao,
    } = req.body;

    await db.query(
      `UPDATE pacientes
         SET nome = ?, cpf = ?, prontuario = ?, dataNasc = ?, cartaoSUS = ?,
             status = ?, descricao = ?
       WHERE id = ?`,
      [
        nome, cpf, prontuario, dataNasc, cartaoSUS,
        status ?? "Ativo", descricao ?? null, id,
      ]
    );
    res.json({ message: "Paciente atualizado com sucesso" });
  } catch (error) {
    console.error("ERRO REAL DO UPDATE:", error);
    res.status(500).json({ message: (error as Error).message });
  }
});

app.delete("/pacientes/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM pacientes WHERE id = ?", [id]);
    res.json({ message: "Paciente excluído com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir paciente:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

/* ================= PROFISSIONAIS ================= */

app.get("/profissionais", async (req: Request, res: Response) => {
  try {
    const [rows] = await db.query(`
      SELECT
        p.id,
        p.nome,
        p.email,
        p.dataNasc,
        p.senha,
        p.especialidade,
        p.outraEspecialidade,
        p.registroProfissional,
        p.rolee,
        COALESCE(atendimentos_total.qtdAtendimentos, 0) AS qtdAtendimentos,
        COALESCE(atendimentos_mes.qtdAtendimentosMesAtual, 0) AS qtdAtendimentosMesAtual
      FROM profissionais p
      LEFT JOIN (
        SELECT profissional_id, COUNT(*) AS qtdAtendimentos
        FROM atendimentos
        GROUP BY profissional_id
      ) atendimentos_total ON atendimentos_total.profissional_id = p.id
      LEFT JOIN (
        SELECT profissional_id, COUNT(*) AS qtdAtendimentosMesAtual
        FROM atendimentos
        WHERE dataConsulta >= DATE_FORMAT(CURDATE(), '%Y-%m-01')
          AND dataConsulta < DATE_ADD(DATE_FORMAT(CURDATE(), '%Y-%m-01'), INTERVAL 1 MONTH)
        GROUP BY profissional_id
      ) atendimentos_mes ON atendimentos_mes.profissional_id = p.id
      WHERE p.rolee <> 'SECRETARIA'
    `);
    res.json(rows);
  } catch (error) {
    console.error("Erro ao buscar profissionais:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

app.get("/profissionais/qtd", async (req: Request, res: Response) => {
  try {
    const [rows]: any = await db.query(
      "SELECT COUNT(*) AS total FROM profissionais WHERE rolee <> 'SECRETARIA'"
    );
    res.json({ total: rows[0].total });
  } catch (error) {
    console.error("Erro ao contar profissionais:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

app.post("/profissionais", async (req: Request, res: Response) => {
  try {
    const {
      nome, email, dataNasc, senha, especialidade,
      outraEspecialidade, registroProfissional, rolee,
    } = req.body;

    if (!nome || !email || !senha || !especialidade) {
      res.status(400).json({ message: "Campos obrigatórios não preenchidos" });
      return;
    }

    const [existing]: any = await db.query(
      "SELECT id FROM profissionais WHERE email = ?",
      [email]
    );
    if (existing.length > 0) {
      res.status(400).json({ message: "Email já cadastrado" });
      return;
    }

    const [result]: any = await db.query(
      `INSERT INTO profissionais
        (nome, email, dataNasc, senha, especialidade, outraEspecialidade,
         registroProfissional, rolee)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nome, email, dataNasc, senha, especialidade,
        outraEspecialidade || null, registroProfissional || null,
        rolee || "PROFISSIONAL",
      ]
    );

    res.status(201).json({
      message: "Profissional cadastrado com sucesso",
      id: result.insertId,
    });
  } catch (error) {
    console.error("Erro ao cadastrar profissional:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

app.put("/profissionais/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      nome, email, dataNasc, especialidade,
      outraEspecialidade, registroProfissional,
    } = req.body;

    await db.query(
      `UPDATE profissionais
         SET nome = ?, email = ?, dataNasc = ?, especialidade = ?,
             outraEspecialidade = ?, registroProfissional = ?
       WHERE id = ?`,
      [
        nome, email, dataNasc, especialidade,
        outraEspecialidade || null, registroProfissional || null, id,
      ]
    );
    res.json({ message: "Profissional atualizado com sucesso" });
  } catch (error) {
    console.error("Erro ao atualizar profissional:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

app.delete("/profissionais/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM profissionais WHERE id = ?", [id]);
    res.json({ message: "Profissional excluído com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir profissional:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

app.put("/profissionais/:id/senha", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { senha } = req.body;

    if (!senha || senha.length < 4) {
      return res.status(400).json({ message: "Senha inválida (mínimo 4 caracteres)" });
    }

    await db.query(
      "UPDATE profissionais SET senha = ? WHERE id = ?",
      [senha, id]
    );
    res.json({ message: "Senha atualizada com sucesso" });
  } catch (error) {
    console.error("Erro ao atualizar senha:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

/* ================= ATENDIMENTOS ================= */

app.get("/atendimentos", async (req: Request, res: Response) => {
  try {
    const { paciente, profissional, especialidade, dataInicio, dataFim } = req.query;

    let sql = `
      SELECT a.*,
             p.nome AS nomePaciente,
             prof.nome AS nomeProfissional,
             prof.especialidade AS especialidade
      FROM atendimentos a
      INNER JOIN pacientes p ON p.id = a.paciente_id
      INNER JOIN profissionais prof ON prof.id = a.profissional_id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (paciente) {
      sql += " AND p.nome LIKE ?";
      params.push(`%${paciente}%`);
    }
    if (profissional) {
      sql += " AND prof.nome LIKE ?";
      params.push(`%${profissional}%`);
    }
    if (especialidade) {
      sql += " AND prof.especialidade = ?";
      params.push(especialidade);
    }
    if (dataInicio) {
      sql += " AND a.dataConsulta >= ?";
      params.push(dataInicio);
    }
    if (dataFim) {
      sql += " AND a.dataConsulta <= ?";
      params.push(dataFim);
    }

    sql += " ORDER BY a.dataConsulta DESC, a.id DESC";

    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (error) {
    console.error("Erro ao buscar atendimentos:", error);
    res.status(500).json({ message: "Erro interno" });
  }
});

app.post("/atendimentos", async (req: Request, res: Response) => {
  const connection = await db.getConnection();

  try {
    const { paciente_id, profissional_id, dataConsulta, descricao } = req.body;

    if (!paciente_id || !profissional_id || !dataConsulta) {
      res.status(400).json({ message: "Campos obrigatórios não preenchidos" });
      return;
    }

    await connection.beginTransaction();

    const [pacienteRows]: any = await connection.query(
      "SELECT id FROM pacientes WHERE id = ?",
      [paciente_id]
    );

    const [profissionalRows]: any = await connection.query(
      "SELECT id FROM profissionais WHERE id = ?",
      [profissional_id]
    );

    if (pacienteRows.length === 0 || profissionalRows.length === 0) {
      await connection.rollback();
      res.status(404).json({ message: "Paciente ou profissional não encontrado" });
      return;
    }

    await connection.query(
      `INSERT INTO atendimentos (paciente_id, profissional_id, dataConsulta, descricao)
       VALUES (?, ?, ?, ?)`,
      [paciente_id, profissional_id, dataConsulta, descricao ?? null]
    );

    await connection.commit();
    res.status(201).json({ message: "Atendimento registrado com sucesso" });
  } catch (error) {
    await connection.rollback();
    console.error("Erro ao registrar atendimento:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  } finally {
    connection.release();
  }
});

app.put("/atendimentos/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { paciente_id, profissional_id, dataConsulta, descricao } = req.body;

    // Checa se o atendimento pertence ao profissional
    const [rows]: any = await db.query(
      "SELECT profissional_id FROM atendimentos WHERE id = ?",
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: "Atendimento não encontrado" });
    }
    if (Number(rows[0].profissional_id) !== Number(profissional_id)) {
      return res.status(403).json({
        message: "Você só pode editar atendimentos feitos por você",
      });
    }

    // Se paciente_id veio no body, atualiza junto; senão atualiza só descricao + data
    if (paciente_id) {
      await db.query(
        `UPDATE atendimentos
           SET paciente_id = ?, dataConsulta = ?, descricao = ?
         WHERE id = ?`,
        [paciente_id, dataConsulta, descricao ?? null, id]
      );
    } else {
      await db.query(
        `UPDATE atendimentos
           SET dataConsulta = ?, descricao = ?
         WHERE id = ?`,
        [dataConsulta, descricao ?? null, id]
      );
    }

    res.json({ message: "Atendimento atualizado com sucesso" });
  } catch (error) {
    console.error("Erro ao atualizar atendimento:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

app.delete("/atendimentos/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const profissionalId = Number(req.query.profissional_id);

    if (!profissionalId) {
      return res.status(400).json({ message: "profissional_id é obrigatório" });
    }

    // Checa se o atendimento pertence ao profissional
    const [rows]: any = await db.query(
      "SELECT profissional_id FROM atendimentos WHERE id = ?",
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: "Atendimento não encontrado" });
    }
    if (Number(rows[0].profissional_id) !== profissionalId) {
      return res.status(403).json({
        message: "Você só pode excluir atendimentos feitos por você",
      });
    }

    await db.query("DELETE FROM atendimentos WHERE id = ?", [id]);
    res.json({ message: "Atendimento excluído com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir atendimento:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});
/* ================= LAUDOS ================= */
app.use("/api/laudos", laudoRoutes);

app.post("/backup/manual", async (req: Request, res: Response) => {
  try {
    await executarBackupLocal();
    res.json({ message: "Backup realizado com sucesso" });
  } catch (error) {
    console.error("Erro ao executar backup manual:", error);
    res.status(500).json({
      message: "Erro ao executar backup manual",
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, senha } = req.body;
    const [rows]: any = await db.query(
      "SELECT * FROM profissionais WHERE email = ? AND senha = ?",
      [email, senha]
    );
    if (rows.length === 0) {
      return res.status(401).json({ message: "Credenciais inválidas" });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error("Erro no login:", error);
    res.status(500).json({ message: "Erro interno" });
  }
});

/* ================= FRONTEND ================= */
app.use(express.static(path.join(__dirname, "../../dist")));
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "../../dist", "index.html"));
});



garantirTabelaLaudos().catch((error) => {
  console.error("Erro ao preparar tabela de laudos:", error);
  process.exit(1);
});

iniciarAgendadorBackup();

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
