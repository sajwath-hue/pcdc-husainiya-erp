const { app, BrowserWindow, shell, dialog } = require("electron");
const path = require("node:path");
const fs = require("node:fs");
const http = require("node:http");
const { spawn, execFileSync } = require("node:child_process");

const DEV_URL = "http://localhost:3000";
const PROD_PORT = 3300;
const PROD_URL = `http://127.0.0.1:${PROD_PORT}`;

const isDev = !app.isPackaged;
let serverProcess = null;
let mainWindow = null;

const logPath = app.isPackaged ? path.join(app.getPath("userData"), "launch.log") : null;
function log(message) {
  console.log(message);
  if (logPath) {
    try {
      fs.appendFileSync(logPath, `[${new Date().toISOString()}] ${message}\n`);
    } catch {
      // Logging is best-effort — never let it take down startup.
    }
  }
}

// Prevent double-clicking the exe multiple times (or launching it while
// already running) from spawning duplicate windows and duplicate servers
// fighting over the same port.
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

function waitForServer(url, timeoutMs = 30000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const attempt = () => {
      const req = http.get(url, (res) => {
        res.resume();
        resolve();
      });
      req.on("error", (err) => {
        if (Date.now() - start > timeoutMs) {
          reject(new Error(`Server at ${url} did not start in time (${err.message})`));
        } else {
          setTimeout(attempt, 300);
        }
      });
    };
    attempt();
  });
}

function ensureServerExtracted() {
  // Shipped as resources/standalone.tar.gz (see electron/prepare-standalone.js
  // for why it's an archive rather than a plain folder). userData is
  // writable even when the app itself is installed read-only (e.g. Program
  // Files on Windows).
  //
  // Re-extract on every launch rather than reusing a previous extraction:
  // userData persists across app upgrades (it's keyed by app name, not
  // version), so a stale extraction from an older install would otherwise
  // silently keep being used forever — exactly the kind of bug that made a
  // previously-shipped fix look like it "didn't work" on a machine that had
  // already run an older build once.
  const extractDir = path.join(app.getPath("userData"), "standalone");
  const serverEntry = path.join(extractDir, "standalone", "server.js");

  const archivePath = path.join(process.resourcesPath, "standalone.tar.gz");
  log(`Extracting ${archivePath} to ${extractDir}`);
  fs.rmSync(extractDir, { recursive: true, force: true });
  fs.mkdirSync(extractDir, { recursive: true });
  try {
    execFileSync("tar", ["-xzf", archivePath, "-C", extractDir], { stdio: "pipe" });
  } catch (err) {
    throw new Error(
      `Failed to extract app files (tar -xzf failed): ${err.message}\n${err.stderr ? err.stderr.toString() : ""}`,
    );
  }

  if (!fs.existsSync(serverEntry)) {
    throw new Error(`Extraction succeeded but ${serverEntry} is still missing.`);
  }

  return serverEntry;
}

function startStandaloneServer() {
  const serverEntry = ensureServerExtracted();
  log(`Starting server: ${process.execPath} ${serverEntry}`);

  serverProcess = spawn(process.execPath, [serverEntry], {
    // Without this, running the Electron binary itself as the "node" here
    // makes it try to boot as an Electron app instead of executing
    // server.js as a plain script — the server then never binds its port.
    env: {
      ...process.env,
      ELECTRON_RUN_AS_NODE: "1",
      PORT: String(PROD_PORT),
      HOSTNAME: "127.0.0.1",
    },
    stdio: ["ignore", "pipe", "pipe"],
  });

  serverProcess.stdout.on("data", (d) => log(`[server] ${d}`.trimEnd()));
  serverProcess.stderr.on("data", (d) => log(`[server:err] ${d}`.trimEnd()));

  serverProcess.on("error", (err) => {
    log(`Server process failed to start: ${err.message}`);
  });
  serverProcess.on("exit", (code) => {
    if (code && code !== 0) log(`Server process exited with code ${code}`);
  });
}

function showFatalError(title, err) {
  log(`FATAL: ${title}: ${err.message}`);
  const detail = logPath
    ? `${err.message}\n\nDetails were saved to:\n${logPath}`
    : err.message;
  dialog.showErrorBox(title, detail);
  app.quit();
}

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1360,
    height: 860,
    minWidth: 1024,
    minHeight: 640,
    title: "School Pro — Manbaul Huda Arabic College",
    autoHideMenuBar: true,
    backgroundColor: "#0b1220",
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.once("ready-to-show", () => mainWindow.show());

  // Open external links (e.g. document links) in the OS browser, not the app window.
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  if (isDev) {
    await mainWindow.loadURL(DEV_URL);
    return;
  }

  await mainWindow.loadFile(path.join(__dirname, "loading.html"));
  mainWindow.show();

  try {
    startStandaloneServer();
    await waitForServer(PROD_URL);
    await mainWindow.loadURL(PROD_URL);
  } catch (err) {
    showFatalError("School Pro couldn't start", err);
  }
}

if (gotLock) {
  app.whenReady().then(() => {
    log(`App starting. isPackaged=${app.isPackaged} version=${app.getVersion()}`);
    createWindow();
  });

  app.on("window-all-closed", () => {
    if (serverProcess) serverProcess.kill();
    if (process.platform !== "darwin") app.quit();
  });

  app.on("before-quit", () => {
    if (serverProcess) serverProcess.kill();
  });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
}
