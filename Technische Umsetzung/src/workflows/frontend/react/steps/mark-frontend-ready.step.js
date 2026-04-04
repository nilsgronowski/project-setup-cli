import { access, mkdir, writeFile } from "node:fs/promises";
import { constants } from "node:fs";
import { join } from "node:path";

function getReadyMarkerPath(projectRoot) {
  return join(projectRoot, ".tooling", "frontend-ready.json");
}

export const markFrontendReadyStep = {
  id: "mark_frontend_ready",
  description: "Write readiness marker for frontend workflow",

  async isDone({ projectRoot }) {
    try {
      await access(getReadyMarkerPath(projectRoot), constants.F_OK);
      return true;
    } catch {
      return false;
    }
  },

  async run({ projectRoot, config }) {
    const toolingDir = join(projectRoot, ".tooling");
    await mkdir(toolingDir, { recursive: true });

    const marker = {
      status: "ready",
      frontend: config.stack.frontend.type,
      port: config.stack.frontend.port,
      generatedAt: new Date().toISOString(),
    };

    await writeFile(
      getReadyMarkerPath(projectRoot),
      `${JSON.stringify(marker, null, 2)}\n`,
      "utf8",
    );
  },
};
