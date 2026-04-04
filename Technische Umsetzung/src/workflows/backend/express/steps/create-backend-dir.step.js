import { access, mkdir } from "node:fs/promises";
import { constants } from "node:fs";
import { join } from "node:path";

function getBackendDirPath(projectRoot) {
  return join(projectRoot, "backend");
}

export const createBackendDirStep = {
  id: "create_backend_dir",
  description: "Create backend directory",

  async isDone({ projectRoot }) {
    try {
      await access(getBackendDirPath(projectRoot), constants.F_OK);
      return true;
    } catch {
      return false;
    }
  },

  async run({ projectRoot, log }) {
    await mkdir(getBackendDirPath(projectRoot), { recursive: true });
    log("Created backend directory");
  },
};
