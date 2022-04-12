import { app, BrowserWindow, ipcMain, screen, dialog } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import * as url from 'url';
import * as beautify from 'beautify'
import * as pretty from 'pretty'

let win: BrowserWindow = null;
const args = process.argv.slice(1);
const serve = args.some((val) => val === '--serve');

function createWindow(): BrowserWindow {
  const electronScreen = screen;
  const size = electronScreen.getPrimaryDisplay().workAreaSize;

  // Create the browser window.
  win = new BrowserWindow({
    // x: 0,
    // y: 0,
    width: 1200,
    height: 680,
    minWidth: 940,
    minHeight: 560,
    titleBarStyle: 'hidden',
    webPreferences: {
      nodeIntegration: true,
      allowRunningInsecureContent: serve ? true : false,
      contextIsolation: false, // false if you want to run e2e test with Spectron
    },
  });

  if (serve) {
    // win.webContents.openDevTools();
    require('electron-reload')(__dirname, {
      electron: require(path.join(__dirname, '/../node_modules/electron')),
    });
    win.loadURL('http://localhost:4200');
  } else {
    // Path when running electron executable
    let pathIndex = './index.html';

    if (fs.existsSync(path.join(__dirname, '../dist/index.html'))) {
      // Path when running electron in local folder
      pathIndex = '../dist/index.html';
    }

    win.loadURL(
      url.format({
        pathname: path.join(__dirname, pathIndex),
        protocol: 'file:',
        slashes: true,
      })
    );
  }

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store window
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });

  return win;
}

try {
  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  // Added 400 ms to fix the black background issue while using transparent window. More detais at https://github.com/electron/electron/issues/15947
  app.on('ready', () => {
    /**
     * Testing IPC
     */
    ipcMain.on('closeApp', () => win.close())
    ipcMain.on('minimizeApp', () => win.minimize())
    ipcMain.on('maximizeApp', () => {
      if (win.isMaximized()) win.restore()
      else win.maximize()
    })
    ipcMain.on('ping', (event, message) => console.log(`recieved ${message}!`));
    ipcMain.handle('pong', (event, message) => {
      console.log('se ha hecho un invoke!', message);
      return 'Pong!';
    });

    ipcMain.handle('generate', (event, message) => {
      const css = message[0]
      const html = message[1]
      const pageTitle = message[2]

      const result = dialog.showSaveDialogSync({
        title: 'Select the folder path to save the page files',
        filters: [{ name: 'Folder', extensions: ['*'] }]
      })

      if (result !== undefined) {
        try {
          const dirPath = path.normalize(result)

          // CREATING FOLDER
          fs.mkdirSync(dirPath)

          // CREATING HTML
          fs.writeFileSync(path.join(dirPath, 'index.html'), pretty(`<!DOCTYPE html>
          <html lang="en">
          
          <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${pageTitle}</title>
            <link rel="stylesheet" href="styles.css">
          </head>
          
          <body>
            ${html}
          </body>
          
          </html>`))

          // CREATING CSS
          fs.writeFileSync(path.join(dirPath, 'styles.css'), beautify(`html, body {
          position: relative; user-select: none; font-family: roboto; } ${css}
          @font-face {
            font-family: roboto;
            src: url(Roboto-Regular.ttf);
          }
          
          @font-face {
              font-family: roboto_medium;
              src: url(Roboto-Medium.ttf);
          }`, { format: 'css' }))

          //CREATING FONTS
          fs.copyFileSync(path.join(__dirname, '..', 'src', 'assets', 'fonts', 'roboto', 'Roboto-Regular.ttf'), 
          path.join(dirPath, 'Roboto-Regular.ttf'))

          fs.copyFileSync(path.join(__dirname, '..', 'src', 'assets', 'fonts', 'roboto', 'Roboto-Medium.ttf'),
          path.join(dirPath, 'Roboto-Medium.ttf'))

          return 'Page files created successfully ✨'

        } catch (error) {
          console.error(error)
          return 'Something went wrong 😭'
        }
      }
    })

    setTimeout(createWindow, 400);
  });

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
      createWindow();
    }
  });
} catch (e) {
  // Catch Error
  // throw e;
}
