#!/usr/bin/env node

import * as p from "@clack/prompts";
import { spawn } from "node:child_process";
import { join } from "node:path";
import { validateConfig } from "./core/config.validate.js";
import { runCommand } from "./core/run-command.js";
import { runSteps } from "./core/step-runner.js";
import { createDjangoStepRegistry } from "./workflows/backend/django/index.js";
import { createExpressStepRegistry } from "./workflows/backend/express/index.js";
import { createMongodbStepRegistry } from "./workflows/database/mongodb/index.js";
import { createPostgresStepRegistry } from "./workflows/database/postgres/index.js";
import { createReactStepRegistry } from "./workflows/frontend/react/index.js";
import { createVueStepRegistry } from "./workflows/frontend/vue/index.js";

function handleCancel(value) {
  if (p.isCancel(value)) {
    p.cancel("Setup canceled.");
    process.exit(0);
  }

  return value;
}

function runWorkflowOrExit({ registry, config, projectRoot, logger, label }) {
  const spinner = p.spinner();
  spinner.start(`${label} setup is running...`);

  return runSteps({
    steps: registry.getAllSteps(),
    context: {
      config,
      projectRoot,
      log: () => {},
    },
    log: () => {},
  }).then((result) => {
    if (result.status === "failed") {
      spinner.stop(`${label} setup failed`);
      logger.error(`Setup failed at step: ${result.failedStepId}`);
      logger.error(result.errorMessage || "Unknown error");
      process.exit(1);
    }

    spinner.stop(`${label} setup completed`);
    logger.success(
      `Completed steps: ${result.completedStepIds.join(", ") || "none"}`,
    );
    logger.info(`Skipped steps: ${result.skippedStepIds.join(", ") || "none"}`);

    return result;
  });
}

function buildFrontendSetupInput({
  projectName,
  targetDir,
  frontendChoice,
  frontendPortInput,
}) {
  return {
    project: {
      name: String(projectName),
      targetDir: String(targetDir),
    },
    stack: {
      frontend: {
        type: frontendChoice,
        port: frontendPortInput ? Number(frontendPortInput) : undefined,
      },
      backend: {
        type: "express",
      },
      database: {
        type: "postgres",
        credentials: {
          name: "app",
          user: "app",
          password: "app",
        },
      },
    },
  };
}

function buildBackendSetupInput({
  frontendConfig,
  backendChoice,
  backendPortInput,
}) {
  return {
    project: {
      name: frontendConfig.project.name,
      targetDir: frontendConfig.project.targetDir,
    },
    stack: {
      frontend: {
        type: frontendConfig.stack.frontend.type,
        port: frontendConfig.stack.frontend.port,
      },
      backend: {
        type: backendChoice,
        port: backendPortInput ? Number(backendPortInput) : undefined,
      },
      database: {
        type: "postgres",
        credentials: frontendConfig.stack.database.credentials,
      },
    },
  };
}

function buildDatabaseSetupInput({
  backendConfig,
  databaseChoice,
  databasePortInput,
  databaseNameInput,
  databaseUserInput,
  databasePasswordInput,
}) {
  return {
    project: {
      name: backendConfig.project.name,
      targetDir: backendConfig.project.targetDir,
    },
    stack: {
      frontend: {
        type: backendConfig.stack.frontend.type,
        port: backendConfig.stack.frontend.port,
      },
      backend: {
        type: backendConfig.stack.backend.type,
        port: backendConfig.stack.backend.port,
      },
      database: {
        type: databaseChoice,
        port: databasePortInput ? Number(databasePortInput) : undefined,
        credentials: {
          name: databaseNameInput || "app",
          user: databaseUserInput || "app",
          password: databasePasswordInput || "app",
        },
      },
    },
  };
}

function buildLogger() {
  return {
    info: (message) => p.log.info(message),
    success: (message) => p.log.success(message),
    error: (message) => p.log.error(message),
  };
}

function resolveRuntimePorts(config) {
  const frontendPort =
    typeof config.stack.frontend.port === "number"
      ? config.stack.frontend.port
      : 5173;
  const backendPort =
    typeof config.stack.backend.port === "number"
      ? config.stack.backend.port
      : config.stack.backend.type === "django"
        ? 8000
        : 3000;
  const databasePort =
    typeof config.stack.database.port === "number"
      ? config.stack.database.port
      : config.stack.database.type === "postgres"
        ? 5432
        : 27017;

  return { frontendPort, backendPort, databasePort };
}

function buildLocalhostAddresses(config) {
  const { frontendPort, backendPort, databasePort } =
    resolveRuntimePorts(config);

  return [
    `Frontend: http://localhost:${frontendPort}`,
    `Backend: http://localhost:${backendPort}`,
    config.stack.database.type === "postgres"
      ? `PostgreSQL: localhost:${databasePort}`
      : `MongoDB: mongodb://localhost:${databasePort}`,
  ];
}

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function runCommandWithOutput(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: ["ignore", "pipe", "pipe"],
      shell: false,
      ...options,
    });

    let stdout = "";
    let stderr = "";

    child.stdout?.on("data", (chunk) => {
      stdout += String(chunk);
    });

    child.stderr?.on("data", (chunk) => {
      stderr += String(chunk);
    });

    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
        return;
      }

      const output = `${stdout}${stderr}`.trim();
      const message =
        output.length > 0
          ? output.split("\n").slice(-10).join("\n")
          : `Command "${command}" exited with code ${code}`;

      reject(new Error(message));
    });
  });
}

function getExpectedContainerNames(config) {
  const projectName = config.project.name;

  return [
    { service: "frontend", name: `${projectName}-frontend` },
    { service: "backend", name: `${projectName}-backend` },
    { service: "database", name: `${projectName}-db` },
  ];
}

async function inspectContainer(containerName) {
  const { stdout } = await runCommandWithOutput("podman", [
    "inspect",
    "--format",
    "{{.State.Status}}|{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}",
    containerName,
  ]);

  const [status = "unknown", health = "none"] = stdout.trim().split("|");
  return { status, health };
}

function isContainerHealthy(state) {
  if (state.status !== "running") {
    return false;
  }

  if (state.health === "none") {
    return true;
  }

  return state.health === "healthy";
}

function formatHealthReport(services) {
  return services
    .map(({ service, name, status, health, error }) => {
      if (error) {
        return `${service} (${name}): ${error}`;
      }

      return `${service} (${name}): status=${status}, health=${health}`;
    })
    .join("\n");
}

async function readContainerLogs(containerName, tail = 80) {
  try {
    const { stdout, stderr } = await runCommandWithOutput("podman", [
      "logs",
      "--tail",
      String(tail),
      containerName,
    ]);

    const combined = `${stdout}${stderr}`.trim();
    return combined.length > 0 ? combined : "(no logs available)";
  } catch (error) {
    return `Could not read logs: ${error instanceof Error ? error.message : String(error)}`;
  }
}

async function waitForComposeHealth({ config, logger, timeoutMs = 90000 }) {
  const intervalMs = 3000;
  const deadline = Date.now() + timeoutMs;
  const expected = getExpectedContainerNames(config);
  let lastStates = [];

  logger.info("Running basic container health check...");

  while (Date.now() < deadline) {
    const checks = await Promise.all(
      expected.map(async ({ service, name }) => {
        try {
          const { status, health } = await inspectContainer(name);
          return { service, name, status, health };
        } catch (error) {
          return {
            service,
            name,
            status: "missing",
            health: "none",
            error: error instanceof Error ? error.message : String(error),
          };
        }
      }),
    );

    lastStates = checks;
    if (checks.every((state) => isContainerHealthy(state))) {
      logger.success("Health check passed for all services.");
      return;
    }

    await wait(intervalMs);
  }

  const unhealthyServices = lastStates.filter(
    (state) => !isContainerHealthy(state),
  );
  const failingLogs = await Promise.all(
    unhealthyServices.map(async ({ service, name }) => {
      const logs = await readContainerLogs(name);
      return `${service} (${name}) logs:\n${logs}`;
    }),
  );

  throw new Error(
    [
      "Health check failed: one or more services are not ready.",
      formatHealthReport(lastStates),
      "",
      "Recent container logs:",
      ...failingLogs,
    ].join("\n"),
  );
}

async function startCompose(projectRoot) {
  const commands = [
    ["podman", ["compose", "up", "-d"]],
    ["podman-compose", ["up", "-d"]],
  ];

  let lastError = null;

  for (const [command, args] of commands) {
    try {
      await runCommand(command, args, { cwd: projectRoot });
      return;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError ?? new Error("Failed to start Podman Compose.");
}

async function openPodmanApp() {
  const appNames = ["Podman Desktop", "Podman"];

  for (const appName of appNames) {
    try {
      await runCommand("open", ["-a", appName]);
      return true;
    } catch {
      // Try the next known app name.
    }
  }

  return false;
}

async function maybeStartCompose({ projectRoot, config, logger }) {
  const shouldStartCompose = handleCancel(
    await p.select({
      message: "All steps are complete. Start Podman Compose now?",
      options: [
        { value: true, label: "Yes, start Compose" },
        { value: false, label: "No, skip for now" },
      ],
      initialValue: true,
    }),
  );

  if (!shouldStartCompose) {
    return;
  }

  logger.info("Starting containers with Podman Compose...");
  await startCompose(projectRoot);
  logger.success("Compose services are running.");
  await waitForComposeHealth({ config, logger });

  const openedPodmanApp = await openPodmanApp();
  if (openedPodmanApp) {
    logger.info("Podman app opened in the foreground.");
  } else {
    logger.info(
      "Podman app could not be opened automatically. Open it manually to inspect the running containers.",
    );
  }

  for (const address of buildLocalhostAddresses(config)) {
    logger.info(address);
  }
}

function getWorkflowRegistry(frontendType) {
  if (frontendType === "react") {
    return createReactStepRegistry();
  }

  if (frontendType === "vue") {
    return createVueStepRegistry();
  }

  throw new Error(`Unsupported frontend type: ${frontendType}`);
}

function getBackendWorkflowRegistry(backendType) {
  if (backendType === "express") {
    return createExpressStepRegistry();
  }

  if (backendType === "django") {
    return createDjangoStepRegistry();
  }

  throw new Error(`Unsupported backend type: ${backendType}`);
}

function getDatabaseWorkflowRegistry(databaseType) {
  if (databaseType === "postgres") {
    return createPostgresStepRegistry();
  }

  if (databaseType === "mongodb") {
    return createMongodbStepRegistry();
  }

  throw new Error(`Unsupported database type: ${databaseType}`);
}

async function main() {
  const logger = buildLogger();
  p.intro("Welcome to the Project Setup CLI!");

  const projectName = handleCancel(
    await p.text({
      message: "What's your project name?",
      placeholder: "project-name",
      initialValue: "",
      validate(value) {
        if (value.length === 0) return `Value is required!`;
      },
    }),
  );

  const targetDir = handleCancel(
    await p.text({
      message: "Target directory (leave empty for current directory)",
      placeholder: process.cwd(),
      initialValue: process.cwd(),
    }),
  );

  const frontendChoice = handleCancel(
    await p.select({
      message: "Which frontend framework do you want to use?",
      options: [
        { value: "react", label: "React" },
        { value: "vue", label: "Vue" },
      ],
    }),
  );

  const frontendPortInput = handleCancel(
    await p.text({
      message: "Frontend port (optional)",
      placeholder: "leave empty for default",
      initialValue: "",
    }),
  );

  const frontendValidation = validateConfig(
    buildFrontendSetupInput({
      projectName,
      targetDir,
      frontendChoice,
      frontendPortInput,
    }),
  );

  if (!frontendValidation.success) {
    logger.error("Frontend configuration validation failed.");
    for (const issue of frontendValidation.errors) {
      logger.error(`${issue.path || "config"}: ${issue.message}`);
    }
    process.exit(1);
  }

  const frontendConfig = frontendValidation.data;
  const projectRoot = join(
    frontendConfig.project.targetDir,
    frontendConfig.project.name,
  );
  const frontendRegistry = getWorkflowRegistry(
    frontendConfig.stack.frontend.type,
  );

  await runWorkflowOrExit({
    registry: frontendRegistry,
    config: frontendConfig,
    projectRoot,
    logger,
    label: "Frontend",
  });

  const backendChoice = handleCancel(
    await p.select({
      message: "Which backend framework do you want to use?",
      options: [
        { value: "express", label: "Express" },
        { value: "django", label: "Django" },
      ],
    }),
  );

  const backendPortInput = handleCancel(
    await p.text({
      message: "Backend port (optional)",
      placeholder: "leave empty for default",
      initialValue: "",
    }),
  );

  const backendValidation = validateConfig(
    buildBackendSetupInput({
      frontendConfig,
      backendChoice,
      backendPortInput,
    }),
  );

  if (!backendValidation.success) {
    logger.error("Backend configuration validation failed.");
    for (const issue of backendValidation.errors) {
      logger.error(`${issue.path || "config"}: ${issue.message}`);
    }
    process.exit(1);
  }

  const backendConfig = backendValidation.data;
  const backendRegistry = getBackendWorkflowRegistry(
    backendConfig.stack.backend.type,
  );

  await runWorkflowOrExit({
    registry: backendRegistry,
    config: backendConfig,
    projectRoot,
    logger,
    label: "Backend",
  });

  const databaseChoice = handleCancel(
    await p.select({
      message: "Which database do you want to use?",
      options: [
        { value: "postgres", label: "PostgreSQL" },
        { value: "mongodb", label: "MongoDB" },
      ],
    }),
  );

  const databasePortInput = handleCancel(
    await p.text({
      message: "Database port (optional)",
      placeholder: "leave empty for default",
      initialValue: "",
    }),
  );

  const databaseNameInput = handleCancel(
    await p.text({
      message: "Database name (optional)",
      placeholder: "app",
      initialValue: "",
    }),
  );

  const databaseUserInput = handleCancel(
    await p.text({
      message: "Database user (optional)",
      placeholder: "app",
      initialValue: "",
    }),
  );

  const databasePasswordInput = handleCancel(
    await p.password({
      message: "Database password (optional)",
      placeholder: "app",
      mask: "*",
    }),
  );

  const databaseValidation = validateConfig(
    buildDatabaseSetupInput({
      backendConfig,
      databaseChoice,
      databasePortInput,
      databaseNameInput,
      databaseUserInput,
      databasePasswordInput,
    }),
  );

  if (!databaseValidation.success) {
    logger.error("Database configuration validation failed.");
    for (const issue of databaseValidation.errors) {
      logger.error(`${issue.path || "config"}: ${issue.message}`);
    }
    process.exit(1);
  }

  const config = databaseValidation.data;
  const databaseRegistry = getDatabaseWorkflowRegistry(
    config.stack.database.type,
  );

  await runWorkflowOrExit({
    registry: databaseRegistry,
    config,
    projectRoot,
    logger,
    label: "Database",
  });

  logger.info(`Backend selected: ${config.stack.backend.type}`);
  logger.info(`Database selected: ${config.stack.database.type}`);

  try {
    await maybeStartCompose({ projectRoot, config, logger });
  } catch (error) {
    logger.error("Compose startup failed.");
    logger.error(error instanceof Error ? error.message : String(error));
  }

  p.outro("Thank you for using the Project Setup CLI!");
}

main();
