import Vue from 'vue';

let ignoreNextClick = false;

Vue.directive('fastclick', {
    inserted(el, binding, vnode) {
        let isPressed = false;
        let touchStart = null;

        function cancel() {
            setPressed(false);
            touchStart = null;
        }

        function setPressed(value) {
            isPressed = value;

            let key = binding.expression.split(',')[1];
            if (!key) return;

            Vue.set(vnode.context, key.trim(), isPressed);
        }

        function emit() {
            setTimeout(() => {
                let key = binding.expression.split(',')[0];
                if (!key) return;

                vnode.context[key.trim()]();
            }, 10);
        }

        el.addEventListener('click', e => {
            if (ignoreNextClick) return ignoreNextClick = false;

            emit();
        }, { passive: true });

        el.addEventListener('touchstart', e => {
            touchStart = {
                x: e.changedTouches[0].clientX,
                y: e.changedTouches[0].clientY,
            };
            setPressed(true);
        }, { passive: true });

        el.addEventListener('touchend', e => {
            if (!touchStart) return;

            ignoreNextClick = true;
            emit();
            cancel();
        }, { passive: true });

        el.addEventListener('touchcancel', cancel, { passive: true });
    }
});