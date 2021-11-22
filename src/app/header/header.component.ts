import { Component, ViewChild } from '../../library/decorators';
import { BrowserWindow } from '@electron/remote';
import config from '../../assets/config.json';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html'
}, __filename)
export class HeaderComponent {

    @ViewChild('btn-minimize') private btnMinimize: HTMLElement;
    @ViewChild('btn-close') private btnClose: HTMLElement;

    constructor() { }

    public get title(): string {        
        return config.title;
    }

    public onAfterViewInit(): void {
        this.btnMinimize.addEventListener('click', (e) => this.onMinimizeClick(e));
        this.btnClose.addEventListener('click', (e) => this.onCloseClick(e));
    }

    private onMinimizeClick(e: MouseEvent): void {
        BrowserWindow.getFocusedWindow().minimize();
    }

    private onCloseClick(e: MouseEvent): void {
        BrowserWindow.getFocusedWindow().close();
    }

}