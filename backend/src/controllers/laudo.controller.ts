import { Request, Response } from "express";
import { db } from "../config/db.js";
import fs from "fs";
import path from "path";

export async function listarLaudos(req: Request, res: Response) {
  try {
    const pacienteId = req.params.pacienteId;

    const [rows] = await db.query(
      `SELECT id,
              paciente_id AS pacienteId,
              nome_arquivo AS nomeArquivo,
              caminho_arquivo AS caminhoArquivo,
              tamanho,
              tipo,
              observacao,
              created_at AS createdAt
         FROM laudos
        WHERE paciente_id = ?
        ORDER BY created_at DESC, id DESC`,
      [pacienteId]
    );

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao listar laudos" });
  }
}

export async function salvarLaudo(req: Request, res: Response) {
  try {
    const pacienteId = req.params.pacienteId;
    const file = req.file;
    const { observacao } = req.body;

    if (!file) {
      return res.status(400).json({ message: "Arquivo nao enviado" });
    }

    await db.query(
      `INSERT INTO laudos
        (paciente_id, nome_arquivo, caminho_arquivo, tamanho, tipo, observacao)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        pacienteId,
        file.originalname,
        file.path,
        file.size,
        file.mimetype,
        observacao || null,
      ]
    );

    res.status(201).json({ message: "Laudo enviado com sucesso" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao salvar laudo" });
  }
}

export async function visualizarLaudo(req: Request, res: Response) {
  try {
    const id = req.params.id;

    const [rows]: any = await db.query(
      "SELECT caminho_arquivo, nome_arquivo FROM laudos WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Laudo nao encontrado" });
    }

    const filePath = path.resolve(rows[0].caminho_arquivo);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "Arquivo nao encontrado no servidor" });
    }

    const disposition = req.query.download === "1" ? "attachment" : "inline";
    res.setHeader("Content-Disposition", `${disposition}; filename="${rows[0].nome_arquivo}"`);
    res.sendFile(filePath);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao visualizar laudo" });
  }
}

export async function excluirLaudo(req: Request, res: Response) {
  try {
    const id = req.params.id;

    const [rows]: any = await db.query(
      "SELECT caminho_arquivo FROM laudos WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Laudo nao encontrado" });
    }

    const filePath = path.resolve(rows[0].caminho_arquivo);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await db.query("DELETE FROM laudos WHERE id = ?", [id]);
    res.json({ message: "Laudo excluido com sucesso" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao excluir laudo" });
  }
}
