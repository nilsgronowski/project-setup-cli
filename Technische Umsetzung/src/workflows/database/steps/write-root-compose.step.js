import { access, readFile, writeFile } from "node:fs/promises";
import { constants } from "node:fs";
import { join } from "node:path";

function getRootComposePath(projectRoot) {
  return join(projectRoot, "compose.yaml");
}

function resolvePorts(config) {
  const frontendPort =
    typeof config.stack.frontend.port === "number"
      ? config.stack.frontend.port
      : 5173;
  const backendPort =
    typeof config.stack.backend.port === "number"
      ? config.stack.backend.port
      : 3000;
  const databaseType = config.stack.database.type;
  const databasePort =
    typeof config.stack.database.port === "number"
      ? config.stack.database.port
      : databaseType === "postgres"
        ? 5432
        : 27017;

  return { frontendPort, backendPort, databasePort, databaseType };
}

function getDatabaseServiceBlock(databaseType, databasePort, projectName) {
  if (databaseType === "postgres") {
    return [
      "  db:",
      `    container_name: ${projectName}-db`,
      "    image: postgres:16-alpine",
      "    restart: unless-stopped",
      "    env_file:",
      "      - ./.env",
      "    ports:",
      `      - "\${DB_PORT:-${databasePort}}:5432"`,
      "    volumes:",
      "      - postgres_data:/var/lib/postgresql/data",
      "    healthcheck:",
      '      test: ["CMD-SHELL", "pg_isready -U $${POSTGRES_USER} -d $${POSTGRES_DB}"]',
      "      interval: 10s",
      "      timeout: 5s",
      "      retries: 5",
    ].join("\n");
  }

  return [
    "  db:",
    `    container_name: ${projectName}-db`,
    "    image: mongo:7",
    "    restart: unless-stopped",
    "    env_file:",
    "      - ./.env",
    "    ports:",
    `      - "\${DB_PORT:-${databasePort}}:27017"`,
    "    volumes:",
    "      - mongodb_data:/data/db",
    "    healthcheck:",
    '      test: ["CMD", "mongosh", "--eval", "db.adminCommand(\'ping\')"]',
    "      interval: 10s",
    "      timeout: 5s",
    "      retries: 5",
  ].join("\n");
}

function getBackendDatabaseEnv(databaseType) {
  if (databaseType === "postgres") {
    return [
      "      DB_HOST: db",
      '      DB_PORT: "5432"',
      "      DATABASE_URL: postgresql://${DB_USER}:${DB_PASSWORD}@db:5432/${DB_NAME}",
    ].join("\n");
  }

  return [
    "      DB_HOST: db",
    '      DB_PORT: "27017"',
    "      DATABASE_URL: mongodb://${DB_USER}:${DB_PASSWORD}@db:27017/${DB_NAME}?authSource=admin",
  ].join("\n");
}

function getVolumeBlock(databaseType) {
  if (databaseType === "postgres") {
    return ["volumes:", "  postgres_data:", ""].join("\n");
  }

  return ["volumes:", "  mongodb_data:", ""].join("\n");
}

function getExpectedCompose(config) {
  const { frontendPort, backendPort, databasePort, databaseType } =
    resolvePorts(config);
  const projectName = config.project.name;

  return [
    "services:",
    "  frontend:",
    `    container_name: ${projectName}-frontend`,
    "    build:",
    "      context: ./frontend",
    "      args:",
    `        FRONTEND_PORT: "\${FRONTEND_PORT:-${frontendPort}}"`,
    "    working_dir: /app",
    "    ports:",
    `      - "\${FRONTEND_PORT:-${frontendPort}}:\${FRONTEND_PORT:-${frontendPort}}"`,
    "    env_file:",
    "      - ./.env",
    "      - ./frontend/.env",
    "    environment:",
    `      FRONTEND_PORT: "\${FRONTEND_PORT:-${frontendPort}}"`,
    `      PORT: "\${FRONTEND_PORT:-${frontendPort}}"`,
    '    command: sh -c "npm run dev -- --host 0.0.0.0 --port $${FRONTEND_PORT:-5173}"',
    "    depends_on:",
    "      - backend",
    "",
    "  backend:",
    `    container_name: ${projectName}-backend`,
    "    build:",
    "      context: ./backend",
    "    working_dir: /app",
    "    ports:",
    `      - "\${BACKEND_PORT:-${backendPort}}:\${BACKEND_PORT:-${backendPort}}"`,
    "    env_file:",
    "      - ./.env",
    "      - ./backend/.env",
    "    environment:",
    `      PORT: "\${BACKEND_PORT:-${backendPort}}"`,
    getBackendDatabaseEnv(databaseType),
    "    depends_on:",
    "      db:",
    "        condition: service_healthy",
    "",
    getDatabaseServiceBlock(databaseType, databasePort, projectName),
    "",
    getVolumeBlock(databaseType),
  ].join("\n");
}

export const writeRootComposeStep = {
  id: "write_root_compose",
  description: "Write root compose configuration",

  async isDone({ projectRoot, config }) {
    try {
      const composePath = getRootComposePath(projectRoot);
      await access(composePath, constants.F_OK);
      const current = await readFile(composePath, "utf8");
      return current === getExpectedCompose(config);
    } catch {
      return false;
    }
  },

  async run({ projectRoot, config }) {
    await writeFile(
      getRootComposePath(projectRoot),
      getExpectedCompose(config),
      "utf8",
    );
  },
};
