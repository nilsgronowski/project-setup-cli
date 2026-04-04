import { access } from "node:fs/promises";
import { constants } from "node:fs";
import { join } from "node:path";
import { runCommand } from "../../../../core/run-command.js";

function getPackageJsonPath(projectRoot) {
  return join(projectRoot, "package.json");
}

function getIndexHtmlPath(projectRoot) {
  return join(projectRoot, "index.html");
}

export const createReactProjectStep = {
  id: "create_react_project",
  description: "Initialise React project with Vite",

  async isDone({ projectRoot }) {
    const frontendRoot = join(projectRoot, "frontend");
    try {
      await access(getPackageJsonPath(frontendRoot), constants.F_OK);
      await access(getIndexHtmlPath(frontendRoot), constants.F_OK);
      return true;
    } catch {
      return false;
    }
  },

  async run({ projectRoot, log }) {
    const frontendRoot = join(projectRoot, "frontend");

    log("Scaffolding React app with Vite...");
    await runCommand(
      "npm",
      [
        "create",
        "vite@latest",
        ".",
        "--",
        "--template",
        "react",
        "--no-interactive",
      ],
      {
        cwd: frontendRoot,
        env: {
          ...process.env,
          npm_config_yes: "true",
        },
      },
    );
  },
};
