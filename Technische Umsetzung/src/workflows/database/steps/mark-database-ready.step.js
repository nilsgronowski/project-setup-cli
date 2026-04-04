import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { constants } from "node:fs";
import { join } from "node:path";

function getReadyMarkerPath(projectRoot) {
  return join(projectRoot, ".tooling", "database-ready.json");
}

function getExpectedMarker(config) {
  return {
    status: "ready",
    database: config.stack.database.type,
    port: config.stack.database.port,
  };
}

export const markDatabaseReadyStep = {
  id: "mark_database_ready",
  description: "Write readiness marker for database workflow",

  async isDone({ projectRoot, config }) {
    try {
      const markerPath = getReadyMarkerPath(projectRoot);
      await access(markerPath, constants.F_OK);
      const raw = await readFile(markerPath, "utf8");
      const marker = JSON.parse(raw);
      const expected = getExpectedMarker(config);

      return (
        marker.status === expected.status &&
        marker.database === expected.database &&
        marker.port === expected.port
      );
    } catch {
      return false;
    }
  },

  async run({ projectRoot, config }) {
    const toolingDir = join(projectRoot, ".tooling");
    await mkdir(toolingDir, { recursive: true });

    const marker = {
      ...getExpectedMarker(config),
      generatedAt: new Date().toISOString(),
    };

    await writeFile(
      getReadyMarkerPath(projectRoot),
      `${JSON.stringify(marker, null, 2)}\n`,
      "utf8",
    );
  },
};
