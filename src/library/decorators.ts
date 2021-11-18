import { ComponentOptions } from './models/component-options';
import { ModuleOptions } from './models/module-options';

export function ElectronComponent(options: ComponentOptions, fileName: string) {
    return function (target: any): void {
        Reflect.defineMetadata('component-options', options, target);        
        Reflect.defineMetadata('component-file', fileName, target);
    };
}

export function ElectronModule(options: ModuleOptions) {
    return function (target: any): void {
        Reflect.defineMetadata('module-options', options, target);
    }
}