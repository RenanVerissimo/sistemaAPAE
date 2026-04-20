import express, { Request, Response } from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { db } from "./config/db.js";
import laudoRoutes from "./routes/laudoRoute.js";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

/* ================= PACIENTES ================= */

app.get("/pacientes", async (req: Request, res: Response) => {
  try {
    const [rows] = await db.query("SELECT * FROM pacientes");
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
      status, descricao, qtdConsultasRealizadas,
    } = req.body;

    await db.query(
      `INSERT INTO pacientes
        (nome, cpf, prontuario, dataNasc, cartaoSUS, status, descricao, qtdConsultasRealizadas)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nome, cpf, prontuario, dataNasc, cartaoSUS,
        status ?? "Ativo", descricao ?? null, qtdConsultasRealizadas ?? 0,
      ]
    );
    res.status(201).json({ message: "Paciente cadastrado com sucesso" });
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
      status, descricao, qtdConsultasRealizadas,
    } = req.body;

    await db.query(
      `UPDATE pacientes
         SET nome = ?, cpf = ?, prontuario = ?, dataNasc = ?, cartaoSUS = ?,
             status = ?, descricao = ?, qtdConsultasRealizadas = ?
       WHERE id = ?`,
      [
        nome, cpf, prontuario, dataNasc, cartaoSUS,
        status ?? "Ativo", descricao ?? null, qtdConsultasRealizadas ?? 0, id,
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
    const [rows] = await db.query(
      "SELECT * FROM profissionais WHERE rolee <> 'SECRETARIA'"
    );
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
      outraEspecialidade, registroProfissional, rolee, qtdAtendimentos,
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

    const qtd = Number(qtdAtendimentos) || 0;

    const [result]: any = await db.query(
      `INSERT INTO profissionais
        (nome, email, dataNasc, senha, especialidade, outraEspecialidade,
         registroProfissional, rolee, qtdAtendimentos)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nome, email, dataNasc, senha, especialidade,
        outraEspecialidade || null, registroProfissional || null,
        rolee || "PROFISSIONAL", qtd,
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
      outraEspecialidade, registroProfissional, qtdAtendimentos,
    } = req.body;

    await db.query(
      `UPDATE profissionais
         SET nome = ?, email = ?, dataNasc = ?, especialidade = ?,
             outraEspecialidade = ?, registroProfissional = ?, qtdAtendimentos = ?
       WHERE id = ?`,
      [
        nome, email, dataNasc, especialidade,
        outraEspecialidade || null, registroProfissional || null,
        Number(qtdAtendimentos) || 0, id,
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

/* ================= ATENDIMENTOS ================= */

app.get("/atendimentos", async (req: Request, res: Response) => {
  try {
    const { paciente, profissional, dataInicio, dataFim } = req.query;

    let query = `
      SELECT
        a.id,
        p.nome   AS nomePaciente,
        pr.nome  AS nomeProfissional,
        pr.especialidade AS especialidade,
        a.dataConsulta,
        a.descricao,
        a.createdAt
      FROM atendimentos a
      JOIN pacientes p       ON a.paciente_id = p.id
      JOIN profissionais pr  ON a.profissional_id = pr.id
      WHERE 1=1
    `;

    const params: any[] = [];

    if (paciente) { query += " AND p.nome LIKE ?"; params.push(`%${paciente}%`); }
    if (profissional) { query += " AND pr.nome LIKE ?"; params.push(`%${profissional}%`); }
    if (dataInicio) { query += " AND a.dataConsulta >= ?"; params.push(dataInicio); }
    if (dataFim) { query += " AND a.dataConsulta <= ?"; params.push(dataFim); }

    query += " ORDER BY a.dataConsulta DESC, a.createdAt DESC";

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error("Erro ao buscar atendimentos:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

app.post("/atendimentos", async (req: Request, res: Response) => {
  try {
    const { paciente_id, profissional_id, dataConsulta, descricao } = req.body;

    if (!paciente_id || !profissional_id || !dataConsulta) {
      res.status(400).json({ message: "Campos obrigatórios não preenchidos" });
      return;
    }

    await db.query(
      `INSERT INTO atendimentos (paciente_id, profissional_id, dataConsulta, descricao)
       VALUES (?, ?, ?, ?)`,
      [paciente_id, profissional_id, dataConsulta, descricao ?? null]
    );

    res.status(201).json({ message: "Atendimento registrado com sucesso" });
  } catch (error) {
    console.error("Erro ao registrar atendimento:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

app.put("/atendimentos/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { paciente_id, profissional_id, dataConsulta, descricao } = req.body;

    await db.query(
      `UPDATE atendimentos
         SET paciente_id = ?, profissional_id = ?, dataConsulta = ?, descricao = ?
       WHERE id = ?`,
      [paciente_id, profissional_id, dataConsulta, descricao ?? null, id]
    );
    res.json({ message: "Atendimento atualizado com sucesso" });
  } catch (error) {
    console.error("Erro ao atualizar atendimento:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

app.delete("/atendimentos/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM atendimentos WHERE id = ?", [id]);
    res.json({ message: "Atendimento excluído com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir atendimento:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

/* ================= LAUDOS ================= */
//app.use("/api/laudos", laudoRoutes);

/* ================= FRONTEND ================= */
app.use(express.static(path.join(__dirname, "../../dist")));
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "../../dist", "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});