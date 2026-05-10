import multer from "multer";
import path from "path";
import fs from "fs";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const pacienteId = req.params.pacienteId || "sem-paciente";
    const pasta = path.resolve(process.cwd(), "uploads", "laudos", `paciente-${pacienteId}`);
    fs.mkdirSync(pasta, { recursive: true });
    cb(null, pasta);
  },
  filename: (req, file, cb) => {
    const nomeSeguro = file.originalname
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9._-]/g, "_");
    const uniqueName = `${Date.now()}-${nomeSeguro}`;
    cb(null, uniqueName);
  },
});

export const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Apenas PDF é permitido"));
    }
  },
});
