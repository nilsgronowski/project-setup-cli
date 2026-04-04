import { StepRegistry } from "../../../core/step-registry.js";
import { createBackendDirStep } from "./steps/create-backend-dir.step.js";
import { createExpressProjectFilesStep } from "./steps/create-express-project-files.step.js";
import { installBackendDepsStep } from "./steps/install-backend-deps.step.js";
import { writeBackendEnvStep } from "./steps/write-backend-env.step.js";
import { prepareBackendContainerStep } from "./steps/prepare-backend-container.step.js";
import { markBackendReadyStep } from "./steps/mark-backend-ready.step.js";

export function createExpressStepRegistry() {
  return new StepRegistry([
    createBackendDirStep,
    createExpressProjectFilesStep,
    installBackendDepsStep,
    writeBackendEnvStep,
    prepareBackendContainerStep,
    markBackendReadyStep,
  ]);
}
