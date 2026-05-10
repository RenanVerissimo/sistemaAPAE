import fs from "fs";
import fsp from "fs/promises";
import path from "path";
import { spawn } from "child_process";
import { finished } from "stream/promises";
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
  mysqlDumpPath: string;
  mysqlHost: string;
  mysqlUser: string;
  mysqlPassword: string;
  mysqlDatabase: string;
};

function readBackupEnv() {
  const envPath = path.resolve(process.cwd(), ".env");
  const values: Record<string, string> = {};

  if (!fs.existsSync(envPath)) {
    return values;
  }

  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    values[key] = value;
  }

  return values;
}

function parseNumber(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function getBackupConfig(): BackupConfig {
  const env = { ...process.env, ...readBackupEnv() };

  return {
    enabled: env.BACKUP_ENABLED !== "false",
    scheduleHour: parseNumber(env.BACKUP_HOUR, 17),
    scheduleMinute: parseNumber(env.BACKUP_MINUTE, 0),
    retentionDays: parseNumber(env.BACKUP_RETENTION_DAYS, 7),
    localFolder: env.BACKUP_LOCAL_FOLDER
      ? path.resolve(env.BACKUP_LOCAL_FOLDER)
      : "",
    mysqlDumpPath: env.MYSQLDUMP_PATH || "mysqldump",
    mysqlHost: env.MYSQL_HOST || "localhost",
    mysqlUser: env.MYSQL_USER || "root",
    mysqlPassword: env.MYSQL_PASSWORD || "",
    mysqlDatabase: env.MYSQL_DATABASE || "",
  };
}

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDateTime(date: Date) {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${formatDate(date)}_${hours}-${minutes}-${seconds}`;
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

async function removePathWithRetry(targetPath: string, retries = 5) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      await fsp.rm(targetPath, {
        recursive: true,
        force: true,
        maxRetries: 3,
        retryDelay: 300,
      });
      return;
    } catch (error: any) {
      if (attempt === retries || !["ENOTEMPTY", "EPERM", "EBUSY"].includes(error?.code)) {
        throw error;
      }

      await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
    }
  }
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

async function exportMysqlDump(outputDir: string, config: BackupConfig) {
  if (!config.mysqlDatabase) {
    throw new Error("MYSQL_DATABASE nao configurado");
  }

  await fsp.mkdir(outputDir, { recursive: true });

  const outputPath = path.join(outputDir, `${config.mysqlDatabase}.sql`);
  const outputStream = fs.createWriteStream(outputPath);
  const args = [
    "--host",
    config.mysqlHost,
    "--user",
    config.mysqlUser,
    "--single-transaction",
    "--routines",
    "--triggers",
    "--events",
    "--databases",
    config.mysqlDatabase,
  ];

  const child = spawn(config.mysqlDumpPath, args, {
    env: {
      ...process.env,
      MYSQL_PWD: config.mysqlPassword,
    },
    windowsHide: true,
  });

  let stderr = "";
  child.stdout.pipe(outputStream);
  child.stderr.on("data", (chunk) => {
    stderr += chunk.toString();
  });

  const exitCode = await new Promise<number | null>((resolve, reject) => {
    child.on("error", reject);
    child.on("close", resolve);
  });

  await finished(outputStream);

  if (exitCode !== 0) {
    throw new Error(
      `mysqldump falhou com codigo ${exitCode}${stderr ? `: ${stderr}` : ""}`
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

    const match = entry.name.match(/(\d{4}-\d{2}-\d{2})/);
    if (!match) continue;

    const backupDate = new Date(`${match[1]}T00:00:00`);
    if (backupDate < limit) {
      await removePathWithRetry(path.join(parentDir, entry.name));
    }
  }
}

async function deleteLocalBackupsFromDate(parentDir: string, date: string) {
  if (!fs.existsSync(parentDir)) return;

  const entries = await fsp.readdir(parentDir, { withFileTypes: true });
  const backupNamePrefix = `${BACKUP_FOLDER_PREFIX}-${date}`;

  for (const entry of entries) {
    if (entry.isDirectory() && entry.name.startsWith(backupNamePrefix)) {
      await removePathWithRetry(path.join(parentDir, entry.name));
    }
  }
}

export async function executarBackupLocal() {
  const config = getBackupConfig();

  if (!config.enabled) return;
  if (!config.localFolder) {
    throw new Error("BACKUP_LOCAL_FOLDER nao configurado");
  }

  const now = new Date();
  const today = formatDate(now);
  const backupName = `${BACKUP_FOLDER_PREFIX}-${formatDateTime(now)}`;
  const tempDir = path.resolve(process.cwd(), "backups", backupName);
  const dataDir = path.join(tempDir, "dados");
  const mysqlDir = path.join(tempDir, "mysql");
  const laudosDir = path.resolve(process.cwd(), "uploads", "laudos");
  const localBackupDir = path.join(config.localFolder, backupName);

  await removePathWithRetry(tempDir);
  await exportDatabaseTables(dataDir);
  await exportMysqlDump(mysqlDir, config);

  await fsp.mkdir(config.localFolder, { recursive: true });
  await deleteLocalBackupsFromDate(config.localFolder, today);
  await fsp.mkdir(path.join(localBackupDir, "dados"), { recursive: true });
  await fsp.mkdir(path.join(localBackupDir, "mysql"), { recursive: true });
  await fsp.mkdir(path.join(localBackupDir, "laudos"), { recursive: true });
  await copyDirectory(dataDir, path.join(localBackupDir, "dados"));
  await copyDirectory(mysqlDir, path.join(localBackupDir, "mysql"));
  await copyDirectory(laudosDir, path.join(localBackupDir, "laudos"));
  await deleteOldLocalBackups(config.localFolder, config.retentionDays);
  await removePathWithRetry(tempDir);
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
  let config = getBackupConfig();

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
    config = getBackupConfig();

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
