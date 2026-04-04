import { access, readFile, writeFile } from "node:fs/promises";
import { constants } from "node:fs";
import { join } from "node:path";

function getDockerfilePath(projectRoot) {
  return join(projectRoot, "backend", "Dockerfile");
}

export const prepareBackendContainerStep = {
  id: "prepare_backend_container",
  description: "Create Dockerfile for Express app",

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
    typeof config.stack.backend.port === "number"
      ? config.stack.backend.port
      : 3000;

  return [
    "FROM node:20-alpine",
    "WORKDIR /app",
    "COPY package*.json ./",
    "RUN npm install",
    "COPY . .",
    `EXPOSE ${port}`,
    'CMD ["npm", "run", "start"]',
    "",
  ].join("\n");
}
