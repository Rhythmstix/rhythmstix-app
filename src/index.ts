import { app, ipcMain } from "electron";
import { createCapacitorElectronApp } from "@capacitor-community/electron";
import { protocol } from "electron";
import * as path from 'path';
const { autoUpdater } = require('electron-updater');

// The MainWindow object can be accessed via myCapacitorApp.getMainWindow()
const myCapacitorApp = createCapacitorElectronApp({
  splashScreen: {
    splashOptions: {
      imageFilePath: path.join(app.getAppPath(), "assets", "splash.png")
    }
  },
  mainWindow: {
    windowOptions: {
      icon:"./assets/appIcon.png",
      webPreferences: {
        nodeIntegration: true,
        enableRemoteModule: true,
      },
    },
  },
});
app.whenReady().then(() => {
  // myCapacitorApp.getMainWindow().setMenuBarVisibility(false)
  protocol.registerFileProtocol("file", (request, callback) => {
    const pathname = decodeURI(request.url.replace("file:///", ""));
    callback(pathname);
  });
});
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some Electron APIs can only be used after this event occurs.
app.on("ready", () => {
  myCapacitorApp.init();
  autoUpdater.checkForUpdatesAndNotify();
  // myCapacitorApp.getMainWindow().once('ready-to-show', () => {
  // });
});

// Quit when all windows are closed.
app.on("window-all-closed", function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (myCapacitorApp.getMainWindow().isDestroyed()) myCapacitorApp.init();
});

// Define any IPC or other custom functionality below here

ipcMain.on('app_version', (event) => {
  event.sender.send('app_version', { version: app.getVersion() });
});

  
autoUpdater.on('update-available', () => {
  myCapacitorApp.getMainWindow().webContents.send('update_available');
});
autoUpdater.on('update-downloaded', () => {
  myCapacitorApp.getMainWindow().webContents.send('update_downloaded');
});
ipcMain.on('restart_app', () => {
  autoUpdater.quitAndInstall();
});