let ws;
let store;

function connect(path) {
    let base;
    if (location.hostname == 'mfro.me')
        base = 'https://api.mfro.me/secret-hitler';
    else
        base = 'http://' + location.hostname + ':8081';

    let url = base.replace('http', 'ws');

    ws = new WebSocket(url + path);

    ws.addEventListener('message', e => {
        let msg = JSON.parse(e.data);

        if (msg.name == 'state') {
            store.commit('SET_GAME', msg.args);
        }

        if (msg.name == 'result') {
            store.commit('POST_RESULT', msg.args);
        }

        console.log(msg);
    });

    ws.addEventListener('open', e => {
        store.commit('SET_CONNECTION', 'OPEN');
    })

    ws.addEventListener('close', e => {
        dispose();
    });

    ws.addEventListener('error', e => {
        console.error(e);
        dispose();
    });

    store.commit('SET_CONNECTION', 'CONNECTING');
}

export function init(s) {
    store = s;
    loadRejoinInfo();
}

export function reset() {
    dispose();
}

export function rejoin(game, id) {
    connect(`/rejoin?game=${game}&id=${id}`);
}

export function join(game, name) {
    connect(`/join?game=${game}&name=${name}`);
}

export function watch(game) {
    connect('/watch?game=' + game);
}

export function create(name) {
    connect('/create?name=' + name);
}

export function send(name, args) {
    ws.send(JSON.stringify({
        name: name,
        args: args,
    }));
}

function dispose() {
    if (ws && ws.readyState == WebSocket.OPEN)
        ws.close();

    store.commit('SET_CONNECTION', null);

    let game = store.getters.game;
    if (game && game.state == 'COMPLETED')
        return;

    localStorage.removeItem('secret-hitler/rejoin-info');
    store.commit('SET_GAME', null);
    ws = null;
}

function loadRejoinInfo() {
    try {
        const raw = localStorage.getItem('secret-hitler/rejoin-info');
        if (!raw) return;
        const info = JSON.parse(raw);
        if (!info || !(info instanceof Array)) return;

        rejoin(info[0], info[1]);
    } catch (e) {
        localStorage.removeItem('secret-hitler/rejoin-info');
    }
}

window.addEventListener('keydown', e => {
    if (e.keyCode == 116) {
        if (store.getters.localPlayer &&
            store.getters.game.state != 'LOBBY') {
            e.preventDefault();
            try {
                localStorage.setItem('secret-hitler/player-id', state.getters.localPlayer.id);
            } catch (e) { }

            setTimeout(() => {
                window.location.reload();
            }, 500);
        }
    }
});
