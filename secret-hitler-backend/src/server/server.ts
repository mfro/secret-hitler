import * as url from 'url'
import * as http from 'http';
import * as WebSocket from 'ws';

import * as actions from '../actions';

import { Socket } from '.';

import { Game } from '../game';

let game: Game;
newGame();

const sockets = new Array<Socket>();

function newGame() {
    game = new Game();
}

function sync() {
    let results = game.update();

    for (let socket of sockets) {
        socket.sync();

        for (let result of results) {
            socket.sendResult(result);
        }
    }
}

function handle(socket: Socket, msg: { name: string, args: any }) {
    let ctx = {
        game: game,
        params: msg.args,
        sender: socket.player,
    };

    return actions.invoke(msg.name, ctx).then(() => {
        sync();
    }, e => {
        console.error(e);
    }).finally(() => {
        try {
            sync();
        } catch (e) {
            console.error(e)
        }
    });
}

function cleanup(socket: Socket) {
    let index = sockets.indexOf(socket);
    if (index < 0)
        throw new Error(`Socket not found: ${socket}`);

    sockets.splice(index, 1);

    sync();
}

const port = 8081;
const httpServer = http.createServer();

const wsServer = new WebSocket.Server({
    port: port,
    server: httpServer,
});

wsServer.on('connection', (base, req) => {
    console.log('new Socket', req.url);

    let info = url.parse(req.url!, true);

    if (info.pathname == '/join') {
        let name = info.query.name;

        let player = game.addPlayer(name);
        let socket = new Socket(base, player);

        socket.on('close', () => cleanup(socket));
        socket.on('message', m => handle(socket, m));

        sockets.push(socket);
    } else if (info.pathname == '/rejoin') {
        let id = parseInt(info.query.id);

        let player = game.allPlayers.find(p => p.id == id)!;
        let socket = new Socket(base, player);

        socket.on('close', () => cleanup(socket));
        socket.on('message', m => handle(socket, m));

        sockets.push(socket);
    }

    sync();
});

wsServer.shouldHandle = (req) => {
    let info = url.parse(req.url!, true);
    let name = info.query.name;

    if (info.pathname == '/join') {
        let name = info.query.name;
        let player = game.allPlayers.find(p => intern(p.name) == intern(name));
        return intern(name) != null && player == null;
    }

    if (info.pathname == '/rejoin') {
        let id = parseInt(info.query.id);
        let player = game.allPlayers.find(p => p.id == id);
        let socket = sockets.find(s => s.player == player);
        return player != null && socket == null;
    }

    return false;
};

export function start() {
    console.log("Started server on port " + port);
}

function intern(name: string) {
    return name.toLowerCase().replace('\s+', '')
}