import fs from "fs";
import fsp from "fs/promises";
import path from "path";
import { db } from "../config/db.js";

const BACKUP_FOLDER_PREFIX = "sistemaapae-backup";
const STATE_FILE = path.resolve(process.cwd(), "backups", "backup-state.json");

type BackupState = {
  lastRunDate?: string;
};

type BackupConfig = {
  enabled: boolean;
  scheduleHour: number;
  scheduleMinute: number;
  retentionDays: number;
  localFolder: string;
};

function parseNumber(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function getBackupConfig(): BackupConfig {
  return {
    enabled: process.env.BACKUP_ENABLED !== "false",
    scheduleHour: parseNumber(process.env.BACKUP_HOUR, 17),
    scheduleMinute: parseNumber(process.env.BACKUP_MINUTE, 0),
    retentionDays: parseNumber(process.env.BACKUP_RETENTION_DAYS, 7),
    localFolder: process.env.BACKUP_LOCAL_FOLDER
      ? path.resolve(process.env.BACKUP_LOCAL_FOLDER)
      : "",
  };
}

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

async function readState(): Promise<BackupState> {
  try {
    const raw = await fsp.readFile(STATE_FILE, "utf8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

async function writeState(state: BackupState) {
  await fsp.mkdir(path.dirname(STATE_FILE), { recursive: true });
  await fsp.writeFile(STATE_FILE, JSON.stringify(state, null, 2));
}

async function exportDatabaseTables(outputDir: string) {
  await fsp.mkdir(outputDir, { recursive: true });

  const [tables]: any = await db.query("SHOW TABLES");

  for (const table of tables) {
    const tableName = Object.values(table)[0];
    if (typeof tableName !== "string") continue;

    const [rows] = await db.query(`SELECT * FROM \`${tableName}\``);
    await fsp.writeFile(
      path.join(outputDir, `${tableName}.json`),
      JSON.stringify(rows, null, 2)
    );
  }
}

async function copyDirectory(sourceDir: string, targetDir: string) {
  if (!fs.existsSync(sourceDir)) return;

  await fsp.mkdir(targetDir, { recursive: true });
  const entries = await fsp.readdir(sourceDir, { withFileTypes: true });

  for (const entry of entries) {
    const sourcePath = path.join(sourceDir, entry.name);
    const targetPath = path.join(targetDir, entry.name);

    if (entry.isDirectory()) {
      await copyDirectory(sourcePath, targetPath);
      continue;
    }

    if (entry.isFile()) {
      await fsp.copyFile(sourcePath, targetPath);
    }
  }
}

async function deleteOldLocalBackups(parentDir: string, retentionDays: number) {
  if (!fs.existsSync(parentDir)) return;

  const limit = new Date();
  limit.setDate(limit.getDate() - retentionDays);

  const entries = await fsp.readdir(parentDir, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory() || !entry.name.startsWith(BACKUP_FOLDER_PREFIX)) {
      continue;
    }

    const match = entry.name.match(/(\d{4}-\d{2}-\d{2})$/);
    if (!match) continue;

    const backupDate = new Date(`${match[1]}T00:00:00`);
    if (backupDate < limit) {
      await fsp.rm(path.join(parentDir, entry.name), { recursive: true, force: true });
    }
  }
}

export async function executarBackupLocal() {
  const config = getBackupConfig();

  if (!config.enabled) return;
  if (!config.localFolder) {
    throw new Error("BACKUP_LOCAL_FOLDER nao configurado");
  }

  const today = formatDate(new Date());
  const backupName = `${BACKUP_FOLDER_PREFIX}-${today}`;
  const tempDir = path.resolve(process.cwd(), "backups", backupName);
  const dataDir = path.join(tempDir, "dados");
  const laudosDir = path.resolve(process.cwd(), "uploads", "laudos");
  const localBackupDir = path.join(config.localFolder, backupName);

  await fsp.rm(tempDir, { recursive: true, force: true });
  await exportDatabaseTables(dataDir);

  await fsp.mkdir(config.localFolder, { recursive: true });
  await fsp.rm(localBackupDir, { recursive: true, force: true });
  await fsp.mkdir(path.join(localBackupDir, "dados"), { recursive: true });
  await fsp.mkdir(path.join(localBackupDir, "laudos"), { recursive: true });
  await copyDirectory(dataDir, path.join(localBackupDir, "dados"));
  await copyDirectory(laudosDir, path.join(localBackupDir, "laudos"));
  await deleteOldLocalBackups(config.localFolder, config.retentionDays);
  await fsp.rm(tempDir, { recursive: true, force: true });
  await writeState({ lastRunDate: today });
}

function reachedBackupTime(now: Date, config: BackupConfig) {
  return (
    now.getHours() > config.scheduleHour ||
    (now.getHours() === config.scheduleHour &&
      now.getMinutes() >= config.scheduleMinute)
  );
}

export function iniciarAgendadorBackup() {
  const config = getBackupConfig();

  if (!config.enabled) {
    console.log("Backup local desativado");
    return;
  }

  if (!config.localFolder) {
    console.log("Backup local nao iniciado: configure BACKUP_LOCAL_FOLDER");
    return;
  }

  console.log(
    `Backup local agendado para ${String(config.scheduleHour).padStart(2, "0")}:${String(config.scheduleMinute).padStart(2, "0")}`
  );

  const verificarBackup = async () => {
    const now = new Date();
    const today = formatDate(now);
    const state = await readState();

    if (state.lastRunDate === today || !reachedBackupTime(now, config)) {
      return;
    }

    try {
      console.log("Iniciando backup local...");
      await executarBackupLocal();
      console.log("Backup local finalizado");
    } catch (error) {
      console.error("Erro ao executar backup local:", error);
    }
  };

  verificarBackup();
  setInterval(verificarBackup, 60 * 1000);
}
