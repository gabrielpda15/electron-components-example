import fs from 'fs';
import path from 'path';
import { AppModule } from '../app/app.module';
import { ComponentOptions } from './models/component-options';
import { ModuleOptions } from './models/module-options';

export class InterfaceRenderer {

    public rootNode: Element = null;
    public modulesOutlets: HTMLCollectionOf<Element> = null;

    constructor() { }

    public render(): void {
        this.loadModule(AppModule);
        this.modulesOutlets = document.getElementsByTagName('module-outlet');
        this.loadSubModules(AppModule);
    }

    private loadModule(module: any, parent?: Element): void {
        const options: ModuleOptions = Reflect.getMetadata('module-options', module);
    
        if (parent && options?.bootstrap) {
            this.loadComponent(options.bootstrap, parent);
        } else if (options?.bootstrap) {
            const bootstrapOptions: ComponentOptions = Reflect.getMetadata('component-options', options.bootstrap);
            const tag = document.createElement(bootstrapOptions.selector);
            if (this.rootNode) {
                this.rootNode.append(tag);
            } else {
                this.rootNode = tag;
                document.body.prepend(tag);
            }
            this.loadComponent(options.bootstrap);
        }
    
        if (options?.declarations && options.declarations.length > 0) {
            options.declarations.forEach(d => {
                this.loadComponent(d);
            });
        }
    }

    private loadSubModules(module: any): void {
        const options: ModuleOptions = Reflect.getMetadata('module-options', module);
    
        if (options?.imports && options.imports.length > 0) {
            options.imports.forEach(m => {
                this.loadModule(m, this.findModuleOutlet(m.name));
                this.loadSubModules(m);
            });
        }
    }

    private loadComponent(component: any, parent?: Element): void {
        const options: ComponentOptions = Reflect.getMetadata('component-options', component);
        if (options) {
            if (parent) {
                parent.outerHTML = `<${options.selector}></${options.selector}>`;
            }
    
            const elements = document.getElementsByTagName(options.selector);
            let template = options.template
    
            if (!template) {
                const file = Reflect.getMetadata('component-file', component);
                template = fs.readFileSync(path.resolve(path.dirname(file), options.templateUrl), { encoding: 'utf-8' });
            }

            const instance = new component();
            if (typeof instance?.onInit == 'function') instance.onInit();
    
            const interpolationRegex = /\{\{[ ]*([^ ]*)[ ]*\}\}/g;
            const match = template.match(interpolationRegex);
            if (match && match.length > 0) {
                template = template.replace(interpolationRegex, (value, ...args) => {
                    if ((<string>args[0]).endsWith('()')) {
                        return instance[(<string>args[0]).replace('()', '')]();
                    } else {
                        return instance[args[0]];
                    }
                });
            }

            if (typeof instance?.onViewInit == 'function') instance.onViewInit();

            for (let i = 0; i < elements.length; i++) {
                elements.item(i).innerHTML = template;
            }

            if (typeof instance?.onAfterViewInit == 'function') instance.onAfterViewInit();
        }
    }

    private findModuleOutlet(name: string): Element {
        for (let i = 0; i < this.modulesOutlets.length; i++) {
            if (this.modulesOutlets.item(i).attributes.getNamedItem('name').value === name) {
                return this.modulesOutlets.item(i);
            }
        }
    }

}