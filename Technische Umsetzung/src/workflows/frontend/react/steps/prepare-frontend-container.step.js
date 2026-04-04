import { access, readFile, writeFile } from "node:fs/promises";
import { constants } from "node:fs";
import { join } from "node:path";

function getDockerfilePath(projectRoot) {
  return join(projectRoot, "frontend", "Dockerfile");
}

export const prepareFrontendContainerStep = {
  id: "prepare_frontend_container",
  description: "Create Dockerfile for React app",

  async isDone({ projectRoot, config }) {
    try {
      const dockerfilePath = getDockerfilePath(projectRoot);
      await access(dockerfilePath, constants.F_OK);
      const current = await readFile(dockerfilePath, "utf8");
      return current === getExpectedDockerfile(config);
    } catch {
      return false;
    }
  },

  async run({ projectRoot, config }) {
    await writeFile(
      getDockerfilePath(projectRoot),
      getExpectedDockerfile(config),
      "utf8",
    );
  },
};

function getExpectedDockerfile(config) {
  const port =
    typeof config.stack.frontend.port === "number"
      ? config.stack.frontend.port
      : 5173;

  return [
    "FROM node:20-alpine",
    "WORKDIR /app",
    "COPY package*.json ./",
    "RUN npm install",
    "COPY . .",
    `EXPOSE ${port}`,
    'CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]',
    "",
  ].join("\n");
}
