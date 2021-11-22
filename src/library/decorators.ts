import { ComponentOptions } from './models/component-options';
import { ModuleOptions } from './models/module-options';

export function Component(options: ComponentOptions, fileName: string) {
    return function (target: any): void {
        Reflect.defineMetadata('component-options', options, target);        
        Reflect.defineMetadata('component-file', fileName, target);
    };
}

export function Module(options: ModuleOptions) {
    return function (target: any): void {
        Reflect.defineMetadata('module-options', options, target);
    }
}

export function ViewChild(id: string) {
    return function (target: any, propertyKey: string): void {
        Object.defineProperty(target, propertyKey, {
            get: () => document.getElementById(id)
        });
    };
}