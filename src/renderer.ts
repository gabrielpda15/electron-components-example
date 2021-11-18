import 'reflect-metadata';
import glob from 'glob';
import path from 'path';
import fs from 'fs';

import { AppModule } from './app/app.module';
import { ModuleOptions } from './library/models/module-options';
import { ComponentOptions } from './library/models/component-options';

let rootNode: Element = null;

loadModule(AppModule);
const modulesOutlets = document.getElementsByTagName('module-outlet');
loadSubModules(AppModule);

function loadModule(module: any, parent?: Element) {
    const options: ModuleOptions = Reflect.getMetadata('module-options', module);

    if (parent && options?.bootstrap) {
        loadComponent(options.bootstrap, parent);
    } else if (options?.bootstrap) {
        const bootstrapOptions: ComponentOptions = Reflect.getMetadata('component-options', options.bootstrap);
        const tag = document.createElement(bootstrapOptions.selector);
        if (rootNode) {
            rootNode.append(tag);
        } else {
            rootNode = tag;
            document.body.prepend(tag);
        }
        loadComponent(options.bootstrap);
    }

    if (options?.declarations && options.declarations.length > 0) {
        options.declarations.forEach(d => {
            loadComponent(d);
        });
    }
}

function loadSubModules(module: any) {
    const options: ModuleOptions = Reflect.getMetadata('module-options', module);

    if (options?.imports && options.imports.length > 0) {
        options.imports.forEach(m => {
            loadModule(m, findModuleOutlet(m.name));
            loadSubModules(m);
        });
    }
}

function loadComponent(component: any, parent?: Element) {
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

        for (let i = 0; i < elements.length; i++) {
            elements.item(i).innerHTML = template;
        }
    }
}

function findModuleOutlet(name: string): Element {
    for (let i = 0; i < modulesOutlets.length; i++) {
        if (modulesOutlets.item(i).attributes.getNamedItem('name').value === name) {
            return modulesOutlets.item(i);
        }
    }
}