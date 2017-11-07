let container;

export function loadImage(path) {
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

    return new Promise(resolve => {
        let image = new Image();
        image.src = path;
        image.onload = resolve;
        image.style.position = 'absolute';
        container.appendChild(image);
    });
}