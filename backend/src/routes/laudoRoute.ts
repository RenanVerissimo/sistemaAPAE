import { Router } from "express";
import { upload } from "../config/multer.js";
import { salvarLaudo } from "../controllers/laudo.controller.js";
import { visualizarLaudo } from "../controllers/laudo.controller.js";

const router = Router();

router.post(
  "/:pacienteId",
  upload.single("pdf"),
  salvarLaudo
);


router.get("/arquivo/:id", visualizarLaudo);

export default router;