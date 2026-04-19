import { Request, Response } from "express";
import { db } from "../config/db.js";
import fs from "fs";
import path from "path";


export async function salvarLaudo(req: Request, res: Response) {
    try {
        const pacienteId = req.params.pacienteId;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ message: "Arquivo não enviado" });
        }

        await db.query(
            `INSERT INTO laudos 
       (paciente_id, nome_arquivo, caminho_arquivo, tamanho, tipo) 
       VALUES (?, ?, ?, ?, ?)`,
            [
                pacienteId,
                file.originalname,
                file.path,
                file.size,
                file.mimetype,
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
            "SELECT caminho_arquivo FROM laudos WHERE id = ?",
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: "Laudo não encontrado" });
        }

        const filePath = path.resolve(rows[0].caminho_arquivo);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: "Arquivo não encontrado no servidor" });
        }

        res.sendFile(filePath);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erro ao visualizar laudo" });
    }
}