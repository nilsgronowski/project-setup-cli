import { access, readFile, writeFile } from "node:fs/promises";
import { constants } from "node:fs";
import { join } from "node:path";
import { runCommand } from "../../../../core/run-command.js";

function getBackendRoot(projectRoot) {
  return join(projectRoot, "backend");
}

function getPackageJsonPath(projectRoot) {
  return join(getBackendRoot(projectRoot), "package.json");
}

function getAppPath(projectRoot) {
  return join(getBackendRoot(projectRoot), "app.js");
}

function getBinWwwPath(projectRoot) {
  return join(getBackendRoot(projectRoot), "bin", "www");
}

function getIndexRoutePath(projectRoot) {
  return join(getBackendRoot(projectRoot), "routes", "index.js");
}

function getUsersRoutePath(projectRoot) {
  return join(getBackendRoot(projectRoot), "routes", "users.js");
}

function getPublicIndexPath(projectRoot) {
  return join(getBackendRoot(projectRoot), "public", "index.html");
}

function getGitignorePath(projectRoot) {
  return join(getBackendRoot(projectRoot), ".gitignore");
}

const ROOT_DOTENV_BOOTSTRAP = [
  'const path = require("node:path");',
  'require("dotenv").config({ path: path.resolve(__dirname, "..", ".env") });',
  'require("dotenv").config();',
].join("\n");
const DOTENV_REQUIRE_REGEX = /require\((['"])dotenv\1\)\.config\(([^)]*)\);?/;
const PATH_DECLARE_REGEX = /^\s*(var|const|let)\s+path\s*=\s*require\(/;

async function hasScaffoldArtifacts(projectRoot) {
  try {
    await access(getPackageJsonPath(projectRoot), constants.F_OK);
    await access(getAppPath(projectRoot), constants.F_OK);
    await access(getBinWwwPath(projectRoot), constants.F_OK);
    await access(getIndexRoutePath(projectRoot), constants.F_OK);
    await access(getUsersRoutePath(projectRoot), constants.F_OK);
    await access(getPublicIndexPath(projectRoot), constants.F_OK);
    await access(getGitignorePath(projectRoot), constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function hasDotenvInApp(filePath) {
  const content = await readFile(filePath, "utf8");
  return content.includes(ROOT_DOTENV_BOOTSTRAP);
}

async function ensureDotenvInApp(filePath) {
  const currentContent = await readFile(filePath, "utf8");
  if (currentContent.includes(ROOT_DOTENV_BOOTSTRAP)) {
    return;
  }

  const sanitizedContent = currentContent
    .split("\n")
    .filter(
      (line) =>
        !DOTENV_REQUIRE_REGEX.test(line.trim()) &&
        !PATH_DECLARE_REGEX.test(line),
    )
    .join("\n");

  await writeFile(
    filePath,
    `${ROOT_DOTENV_BOOTSTRAP}\n\n${sanitizedContent}`,
    "utf8",
  );
}

async function isBinWwwNormalized(filePath) {
  const content = await readFile(filePath, "utf8");
  const lines = content.split("\n");
  if (!lines[0]?.startsWith("#!")) {
    return false;
  }

  return !DOTENV_REQUIRE_REGEX.test(content);
}

async function normalizeBinWww(filePath) {
  const content = await readFile(filePath, "utf8");
  const lines = content.split("\n");
  const shebangIndex = lines.findIndex((line) => line.startsWith("#!"));

  if (shebangIndex === -1) {
    return;
  }

  const shebang = lines[shebangIndex];
  const withoutShebang = lines.filter((_, index) => index !== shebangIndex);
  const withoutDotenv = withoutShebang.filter(
    (line) => !DOTENV_REQUIRE_REGEX.test(line.trim()),
  );

  while (withoutDotenv.length > 0 && withoutDotenv[0].trim() === "") {
    withoutDotenv.shift();
  }

  const normalizedLines = [shebang, ...withoutDotenv];
  const normalizedContent = normalizedLines.join("\n");

  if (normalizedContent !== content) {
    await writeFile(filePath, normalizedContent, "utf8");
  }
}

async function enableDebugInStartScript(packageJsonPath) {
  const content = await readFile(packageJsonPath, "utf8");
  const packageJson = JSON.parse(content);

  if (packageJson.scripts && packageJson.scripts.start) {
    const currentStart = packageJson.scripts.start;
    // Only add DEBUG if not already present
    if (!currentStart.includes("DEBUG=")) {
      packageJson.scripts.start = `DEBUG=backend:* ${currentStart}`;
      await writeFile(
        packageJsonPath,
        JSON.stringify(packageJson, null, 2) + "\n",
        "utf8",
      );
    }
  }
}

export const createExpressProjectFilesStep = {
  id: "create_express_project_files",
  description: "Scaffold Express project with express-generator",

  async isDone({ projectRoot }) {
    const scaffolded = await hasScaffoldArtifacts(projectRoot);
    if (!scaffolded) {
      return false;
    }

    const appPath = getAppPath(projectRoot);
    const binWwwPath = getBinWwwPath(projectRoot);

    return (
      (await hasDotenvInApp(appPath)) && (await isBinWwwNormalized(binWwwPath))
    );
  },

  async run({ projectRoot, log }) {
    const backendRoot = getBackendRoot(projectRoot);
    const appPath = getAppPath(projectRoot);
    const binWwwPath = getBinWwwPath(projectRoot);
    const packageJsonPath = getPackageJsonPath(projectRoot);

    const scaffolded = await hasScaffoldArtifacts(projectRoot);

    if (!scaffolded) {
      log("Scaffolding Express app with express-generator...");
      await runCommand(
        "npx",
        ["express-generator", "--no-view", "--git", "--force", "."],
        {
          cwd: backendRoot,
          env: {
            ...process.env,
            npm_config_yes: "true",
          },
        },
      );
    }

    await normalizeBinWww(binWwwPath);
    await ensureDotenvInApp(appPath);
    await enableDebugInStartScript(packageJsonPath);
  },
};
