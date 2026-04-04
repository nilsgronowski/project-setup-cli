import { access, readFile, writeFile } from "node:fs/promises";
import { constants } from "node:fs";
import { join } from "node:path";

function getComposePath(projectRoot) {
  return join(projectRoot, "database", "compose.yaml");
}

function getPostgresCompose(port) {
  const effectivePort = typeof port === "number" ? port : 5432;
  return [
    "services:",
    "  db:",
    "    image: postgres:16-alpine",
    "    container_name: app-postgres",
    "    restart: unless-stopped",
    "    env_file:",
    "      - ../.env",
    "    ports:",
    `      - "\${DB_PORT:-${effectivePort}}:5432"`,
    "    volumes:",
    "      - postgres_data:/var/lib/postgresql/data",
    "    healthcheck:",
    '      test: ["CMD-SHELL", "pg_isready -U $${POSTGRES_USER} -d $${POSTGRES_DB}"]',
    "      interval: 10s",
    "      timeout: 5s",
    "      retries: 5",
    "",
    "volumes:",
    "  postgres_data:",
    "",
  ].join("\n");
}

function getMongodbCompose(port) {
  const effectivePort = typeof port === "number" ? port : 27017;
  return [
    "services:",
    "  db:",
    "    image: mongo:7",
    "    container_name: app-mongodb",
    "    restart: unless-stopped",
    "    env_file:",
    "      - ../.env",
    "    ports:",
    `      - "\${DB_PORT:-${effectivePort}}:27017"`,
    "    volumes:",
    "      - mongodb_data:/data/db",
    "    healthcheck:",
    '      test: ["CMD", "mongosh", "--eval", "db.adminCommand(\'ping\')"]',
    "      interval: 10s",
    "      timeout: 5s",
    "      retries: 5",
    "",
    "volumes:",
    "  mongodb_data:",
    "",
  ].join("\n");
}

function getExpectedCompose(config) {
  if (config.stack.database.type === "postgres") {
    return getPostgresCompose(config.stack.database.port);
  }

  return getMongodbCompose(config.stack.database.port);
}

export const writeDatabaseComposeStep = {
  id: "write_database_compose",
  description: "Write database compose configuration",

  async isDone({ projectRoot, config }) {
    try {
      const composePath = getComposePath(projectRoot);
      await access(composePath, constants.F_OK);
      const current = await readFile(composePath, "utf8");
      return current === getExpectedCompose(config);
    } catch {
      return false;
    }
  },

  async run({ projectRoot, config }) {
    await writeFile(
      getComposePath(projectRoot),
      getExpectedCompose(config),
      "utf8",
    );
  },
};
