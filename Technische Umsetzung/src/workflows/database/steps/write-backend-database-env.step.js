import { access, readFile, writeFile } from "node:fs/promises";
import { constants } from "node:fs";
import { join } from "node:path";

function getBackendEnvPath(projectRoot) {
  return join(projectRoot, "backend", ".env");
}

function getDatabaseConfig(config) {
  const type = config.stack.database.type;
  const configuredPort = config.stack.database.port;
  const defaultPort = type === "postgres" ? 5432 : 27017;
  const port =
    typeof configuredPort === "number" ? configuredPort : defaultPort;

  if (type === "postgres") {
    return {
      DB_TYPE: "postgres",
      DB_HOST: "localhost",
      DB_PORT: String(port),
      DB_NAME: "app",
      DB_USER: "app",
      DB_PASSWORD: "app",
      DATABASE_URL: `postgresql://app:app@localhost:${port}/app`,
    };
  }

  return {
    DB_TYPE: "mongodb",
    DB_HOST: "localhost",
    DB_PORT: String(port),
    DB_NAME: "app",
    DB_USER: "app",
    DB_PASSWORD: "app",
    DATABASE_URL: `mongodb://app:app@localhost:${port}/app?authSource=admin`,
  };
}

function upsertEnvValue(content, key, value) {
  const line = `${key}=${value}`;
  const regex = new RegExp(`^${key}=.*$`, "m");

  if (regex.test(content)) {
    return content.replace(regex, line);
  }

  const trimmed = content.trimEnd();
  if (trimmed.length === 0) {
    return `${line}\n`;
  }

  return `${trimmed}\n${line}\n`;
}

function withDatabaseValues(baseContent, config) {
  const dbConfig = getDatabaseConfig(config);
  let content = baseContent;

  for (const [key, value] of Object.entries(dbConfig)) {
    content = upsertEnvValue(content, key, value);
  }

  return content;
}

export const writeBackendDatabaseEnvStep = {
  id: "write_backend_database_env",
  description: "Sync database settings into backend env",

  async isDone({ projectRoot, config }) {
    try {
      const envPath = getBackendEnvPath(projectRoot);
      await access(envPath, constants.F_OK);
      const current = await readFile(envPath, "utf8");
      const expected = withDatabaseValues(current, config);
      return current === expected;
    } catch {
      return false;
    }
  },

  async run({ projectRoot, config }) {
    const envPath = getBackendEnvPath(projectRoot);
    let current = "";

    try {
      current = await readFile(envPath, "utf8");
    } catch {
      current = "";
    }

    const next = withDatabaseValues(current, config);
    await writeFile(envPath, next, "utf8");
  },
};
