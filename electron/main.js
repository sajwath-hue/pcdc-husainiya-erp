const { app, BrowserWindow, shell } = require("electron");
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

function waitForServer(url, timeoutMs = 20000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const attempt = () => {
      const req = http.get(url, (res) => {
        res.resume();
        resolve();
      });
      req.on("error", () => {
        if (Date.now() - start > timeoutMs) {
          reject(new Error(`Server at ${url} did not start in time`));
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
  // for why it's an archive rather than a plain folder). Extract once into
  // userData, which is writable even when the app itself is installed
  // read-only (e.g. Program Files on Windows).
  const extractDir = path.join(app.getPath("userData"), "standalone");
  const serverEntry = path.join(extractDir, "standalone", "server.js");

  if (!fs.existsSync(serverEntry)) {
    const archivePath = path.join(process.resourcesPath, "standalone.tar.gz");
    fs.mkdirSync(extractDir, { recursive: true });
    execFileSync("tar", ["-xzf", archivePath, "-C", extractDir]);
  }

  return serverEntry;
}

function startStandaloneServer() {
  const serverEntry = ensureServerExtracted();

  serverProcess = spawn(process.execPath, [serverEntry], {
    env: { ...process.env, PORT: String(PROD_PORT), HOSTNAME: "127.0.0.1" },
    stdio: "inherit",
  });

  serverProcess.on("exit", (code) => {
    if (code && code !== 0) console.error(`Server process exited with code ${code}`);
  });
}

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1360,
    height: 860,
    minWidth: 1024,
    minHeight: 640,
    title: "School Pro — Manbaul Huda Arabic College",
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Open external links (e.g. document links) in the OS browser, not the app window.
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  if (isDev) {
    await mainWindow.loadURL(DEV_URL);
  } else {
    startStandaloneServer();
    await waitForServer(PROD_URL);
    await mainWindow.loadURL(PROD_URL);
  }
}

app.whenReady().then(createWindow);

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
