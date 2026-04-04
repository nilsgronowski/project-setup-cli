import { StepRegistry } from "../../../core/step-registry.js";
import { createBackendDirStep } from "./steps/create-backend-dir.step.js";
import { createDjangoProjectFilesStep } from "./steps/create-django-project-files.step.js";
import { writeBackendEnvStep } from "./steps/write-backend-env.step.js";
import { prepareBackendContainerStep } from "./steps/prepare-backend-container.step.js";
import { markBackendReadyStep } from "./steps/mark-backend-ready.step.js";

export function createDjangoStepRegistry() {
  return new StepRegistry([
    createBackendDirStep,
    createDjangoProjectFilesStep,
    writeBackendEnvStep,
    prepareBackendContainerStep,
    markBackendReadyStep,
  ]);
}
