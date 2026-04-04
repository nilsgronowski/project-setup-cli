import { access, readFile, writeFile } from "node:fs/promises";
import { constants } from "node:fs";
import { join } from "node:path";

function getDockerfilePath(projectRoot) {
  return join(projectRoot, "backend", "Dockerfile");
}

export const prepareBackendContainerStep = {
  id: "prepare_backend_container",
  description: "Create Dockerfile for Django app",

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
      : 8000;

  return [
    "FROM python:3.12-slim",
    "WORKDIR /app",
    "ENV PYTHONDONTWRITEBYTECODE=1",
    "ENV PYTHONUNBUFFERED=1",
    "COPY requirements.txt ./",
    "RUN pip install --no-cache-dir -r requirements.txt",
    "COPY . .",
    `EXPOSE ${port}`,
    `CMD [\"python3\", \"manage.py\", \"runserver\", \"0.0.0.0:${port}\"]`,
    "",
  ].join("\n");
}
