import { access, mkdir } from "node:fs/promises";
import { constants } from "node:fs";
import { join } from "node:path";

function getDatabaseDirPath(projectRoot) {
  return join(projectRoot, "database");
}

export const createDatabaseDirStep = {
  id: "create_database_dir",
  description: "Create database directory",

  async isDone({ projectRoot }) {
    try {
      await access(getDatabaseDirPath(projectRoot), constants.F_OK);
      return true;
    } catch {
      return false;
    }
  },

  async run({ projectRoot, log }) {
    await mkdir(getDatabaseDirPath(projectRoot), { recursive: true });
    log("Created database directory");
  },
};
