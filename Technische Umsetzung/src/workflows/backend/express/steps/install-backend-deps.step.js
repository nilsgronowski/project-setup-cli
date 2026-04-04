import { access, readFile } from "node:fs/promises";
import { constants } from "node:fs";
import { join } from "node:path";
import { runCommand } from "../../../../core/run-command.js";

function getInstallStampPath(projectRoot) {
  return join(projectRoot, "backend", "package-lock.json");
}

function getPackageJsonPath(projectRoot) {
  return join(projectRoot, "backend", "package.json");
}

function getNodeModulesPath(projectRoot) {
  return join(projectRoot, "backend", "node_modules");
}

export const installBackendDepsStep = {
  id: "install_backend_deps",
  description: "Install backend dependencies",

  async isDone({ projectRoot }) {
    try {
      await access(getInstallStampPath(projectRoot), constants.F_OK);
      await access(getNodeModulesPath(projectRoot), constants.F_OK);

      const packageJson = JSON.parse(
        await readFile(getPackageJsonPath(projectRoot), "utf8"),
      );

      return Boolean(packageJson.dependencies?.dotenv);
    } catch {
      return false;
    }
  },

  async run({ projectRoot }) {
    const backendRoot = join(projectRoot, "backend");

    await runCommand("npm", ["install"], {
      cwd: backendRoot,
      env: {
        ...process.env,
        npm_config_yes: "true",
      },
    });

    await runCommand("npm", ["install", "dotenv"], {
      cwd: backendRoot,
      env: {
        ...process.env,
        npm_config_yes: "true",
      },
    });
  },
};
