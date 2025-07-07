const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");

// Better development detection
const isDev =
  process.env.NODE_ENV === "development" ||
  process.argv.includes("--dev") ||
  !app.isPackaged;
let mainWindow;

// Determine platform-specific icon
const getIconPath = () => {
  switch (process.platform) {
    case "darwin":
      return path.join(__dirname, "../assets/icon.icns");
    case "win32":
      return path.join(__dirname, "../public/favicon.ico");
    default:
      return path.join(__dirname, "../public/favicon.ico");
  }
};

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 800,
    show: false, // Hide until ready to prevent flash
    center: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, "preload.js"),
      webSecurity: true, // Re-enable security for production
      allowRunningInsecureContent: false,
    },
    icon: getIconPath(), // Use platform-specific icon
  });

  let startUrl;

  if (isDev) {
    startUrl = "http://localhost:3001";
    console.log("Development mode detected - connecting to localhost:3001");
  } else {
    const indexPath = path.join(__dirname, "../out/index.html");
    startUrl = `file://${indexPath}`;
    console.log("Production mode detected - loading from:", indexPath);
  }

  // Load the application
  mainWindow
    .loadURL(startUrl)
    .then(() => {
      console.log("Application loaded successfully");
    })
    .catch((err) => {
      console.error("Failed to load application:", err);

      // In development, show a helpful error message
      if (isDev) {
        const devErrorHtml = `
          <html>
            <head>
              <title>Dynasty Manager - Development Error</title>
              <style>
                body { 
                  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                  text-align: center; 
                  padding: 50px; 
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  margin: 0;
                  color: white;
                }
                .container { 
                  max-width: 500px; 
                  margin: 0 auto; 
                  background: rgba(255,255,255,0.1); 
                  padding: 40px; 
                  border-radius: 15px; 
                  backdrop-filter: blur(10px);
                  box-shadow: 0 8px 32px rgba(0,0,0,0.3);
                }
                h1 { margin-top: 0; }
                button { 
                  background: rgba(255,255,255,0.2); 
                  color: white; 
                  border: 2px solid rgba(255,255,255,0.3); 
                  padding: 12px 24px; 
                  border-radius: 25px; 
                  cursor: pointer; 
                  font-size: 16px;
                  transition: all 0.3s ease;
                  margin: 5px;
                }
                button:hover { 
                  background: rgba(255,255,255,0.3); 
                  transform: translateY(-2px);
                }
                .error { color: #ffcccc; margin: 20px 0; }
              </style>
            </head>
            <body>
              <div class="container">
                <h1>🏈 Dynasty Manager - Development</h1>
                <p>Unable to connect to the development server.</p>
                <div class="error">Make sure the Next.js development server is running on localhost:3001</div>
                <p>Please run <code>npm run dev</code> in a separate terminal first.</p>
                <button onclick="location.reload()">Retry Connection</button>
                <button onclick="require('electron').shell.openExternal('http://localhost:3001')">Open in Browser</button>
              </div>
            </body>
          </html>
        `;

        mainWindow.loadURL(
          "data:text/html;charset=utf-8," + encodeURIComponent(devErrorHtml)
        );
      }
    });

  // Show window when ready
  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
    mainWindow.focus();

    // Open DevTools only in development
    if (isDev) {
      //mainWindow.webContents.openDevTools();
    }
  });

  // Handle window closed
  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  // Handle failed loads in production
  mainWindow.webContents.on(
    "did-fail-load",
    (event, errorCode, errorDescription, validatedURL) => {
      console.error(
        "Failed to load:",
        errorCode,
        errorDescription,
        validatedURL
      );

      // Show error page only in production
      if (!isDev) {
        const errorHtml = `
        <html>
          <head>
            <title>Dynasty Manager - Error</title>
            <style>
              body { 
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                text-align: center; 
                padding: 50px; 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                margin: 0;
                color: white;
              }
              .container { 
                max-width: 500px; 
                margin: 0 auto; 
                background: rgba(255,255,255,0.1); 
                padding: 40px; 
                border-radius: 15px; 
                backdrop-filter: blur(10px);
                box-shadow: 0 8px 32px rgba(0,0,0,0.3);
              }
              h1 { margin-top: 0; }
              button { 
                background: rgba(255,255,255,0.2); 
                color: white; 
                border: 2px solid rgba(255,255,255,0.3); 
                padding: 12px 24px; 
                border-radius: 25px; 
                cursor: pointer; 
                font-size: 16px;
                transition: all 0.3s ease;
              }
              button:hover { 
                background: rgba(255,255,255,0.3); 
                transform: translateY(-2px);
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>🏈 Dynasty Manager</h1>
              <p>Unable to load the application.</p>
              <p>Please restart the application.</p>
              <button onclick="location.reload()">Retry</button>
            </div>
          </body>
        </html>
      `;

        mainWindow.loadURL(
          "data:text/html;charset=utf-8," + encodeURIComponent(errorHtml)
        );
      }
    }
  );

  // Prevent external navigation
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    require("electron").shell.openExternal(url);
    return { action: "deny" };
  });
}

// App event handlers
app.whenReady().then(() => {
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC handlers for localStorage fallback
ipcMain.handle("electron-store-get", async (event, key) => {
  return undefined; // Fall back to localStorage
});

ipcMain.handle("electron-store-set", async (event, key, value) => {
  // Fall back to localStorage
});

ipcMain.handle("electron-store-delete", async (event, key) => {
  // Fall back to localStorage
});

ipcMain.handle("electron-store-clear", async () => {
  // Fall back to localStorage
});

// Security: Prevent new window creation
app.on("web-contents-created", (event, contents) => {
  contents.on("new-window", (event, navigationUrl) => {
    event.preventDefault();
  });
});
