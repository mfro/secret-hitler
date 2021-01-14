import * as url from 'url'
import * as http from 'http';
import * as WebSocket from 'ws';

import * as actions from '../actions';

import { Socket } from './socket';
import { Context } from './context';
import { Dispatcher } from './dispatcher';

import * as packageJson from '../../package.json';

let dispatcher = new Dispatcher();

function onConnect(base: WebSocket, req: http.IncomingMessage) {
    let socket = new Socket.Unbound(base);
    dispatcher.add(socket);
}

export function start() {
    const httpServer = http.createServer();
    const wsServer = new WebSocket.Server({
        server: httpServer,
    });

    wsServer.on('connection', onConnect);

    let port = process.argv[2] ? parseInt(process.argv[2]) : 8081;

    httpServer.listen(port, () => {
        let addr = httpServer.address()!;
        let info = typeof addr == 'string' ? addr : addr.port;
        console.log(`Started server version ${packageJson.version}: ${info}`);
    });
}
