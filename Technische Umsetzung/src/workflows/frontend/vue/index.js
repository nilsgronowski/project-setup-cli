import { StepRegistry } from "../../../core/step-registry.js";
import { checkTargetDirStep } from "./steps/check-target-dir.step.js";
import { createFrontendDirStep } from "./steps/create-frontend-dir.step.js";
import { createVueProjectStep } from "./steps/create-vue-project.step.js";
import { installFrontendDepsStep } from "./steps/install-frontend-deps.step.js";
import { writeFrontendEnvStep } from "./steps/write-frontend-env.step.js";
import { prepareFrontendContainerStep } from "./steps/prepare-frontend-container.step.js";
import { markFrontendReadyStep } from "./steps/mark-frontend-ready.step.js";

export function createVueStepRegistry() {
  return new StepRegistry([
    checkTargetDirStep,
    createFrontendDirStep,
    createVueProjectStep,
    installFrontendDepsStep,
    writeFrontendEnvStep,
    prepareFrontendContainerStep,
    markFrontendReadyStep,
  ]);
}
