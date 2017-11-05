import store from './store';

let ws;

export function close() {
    ws.close();
}

function connect(path) {
    let base;
    if (location.hostname == 'localhost')
        base = 'http://localhost:8081';
    else
        base = 'https://api.mfro.me/secret-hitler';

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

    ws.addEventListener('error', e => {
        store.commit('SET_GAME', null);
        ws = null;
    });
}

export function rejoin(id) {
    connect('/rejoin?id=' + id);
}

export function join(name) {
    connect('/join?name=' + name);
}

export function send(name, args) {
    ws.send(JSON.stringify({
        name: name,
        args: args,
    }));
}
