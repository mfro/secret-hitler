let ignoreNextClick = false;

export function inserted(el, binding, vnode) {
    let isPressed = false;
    let touchStart = null;

    function cancel() {
        setPressed(false);
        touchStart = null;
    }

    function setPressed(value) {
        isPressed = value;

        let key = binding.expression || 'touch-active';

        if (!vnode.data.class)
            vnode.data.class = [];

        if (vnode.context.$styleMapping)
            key = vnode.context.$styleMapping(key);
        
        el.classList.toggle(key, value);
    }

    el.addEventListener('touchstart', e => {
        touchStart = {
            x: e.changedTouches[0].clientX,
            y: e.changedTouches[0].clientY,
        };
        setPressed(true);
    }, { passive: true });

    el.addEventListener('touchend', e => {
        if (!touchStart) return;

        cancel();
    }, { passive: true });

    el.addEventListener('touchcancel', cancel, { passive: true });
}
