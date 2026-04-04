import * as z from "zod";

const portSchema = z.coerce
  .number({ invalid_type_error: "Port must be a number" })
  .int("Port must be an integer")
  .min(1, "Port must be between 1 and 65535")
  .max(65535, "Port must be between 1 and 65535");

export const configSchema = z.object({
  configVersion: z.string().default("1.0"),

  project: z.object({
    name: z.string().trim().min(1, "Project name is required"),
    targetDir: z
      .string()
      .trim()
      .min(1, "Target directory is required")
      .default(process.cwd()),
    packageManager: z
      .enum(["npm", "pnpm", "yarn"], "Invalid package manager")
      .default("npm"),
  }),

  stack: z.object({
    frontend: z.object({
      type: z.enum(["angular", "react", "vue"], "Invalid frontend framework"),
      port: portSchema.optional(),
    }),
    backend: z.object({
      type: z.enum(["express", "django"], "Invalid backend framework"),
      port: portSchema.optional(),
    }),

    database: z.object({
      type: z.enum(["postgres", "mongodb"], "Invalid database"),
      port: portSchema.optional(),
      credentials: z
        .object({
          name: z.string().trim().min(1, "Database name is required"),
          user: z.string().trim().min(1, "Database user is required"),
          password: z.string().trim().min(1, "Database password is required"),
        })
        .default({
          name: "app",
          user: "app",
          password: "app",
        }),
    }),
  }),

  container: z
    .object({
      enabled: z.boolean().default(false),
      type: z
        .enum(["docker", "podman"], "Invalid container type")
        .default("docker"),
      composeFileName: z
        .string()
        .trim()
        .min(1, "Compose file name is required")
        .default("compose.yaml"),
    })
    .default({ enabled: false }),

  generation: z
    .object({
      createDockerignore: z.boolean().default(true),
      overwritePolicy: z
        .enum(["safe", "overwrite", "skip"], "Invalid overwrite policy")
        .default("safe"),
    })
    .default({ enabled: false }),

  execution: z
    .object({
      mode: z
        .enum(["interactive", "non-interactive"], "Invalid execution mode")
        .default("non-interactive"),
      resume: z.boolean().default(true),
      dryRun: z.boolean().default(false),
      verbose: z.boolean().default(false),
    })
    .default({ enabled: false }),
});
