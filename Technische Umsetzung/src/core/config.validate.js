import { configSchema } from "./config.schema.js";

const DEFAULT_FRONTEND_PORTS = {
  react: 3000,
  vue: 5173,
};

const DEFAULT_BACKEND_PORTS = {
  express: 3001,
  django: 8000,
};

const DEFAULT_DATABASE_PORTS = {
  postgres: 5432,
  mongodb: 27017,
};

function withDefaultPorts(config) {
  const normalized = structuredClone(config);

  if (normalized.stack.frontend.port == null) {
    normalized.stack.frontend.port =
      DEFAULT_FRONTEND_PORTS[normalized.stack.frontend.type];
  }

  if (normalized.stack.backend.port == null) {
    normalized.stack.backend.port =
      DEFAULT_BACKEND_PORTS[normalized.stack.backend.type];
  }

  if (normalized.stack.database.port == null) {
    normalized.stack.database.port =
      DEFAULT_DATABASE_PORTS[normalized.stack.database.type];
  }

  return normalized;
}

function formatIssues(issues) {
  return issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
    code: issue.code,
  }));
}

export function validateConfig(input) {
  const result = configSchema.safeParse(input);

  if (!result.success) {
    return {
      success: false,
      data: null,
      errors: formatIssues(result.error.issues),
    };
  }

  return {
    success: true,
    data: withDefaultPorts(result.data),
    errors: [],
  };
}
