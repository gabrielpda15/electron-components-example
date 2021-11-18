import fs from 'fs';
import path from 'path';

window.addEventListener('DOMContentLoaded', () => {
    fs.readFile(
        path.resolve(__dirname, 'assets/config.json'),
        { encoding: 'utf-8' },
        (err, data) => {
            try {
                document.title = JSON.parse(data).title;
            } catch { }
        }
    );

    const exportsDeclaration = document.createElement('script');
    exportsDeclaration.type = 'text/javascript';
    exportsDeclaration.innerHTML = 'const { setTimeout, setInterval } = require(\'timers\'); var exports = {};';
    document.head.appendChild(exportsDeclaration);

    const renderer = document.createElement('script');
    renderer.type = 'text/javascript';
    renderer.src = 'renderer.js';
    document.body.appendChild(renderer);
});