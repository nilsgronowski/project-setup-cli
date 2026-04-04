import { access, readFile, writeFile } from "node:fs/promises";
import { constants } from "node:fs";
import { join } from "node:path";

function getEnvPath(projectRoot) {
  return join(projectRoot, "frontend", ".env");
}

export const writeFrontendEnvStep = {
  id: "write_frontend_env",
  description: "Write frontend environment file",

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
    const content = getExpectedEnv(config);
    await writeFile(getEnvPath(projectRoot), content, "utf8");
  },
};

function getExpectedEnv(config) {
  const port =
    typeof config.stack.frontend.port === "number"
      ? config.stack.frontend.port
      : 5173;
  return [
    "# Local development port.",
    "# In Docker this is overridden by FRONTEND_PORT from the root .env.",
    `PORT=${port}`,
    "",
  ].join("\n");
}
