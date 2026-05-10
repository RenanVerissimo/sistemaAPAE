import { Router } from "express";
import { upload } from "../config/multer.js";
import {
  excluirLaudo,
  listarLaudos,
  salvarLaudo,
  visualizarLaudo,
} from "../controllers/laudo.controller.js";

const router = Router();

router.get("/paciente/:pacienteId", listarLaudos);
router.post("/:pacienteId", upload.single("pdf"), salvarLaudo);
router.get("/arquivo/:id", visualizarLaudo);
router.delete("/:id", excluirLaudo);

export default router;
