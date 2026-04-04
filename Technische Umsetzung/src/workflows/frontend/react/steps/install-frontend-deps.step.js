import { access } from "node:fs/promises";
import { constants } from "node:fs";
import { join } from "node:path";
import { runCommand } from "../../../../core/run-command.js";

function getInstallStampPath(projectRoot) {
  return join(projectRoot, "frontend", "package-lock.json");
}

export const installFrontendDepsStep = {
  id: "install_frontend_deps",
  description: "Install frontend dependencies",

  async isDone({ projectRoot }) {
    try {
      await access(getInstallStampPath(projectRoot), constants.F_OK);
      return true;
    } catch {
      return false;
    }
  },

  async run({ projectRoot }) {
    const frontendRoot = join(projectRoot, "frontend");
    await runCommand("npm", ["install"], {
      cwd: frontendRoot,
      env: {
        ...process.env,
        npm_config_yes: "true",
      },
    });
  },
};
