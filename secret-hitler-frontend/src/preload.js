let container;

export function loadImage(path) {
    if (!container) {
        container = document.createElement('div');
        container.style.opacity = '0';
        container.style.position = 'absolute';
        container.style.pointerEvents = 'none';
        document.body.appendChild(container);
    }

    return new Promise(resolve => {
        let image = new Image();
        image.src = path;
        image.onload = resolve;
        container.appendChild(image);
    });
}