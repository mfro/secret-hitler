import * as url from 'url'
import * as http from 'http';
import * as WebSocket from 'ws';

import * as game from './game';

const port = 8081;
const httpServer = http.createServer();

const wsServer = new WebSocket.Server({
    port: port,
    server: httpServer,
});

const sockets = new Map<number, WebSocket>();

wsServer.on('connection', (socket, req) => {
    console.log('new Socket', req.url);

    let info = url.parse(req.url!, true);
    let name = info.query.name;

    let playerId = game.addPlayer(name, (e, d) => send(socket, e, d));

    socket.on('message', e => {
        let msg = JSON.parse(e.toString());
        game.updatePlayer(playerId, msg);
    });

    socket.on('close', e => {
        sockets.delete(playerId);
        game.removePlayer(playerId);
    });

    sockets.set(playerId, socket);
});

wsServer.shouldHandle = (req) => {
    let info = url.parse(req.url!, true);
    let name = info.query.name;

    if (!game.isValidName(name))
        return false;

    return true;
};

function send(socket: WebSocket, type: string, data: any) {
    if (socket.readyState != WebSocket.OPEN) {
        console.log('Failed to send: ' + type, socket.readyState, data);
        return;
    }

    socket.send(JSON.stringify({
        type: type,
        data: data,
    }));
}

export function start() {
    console.log("Started server on port " + port);
}