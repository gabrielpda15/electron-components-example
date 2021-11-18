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

    const renderer = document.createElement('script');
    renderer.type = 'text/javascript';
    renderer.src = 'renderer.js';
    document.body.appendChild(renderer);

    const exportsDeclaration = document.createElement('script');
    renderer.type = 'text/javascript';
    exportsDeclaration.innerHTML = 'var exports = {};';
    document.head.appendChild(exportsDeclaration);
});