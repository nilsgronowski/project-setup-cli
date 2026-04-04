import { access, mkdir } from "node:fs/promises";
import { constants } from "node:fs";

export const checkTargetDirStep = {
  id: "check_target_dir",
  description: "Ensure project directory exists",

  async isDone({ projectRoot }) {
    try {
      await access(projectRoot, constants.F_OK);
      return true;
    } catch {
      return false;
    }
  },

  async run({ projectRoot }) {
    await mkdir(projectRoot, { recursive: true });
  },
};
