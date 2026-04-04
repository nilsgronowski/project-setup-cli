import { assertStepList } from "./step.interface.js";

export class StepRegistry {
  /**
   * @param {unknown[]} steps
   */
  constructor(steps) {
    this.steps = assertStepList(steps);
  }

  /**
   * @returns {import("./step.interface.js").Step[]}
   */
  getAllSteps() {
    return [...this.steps];
  }

  /**
   * @param {string} stepId
   * @returns {import("./step.interface.js").Step | undefined}
   */
  getStepById(stepId) {
    return this.steps.find((step) => step.id === stepId);
  }
}
