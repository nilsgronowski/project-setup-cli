import { access, writeFile } from "node:fs/promises";
import { constants } from "node:fs";
import { join } from "node:path";
import { runCommand } from "../../../../core/run-command.js";

function getBackendRoot(projectRoot) {
  return join(projectRoot, "backend");
}

function getRequiredArtifactPaths(projectRoot) {
  const backendRoot = getBackendRoot(projectRoot);

  return [
    join(backendRoot, "manage.py"),
    join(backendRoot, "requirements.txt"),
    join(backendRoot, ".gitignore"),
    join(backendRoot, "config", "__init__.py"),
    join(backendRoot, "config", "settings.py"),
    join(backendRoot, "config", "urls.py"),
    join(backendRoot, "config", "asgi.py"),
    join(backendRoot, "config", "wsgi.py"),
    join(backendRoot, "app", "__init__.py"),
    join(backendRoot, "app", "apps.py"),
    join(backendRoot, "app", "urls.py"),
    join(backendRoot, "app", "views.py"),
  ];
}

async function fileExists(path) {
  try {
    await access(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function hasScaffoldArtifacts(projectRoot) {
  try {
    const artifactPaths = getRequiredArtifactPaths(projectRoot);
    await Promise.all(
      artifactPaths.map((artifactPath) => access(artifactPath, constants.F_OK)),
    );
    return true;
  } catch {
    return false;
  }
}

export const createDjangoProjectFilesStep = {
  id: "create_django_project_files",
  description: "Create Django project from generator",

  async isDone({ projectRoot }) {
    return hasScaffoldArtifacts(projectRoot);
  },

  async run({ projectRoot, log }) {
    const backendRoot = getBackendRoot(projectRoot);

    await writeFile(
      join(backendRoot, "requirements.txt"),
      requirementsTxt(),
      "utf8",
    );
    await writeFile(join(backendRoot, ".gitignore"), gitignoreFile(), "utf8");

    log("Installing backend dependencies...");
    await runCommand(
      "python3",
      ["-m", "pip", "install", "-r", "requirements.txt"],
      {
        cwd: backendRoot,
        env: {
          ...process.env,
          PIP_DISABLE_PIP_VERSION_CHECK: "1",
        },
      },
    );

    if (!(await fileExists(join(backendRoot, "manage.py")))) {
      log("Scaffolding Django project with startproject...");
      await runCommand(
        "python3",
        ["-m", "django", "startproject", "config", "."],
        {
          cwd: backendRoot,
        },
      );
    }

    if (!(await fileExists(join(backendRoot, "app", "apps.py")))) {
      log("Scaffolding Django app with startapp...");
      await runCommand("python3", ["manage.py", "startapp", "app"], {
        cwd: backendRoot,
      });
    }

    await writeFile(
      join(backendRoot, "config", "settings.py"),
      settingsPy(),
      "utf8",
    );
    await writeFile(join(backendRoot, "config", "urls.py"), urlsPy(), "utf8");
    await writeFile(join(backendRoot, "app", "views.py"), viewsPy(), "utf8");
    await writeFile(join(backendRoot, "app", "urls.py"), appUrlsPy(), "utf8");

    log("Created Django project files with generator");
  },
};

function requirementsTxt() {
  return [
    "Django>=5.0,<6.0",
    "python-dotenv>=1.0,<2.0",
    "psycopg[binary]>=3.1,<4.0",
    "",
  ].join("\n");
}

function gitignoreFile() {
  return [
    "__pycache__/",
    "*.py[cod]",
    "*.sqlite3",
    "venv/",
    ".venv/",
    "env/",
    "*.egg-info/",
    ".DS_Store",
    "",
  ].join("\n");
}

function settingsPy() {
  return [
    "from pathlib import Path",
    "import os",
    "",
    "from dotenv import load_dotenv",
    "",
    "BASE_DIR = Path(__file__).resolve().parent.parent",
    'load_dotenv(BASE_DIR.parent / ".env")',
    'load_dotenv(BASE_DIR / ".env")',
    "",
    'SECRET_KEY = os.getenv("SECRET_KEY", "dev-only-secret-key")',
    'DEBUG = os.getenv("DEBUG", "1") == "1"',
    'ALLOWED_HOSTS = [h.strip() for h in os.getenv("ALLOWED_HOSTS", "localhost,127.0.0.1").split(",") if h.strip()]',
    "",
    "INSTALLED_APPS = [",
    '    "django.contrib.admin",',
    '    "django.contrib.auth",',
    '    "django.contrib.contenttypes",',
    '    "django.contrib.sessions",',
    '    "django.contrib.messages",',
    '    "django.contrib.staticfiles",',
    '    "app",',
    "]",
    "",
    "MIDDLEWARE = [",
    '    "django.middleware.security.SecurityMiddleware",',
    '    "django.contrib.sessions.middleware.SessionMiddleware",',
    '    "django.middleware.common.CommonMiddleware",',
    '    "django.middleware.csrf.CsrfViewMiddleware",',
    '    "django.contrib.auth.middleware.AuthenticationMiddleware",',
    '    "django.contrib.messages.middleware.MessageMiddleware",',
    '    "django.middleware.clickjacking.XFrameOptionsMiddleware",',
    "]",
    "",
    'ROOT_URLCONF = "config.urls"',
    "",
    "TEMPLATES = [",
    "    {",
    '        "BACKEND": "django.template.backends.django.DjangoTemplates",',
    '        "DIRS": [],',
    '        "APP_DIRS": True,',
    '        "OPTIONS": {',
    '            "context_processors": [',
    '                "django.template.context_processors.request",',
    '                "django.contrib.auth.context_processors.auth",',
    '                "django.contrib.messages.context_processors.messages",',
    "            ],",
    "        },",
    "    },",
    "]",
    "",
    'WSGI_APPLICATION = "config.wsgi.application"',
    "",
    'DB_TYPE = os.getenv("DB_TYPE", "sqlite")',
    "",
    'if DB_TYPE == "postgres":',
    "    DATABASES = {",
    '        "default": {',
    '            "ENGINE": "django.db.backends.postgresql",',
    '            "NAME": os.getenv("DB_NAME", "app"),',
    '            "USER": os.getenv("DB_USER", "app"),',
    '            "PASSWORD": os.getenv("DB_PASSWORD", "app"),',
    '            "HOST": os.getenv("DB_HOST", "localhost"),',
    '            "PORT": os.getenv("DB_PORT", "5432"),',
    "        }",
    "    }",
    "else:",
    "    DATABASES = {",
    '        "default": {',
    '            "ENGINE": "django.db.backends.sqlite3",',
    '            "NAME": BASE_DIR / "db.sqlite3",',
    "        }",
    "    }",
    "",
    'LANGUAGE_CODE = "en-us"',
    'TIME_ZONE = "UTC"',
    "USE_I18N = True",
    "USE_TZ = True",
    "",
    'STATIC_URL = "static/"',
    'DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"',
    "",
  ].join("\n");
}

function urlsPy() {
  return [
    "from django.contrib import admin",
    "from django.urls import include, path",
    "",
    "urlpatterns = [",
    '    path("", include("app.urls")),',
    '    path("admin/", admin.site.urls),',
    '    path("api/", include("app.urls")),',
    "]",
    "",
  ].join("\n");
}

function viewsPy() {
  return [
    "from django.http import JsonResponse",
    "",
    "",
    "def home(request):",
    '    return JsonResponse({"status": "ok", "message": "Django backend is running"})',
    "",
    "",
    "def health(request):",
    '    return JsonResponse({"status": "ok"})',
    "",
  ].join("\n");
}

function appUrlsPy() {
  return [
    "from django.urls import path",
    "",
    "from .views import health, home",
    "",
    "urlpatterns = [",
    '    path("", home, name="home"),',
    '    path("health/", health, name="health"),',
    "]",
    "",
  ].join("\n");
}
