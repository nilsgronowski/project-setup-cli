import { assertStepList } from "./step.interface.js";

/**
 * @typedef {Object} StepRunResult
 * @property {"success" | "failed"} status
 * @property {string[]} completedStepIds
 * @property {string[]} skippedStepIds
 * @property {string | null} failedStepId
 * @property {string | null} errorMessage
 */

/**
 * Executes workflow steps sequentially and stops at the first failure.
 * Each step can skip itself via isDone for idempotent reruns.
 *
 * @param {Object} params
 * @param {unknown[]} params.steps
 * @param {import("./step.interface.js").StepContext} params.context
 * @param {(message: string) => void} [params.log]
 * @returns {Promise<StepRunResult>}
 */
export async function runSteps({ steps, context, log = () => {} }) {
  const validSteps = assertStepList(steps);
  const completedStepIds = [];
  const skippedStepIds = [];

  for (const step of validSteps) {
    log(`Starting step: ${step.id}`);

    const done = await step.isDone(context);
    if (done) {
      skippedStepIds.push(step.id);
      log(`Skipping step (already done): ${step.id}`);
      continue;
    }

    try {
      await step.run(context);
      completedStepIds.push(step.id);
      log(`Completed step: ${step.id}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      log(`Failed step: ${step.id} (${message})`);

      return {
        status: "failed",
        completedStepIds,
        skippedStepIds,
        failedStepId: step.id,
        errorMessage: message,
      };
    }
  }

  return {
    status: "success",
    completedStepIds,
    skippedStepIds,
    failedStepId: null,
    errorMessage: null,
  };
}
