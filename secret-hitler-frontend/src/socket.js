import store from './store';

let lastIsReady = false;
store.subscribe((mutation, state) => {
    if (mutation.type == 'setSelf') {
        if (!ws) {
            init(state.self);
        }
    }

    if (mutation.type == 'setReady') {
        if (state.self.isReady != lastIsReady) {
            send(state.self);
            lastIsReady = state.self.isReady;
        }
    }

    if (mutation.type == 'reset') {
        ws.close();
        ws = null;
    }
});

let ws;
const handlers = {
    self(self) {
        store.commit('setSelf', self);
    },

    update(list) {
        store.commit('setPlayerList', list);
    },

    assignment(info) {
        store.commit('setAssignment', info);
        ws.close();
    }
};

export function close() {
    ws.close();
}

function init(self) {
    let base;
    if (location.hostname == 'localhost')
        base = 'http://localhost:8081';
    else
        base = 'https://api.mfro.me/secret-hitler';

    let url = base.replace('http', 'ws');

    ws = new WebSocket(url + '/socket?name=' + self.name);

    ws.addEventListener('message', e => {
        let msg = JSON.parse(e.data);
        let handler = handlers[msg.type];

        if (!handler) {
            console.error('No handler for event: ' + JSON.stringify(msg));
            return;
        }

        handler(msg.data);
    });

    ws.addEventListener('error', e => {
        store.commit('setSelf', null);
        ws = null;
    });

    ws.addEventListener('close', e => {
        if (store.state.assignment == null && store.state.self != null) {
            location.reload();
        }
    });
}

function send(body) {
    ws.send(JSON.stringify(body));
}