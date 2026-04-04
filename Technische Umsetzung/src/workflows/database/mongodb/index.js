import { StepRegistry } from "../../../core/step-registry.js";
import { createDatabaseDirStep } from "../steps/create-database-dir.step.js";
import { writeDatabaseComposeStep } from "../steps/write-database-compose.step.js";
import { writeDatabaseEnvStep } from "../steps/write-database-env.step.js";
import { markDatabaseReadyStep } from "../steps/mark-database-ready.step.js";
import { writeRootComposeStep } from "../steps/write-root-compose.step.js";

export function createMongodbStepRegistry() {
  return new StepRegistry([
    createDatabaseDirStep,
    writeDatabaseComposeStep,
    writeDatabaseEnvStep,
    writeRootComposeStep,
    markDatabaseReadyStep,
  ]);
}
