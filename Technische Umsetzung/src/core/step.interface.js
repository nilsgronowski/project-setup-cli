/**
 * @typedef {Object} Step
 * @property {string} id
 * @property {string} [description]
 * @property {(context: StepContext) => Promise<boolean>} isDone
 * @property {(context: StepContext) => Promise<void>} run
 */

/**
 * @typedef {Object} StepContext
 * @property {any} config
 * @property {string} projectRoot
 * @property {(message: string) => void} log
 */

/**
 * Runtime guard to fail fast when a step does not implement the expected API.
 * @param {unknown} step
 * @returns {Step}
 */
export function assertStep(step) {
  if (!step || typeof step !== "object") {
    throw new Error("Invalid step: step must be an object");
  }

  if (typeof step.id !== "string" || step.id.trim().length === 0) {
    throw new Error("Invalid step: 'id' must be a non-empty string");
  }

  if (typeof step.isDone !== "function") {
    throw new Error(`Invalid step '${step.id}': 'isDone' must be a function`);
  }

  if (typeof step.run !== "function") {
    throw new Error(`Invalid step '${step.id}': 'run' must be a function`);
  }

  return /** @type {Step} */ (step);
}

/**
 * @param {unknown[]} steps
 * @returns {Step[]}
 */
export function assertStepList(steps) {
  if (!Array.isArray(steps)) {
    throw new Error("Invalid step list: expected an array");
  }

  const seenIds = new Set();
  return steps.map((step) => {
    const validStep = assertStep(step);
    if (seenIds.has(validStep.id)) {
      throw new Error(`Duplicate step id detected: '${validStep.id}'`);
    }
    seenIds.add(validStep.id);
    return validStep;
  });
}
