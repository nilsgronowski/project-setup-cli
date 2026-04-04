import { access, readFile, writeFile } from "node:fs/promises";
import { constants } from "node:fs";
import { join } from "node:path";

function getEnvPath(projectRoot) {
  return join(projectRoot, "backend", ".env");
}

export const writeBackendEnvStep = {
  id: "write_backend_env",
  description: "Write backend environment file",

  async isDone({ projectRoot, config }) {
    try {
      const envPath = getEnvPath(projectRoot);
      await access(envPath, constants.F_OK);
      const expected = getExpectedEnv(config);
      const current = await readFile(envPath, "utf8");
      return current === expected;
    } catch {
      return false;
    }
  },

  async run({ projectRoot, config }) {
    const content = getExpectedEnv(config);
    await writeFile(getEnvPath(projectRoot), content, "utf8");
  },
};

function getExpectedEnv(config) {
  const port =
    typeof config.stack.backend.port === "number"
      ? config.stack.backend.port
      : 3000;
  return `PORT=${port}\n`;
}
