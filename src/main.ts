import 'reflect-metadata';
import path from 'path';
import { ElectronReloader } from './reloader';
import { app, BrowserWindow } from 'electron';
import { config } from 'dotenv';

config({ path: '.env' });

var mainWindow: BrowserWindow;

const reloader = new ElectronReloader(path.resolve(__dirname, 'styles.css'), { });
reloader.startWatcher(1);

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 720,
        frame: false,
        resizable: false,
        icon: path.join(__dirname, `/assets/icon.png`),
        webPreferences: {
            nodeIntegration: true,
            nodeIntegrationInWorker: true,
            contextIsolation: false,
            preload: path.join(__dirname, `/preload.js`),
        }
    });

    const url = {
        pathname: path.join(__dirname, `index.html`),
        protocol: 'file:'
    };

    mainWindow.loadURL(`${url.protocol}//${url.pathname}`);
    if (process.env.DEBUG == 'true') {
        mainWindow.webContents.openDevTools();
    }
    mainWindow.on('closed', function () {
        mainWindow = null
    });
}

function onReady() {
    createWindow();

    require('@electron/remote/main').initialize();
    require('@electron/remote/main').enable(mainWindow.webContents);
}

app.on('ready', onReady);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
    if (mainWindow === null) createWindow();
});