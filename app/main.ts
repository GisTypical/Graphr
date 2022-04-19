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
    frame: false,
    webPreferences: {
      webSecurity: false,
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

    ipcMain.handle('image', (event, message) => {
      const img = dialog.showOpenDialogSync({
        title: 'Select an image',
        filters: [{ name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'svg'] }]
      })

      if (img !== undefined) {
        const imgPath = path.normalize(img[0])
        return imgPath
      }
    })

    ipcMain.handle('generate', (event, message) => {
      const html = message[0]
      const css = message[1]
      const js = message[2]
      const pageTitle = message[3]

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
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap" rel="stylesheet">
          </head>
          
          <body>
            ${html}
            <script src="index.js"></script>
          </body>
          
          </html>`))

          // CREATING CSS
          fs.writeFileSync(path.join(dirPath, 'styles.css'), beautify(`* {
            margin: 0;
            padding: 0;
          }
          html, body {
          position: relative;
          user-select: none;
          font-family: 'Roboto', sans-serif; } ${css}`, { format: 'css' }))

          // CREATING JS
          fs.writeFileSync(path.join(dirPath, 'index.js'), beautify(`class FadeInAnimation {

            constructor(elementID, opacity) {
                this.elementID = elementID
                this.opacity = opacity
            }
        
            fadeIn() {
                const element = document.getElementById(this.elementID)
                element.style.opacity = this.opacity
            }
          }

          class SlideAnimation {
            constructor(elementID, top, left) {
                this.elementID = elementID
                this.top = top
                this.left = left
            }
        
            slideDown() {
                const element = document.getElementById(this.elementID)
                element.style.top = this.top
            }

            slideToRight() {
              const element = document.getElementById(this.elementID)
              element.style.left = this.left
            }
          }
          
          window.onload = () => {
              ${js}
          }`, { format: 'js' }))

          return true

        } catch (error) {
          console.error(error)
          return false
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
