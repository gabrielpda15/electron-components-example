import { app, BrowserWindow } from 'electron';
import { spawn } from 'child_process';
import chokidar from 'chokidar';
import fs from 'fs';
import { runInThisContext } from 'vm';

const appPath = app.getAppPath();
const ignoredPaths = /node_modules|[/\\]\./;
const runCommand = (command: string, method: 'exit' | 'quit', ...args: string[]) => {
    const child = spawn(command, [appPath, ...args], { detached: true, stdio: 'inherit' });
    child.unref();

    if (method === 'exit') {
        app.exit();
    } else {
        app.quit();
    }
};

export class ElectronReloader {

    private pattern: string;
    private options: ElectronReloaderOptions;

    private reloadTimeout: NodeJS.Timeout;
    private mainWindowId: number;
    private windows: BrowserWindow[];
    private watcher: chokidar.FSWatcher;
    private events: { [key: string]: Function[] };

    constructor(
        pattern: string,
        options?: ElectronReloaderOptions
    ) {
        this.pattern = pattern;

        this.options = options ?? {};
        this.options.hardResetMethod ??= 'quit';
        this.options.forceHardReset ??= false;
        this.options.timeout = isNaN(this.options.timeout) ? 1500 : this.options.timeout;

        this.options.ignored ??= [];
        if (!Array.isArray(this.options.ignored)) this.options.ignored = [this.options.ignored];
        this.options.ignored.push(ignoredPaths);
        if (this.options.forceHardReset === false) this.options.ignored.push('main.js');

        this.windows = [];
        this.events = {};
    }

    public startWatcher(mainWindowId?: number): void {
        if (!this.watcher) this.createWatcher();

        this.createDefaultEvents();

        app.on('browser-window-created', (e, bw) => {
            this.windows.push(bw);
            if (bw.id === mainWindowId) this.mainWindowId = mainWindowId;

            bw.on('closed', () => {
                try {
                    const i = this.windows.indexOf(bw);
                    this.windows.splice(i, 1);
                    if (mainWindowId === bw.id) this.mainWindowId = null;
                } catch { }
            });
        });

        if (this.options.forceHardReset === true) this.watcher.once('change', (...e) => this.resetHandler(...e));
        else this.watcher.on('change', (p, s) => this.resetHandler(p, s));
    }

    private createWatcher(): void {
        if (this.options.forceHardReset === true) {
            this.watcher = chokidar.watch([this.pattern, 'main.js'], this.options);
        } else {
            this.watcher = chokidar.watch(this.pattern, this.options);
        }
    }

    private createDefaultEvents(): void {
        if (process.env.DEBUG == 'true') {
            this.on('before-reload', () => {
                this.windows.forEach(bw => {
                    if (bw.webContents.isDevToolsOpened()) {
                        bw.webContents.closeDevTools();
                    }
                });
            });
    
            this.on('after-reload', () => {
                if (this.mainWindowId != null) {
                    let bw = this.windows.find(x => x.id === this.mainWindowId);
                    if (bw) bw.webContents.openDevTools();
                }
            });
        }
    }

    private resetHandler(...args: any[]): void {
        clearTimeout(this.reloadTimeout);        
        this.reloadTimeout = setTimeout(() => {
            this.emit('before-reload');

            if (this.options.forceHardReset === false) {
                this.windows.forEach(bw => bw.webContents.reloadIgnoringCache());
            }

            if (this.options.command) {
                runCommand(this.options.command, this.options.hardResetMethod);
            }

            this.emit('after-reload');
        }, this.options.timeout);
    }

    private emit<T extends keyof ElectronReloaderEvents>(type: T, ...args: any[]): void {
        if (this.events[type] && this.events[type].length > 0) {
            this.events[type].forEach(callback => callback(...args));
        }
    }

    public addEventListener<T extends keyof ElectronReloaderEvents>(
        type: T,
        listener: ElectronReloaderEvents[T]
    ): void {
        this.events[type] ??= [];
        this.events[type].push(listener);
    }

    public removeEventListener<T extends keyof ElectronReloaderEvents>(
        type: T,
        listener: ElectronReloaderEvents[T]
    ): void {
        if (this.events[type] && this.events[type].length > 0) {
            const i = this.events[type].indexOf(listener);
            this.events[type].splice(i, 1);
        }
    }

    public on<T extends keyof ElectronReloaderEvents>(
        type: T,
        listener: ElectronReloaderEvents[T]
    ): void {
        this.addEventListener(type, listener);
    }

}

export interface ElectronReloaderEvents {
    'before-reload': () => any;
    'after-reload': () => any;
}

export interface ElectronReloaderOptions extends chokidar.WatchOptions {
    command?: string;
    hardResetMethod?: 'exit' | 'quit';
    forceHardReset?: boolean;
    timeout?: number;
}