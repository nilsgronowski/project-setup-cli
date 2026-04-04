import { access, readFile, writeFile } from "node:fs/promises";
import { constants } from "node:fs";
import { join } from "node:path";

function getEnvExamplePath(projectRoot) {
  return join(projectRoot, ".env.example");
}

function getExampleEnv(config) {
  const type = config.stack.database.type;
  const lines = [
    "# Shared environment variables and secrets",
    "# Copy this file to .env and fill in the values.",
    "",
    "FRONTEND_PORT=5173",
    "BACKEND_PORT=" + (config.stack.backend.type === "django" ? "8000" : "3000"),
    `DB_TYPE=${type}`,
    "DB_HOST=localhost",
    "DB_PORT=" + (type === "postgres" ? "5432" : "27017"),
    "DB_NAME=your_database_name",
    "DB_USER=your_database_user",
    "DB_PASSWORD=your_database_password",
  ];

  if (type === "postgres") {
    lines.push(
      "POSTGRES_DB=your_database_name",
      "POSTGRES_USER=your_database_user",
      "POSTGRES_PASSWORD=your_database_password",
      "DATABASE_URL=postgresql://your_database_user:your_database_password@localhost:5432/your_database_name",
    );
  } else {
    lines.push(
      "MONGO_INITDB_DATABASE=your_database_name",
      "MONGO_INITDB_ROOT_USERNAME=your_database_user",
      "MONGO_INITDB_ROOT_PASSWORD=your_database_password",
      "DATABASE_URL=mongodb://your_database_user:your_database_password@localhost:27017/your_database_name?authSource=admin",
    );
  }

  return `${lines.join("\n")}\n`;
}

function getEnvPath(projectRoot) {
  return join(projectRoot, ".env");
}

function getExpectedEnv(config) {
  const type = config.stack.database.type;
  const configuredPort = config.stack.database.port;
  const credentials = config.stack.database.credentials;
  const defaultPort = type === "postgres" ? 5432 : 27017;
  const port =
    typeof configuredPort === "number" ? configuredPort : defaultPort;
  const frontendPort =
    typeof config.stack.frontend.port === "number"
      ? config.stack.frontend.port
      : 5173;
  const backendPort =
    typeof config.stack.backend.port === "number"
      ? config.stack.backend.port
      : config.stack.backend.type === "django"
        ? 8000
        : 3000;
  const lines = [
    "# Shared environment variables and secrets",
    `FRONTEND_PORT=${frontendPort}`,
    `BACKEND_PORT=${backendPort}`,
    `DB_TYPE=${type}`,
    "DB_HOST=localhost",
    `DB_PORT=${port}`,
    `DB_NAME=${credentials.name}`,
    `DB_USER=${credentials.user}`,
    `DB_PASSWORD=${credentials.password}`,
  ];

  if (type === "postgres") {
    lines.push(
      `POSTGRES_DB=${credentials.name}`,
      `POSTGRES_USER=${credentials.user}`,
      `POSTGRES_PASSWORD=${credentials.password}`,
    );
    lines.push(
      `DATABASE_URL=postgresql://${credentials.user}:${credentials.password}@localhost:${port}/${credentials.name}`,
    );
  } else {
    lines.push(
      `MONGO_INITDB_DATABASE=${credentials.name}`,
      `MONGO_INITDB_ROOT_USERNAME=${credentials.user}`,
      `MONGO_INITDB_ROOT_PASSWORD=${credentials.password}`,
    );
    lines.push(
      `DATABASE_URL=mongodb://${credentials.user}:${credentials.password}@localhost:${port}/${credentials.name}?authSource=admin`,
    );
  }

  return `${lines.join("\n")}\n`;
}

export const writeDatabaseEnvStep = {
  id: "write_database_env",
  description: "Write shared project environment file",

  async isDone({ projectRoot, config }) {
    try {
      const envPath = getEnvPath(projectRoot);
      await access(envPath, constants.F_OK);
      const current = await readFile(envPath, "utf8");
      return current === getExpectedEnv(config);
    } catch {
      return false;
    }
  },

  async run({ projectRoot, config }) {
    await writeFile(getEnvPath(projectRoot), getExpectedEnv(config), "utf8");
    await writeFile(getEnvExamplePath(projectRoot), getExampleEnv(config), "utf8");
  },
};
