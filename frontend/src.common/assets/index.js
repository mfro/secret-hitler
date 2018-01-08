import { setTimeout } from "timers";

let container;
let waiting = Promise.resolve();
const context = require.context('.', true, /\.(png|jpe?g|gif|svg)(\?.*)?$/);

for (let key of context.keys()) {
    let path = context(key);

    loadImage(path);
}

function loadImage(path) {
    if (!container) {
        container = document.createElement('div');
        container.style.opacity = '0';
        container.style.position = 'absolute';
        container.style.pointerEvents = 'none';
        container.style.top = '0';
        container.style.left = '0';
        container.style.right = '0';
        container.style.bottom = '0';
        container.style.overflow = 'hidden';
        document.body.appendChild(container);
    }   

    const tmp = path.slice(0, 100);

    return waiting = waiting.then(() => new Promise(resolve => {
        let image = new Image();
        image.src = path;

        image.onload = () => {
            setTimeout(resolve, 100);
        };

        image.onerror = () => {
            setTimeout(resolve, 100);
        };

        image.style.position = 'absolute';
        container.appendChild(image);
    }));
}
