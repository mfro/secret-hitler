import * as url from 'url'
import * as http from 'http';
import * as WebSocket from 'ws';

import * as actions from '../actions';

import { Socket } from './socket';
import { Context } from './context';

let contexts = new Map<string, Context>();

function onConnect(base: WebSocket, req: http.IncomingMessage) {
    let info = url.parse(req.url!, true);

    if (info.pathname == '/create') {
        let name = info.query.name;

        let context = new Context();
        context.join(base, name);

        contexts.set(context.game.name, context);
        context.on('complete', () => contexts.delete(context.game.name));
        return;
    }

    if (info.pathname == '/join') {
        let name = info.query.name;
        let game = info.query.game;

        let context = contexts.get(game);
        if (context == null) return base.close();

        context.join(base, name);
        return;
    }

    if (info.pathname == '/rejoin') {
        let id = parseInt(info.query.id);
        let game = info.query.game;

        let context = contexts.get(game);
        if (context == null) return base.close();

        context.rejoin(base, id);
        return;
    }

    if (info.pathname == '/watch') {
        let game = info.query.game;

        let context = contexts.get(game);
        if (context == null) return base.close();

        context.watch(base);
    }
}

function shouldHandle(req: http.IncomingMessage) {
    let info = url.parse(req.url!, true);

    if (info.pathname == '/create') {
        let name = info.query.name;

        return name != null;
    }

    if (info.pathname == '/join') {
        let game = info.query.game;
        let name = info.query.name;

        let context = contexts.get(game);
        if (context == null)
            return false;

        return context.canJoin(name);
    }

    if (info.pathname == '/rejoin') {
        let game = info.query.game;
        let id = parseInt(info.query.id);

        let context = contexts.get(game);
        if (context == null)
            return false;

        return context.canRejoin(id);
    }

    if (info.pathname == '/watch') {
        let game = info.query.game;

        let context = contexts.get(game);
        if (context == null)
            return false;

        return true;
    }

    return false;
};

export function start() {
    const port = 8081;
    const httpServer = http.createServer();

    const wsServer = new WebSocket.Server({
        port: port,
        server: httpServer,
    });

    wsServer.on('connection', onConnect);
    wsServer.shouldHandle = shouldHandle;

    console.log("Started server on port " + port);
}

function intern(name: string) {
    return name.toLowerCase().replace('\s+', '')
}