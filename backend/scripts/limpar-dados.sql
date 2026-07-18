-- ATENCAO: este script apaga todos os dados principais do sistema.
-- Use somente depois de fazer backup do banco.
--
-- Banco esperado: sistemaapae
-- Execute no MySQL Workbench ou via terminal:
-- mysql -u root -p sistemaapae < backend/scripts/limpar-dados.sql

SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE laudos;
TRUNCATE TABLE atendimentos;
TRUNCATE TABLE pacientes;
TRUNCATE TABLE profissionais;

SET FOREIGN_KEY_CHECKS = 1;
