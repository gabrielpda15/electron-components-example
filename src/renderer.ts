import 'reflect-metadata';
import { InterfaceRenderer } from './library/interface-renderer';

const renderer = new InterfaceRenderer();

(async () => {
    renderer.render();
})();