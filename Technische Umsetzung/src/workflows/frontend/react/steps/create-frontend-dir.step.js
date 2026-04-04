import { access, mkdir } from "node:fs/promises";
import { constants } from "node:fs";
import { join } from "node:path";

function getFrontendDirPath(projectRoot) {
  return join(projectRoot, "frontend");
}

export const createFrontendDirStep = {
  id: "create_frontend_dir",
  description: "Create frontend directory",

  async isDone({ projectRoot }) {
    try {
      await access(getFrontendDirPath(projectRoot), constants.F_OK);
      return true;
    } catch {
      return false;
    }
  },

  async run({ projectRoot, log }) {
    const frontendDir = getFrontendDirPath(projectRoot);
    await mkdir(frontendDir, { recursive: true });
    log("Created frontend directory");
  },
};
