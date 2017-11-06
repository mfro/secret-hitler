import { EventEmitter } from 'events';

import * as WebSocket from 'ws';

import { json } from '../util';

import { Game, Player, GameState } from '../game';

export class Socket extends EventEmitter {
    readonly player: Player;
    readonly game: Game;

    private base: WebSocket;

    constructor(base: WebSocket, player: Player) {
        super();

        this.game = player.game;
        this.base = base;

        this.player = player;

        this.base.on('close', this.onClose.bind(this));
        this.base.on('message', this.onMessage.bind(this));
    }

    sync() {
        this.base.send(JSON.stringify({
            name: 'state',
            args: json.serialize(this.game, this.player),
        }));
    }

    sendResult(result: { name: string, args: any }) {
        this.base.send(JSON.stringify({
            name: 'result',
            args: result,
        }));
    }

    close() {
        this.base.close();
    }

    private onClose(code: number, message: string) {
        if (this.game.state == GameState.LOBBY) {
            this.game.removePlayer(this.player);
        }

        this.emit('close');
    }

    private onMessage(data: WebSocket.Data) {
        if (typeof data != 'string')
            throw new Error('Invalid binary message');

        let msg = JSON.parse(data);

        this.emit('message', msg);
    }
}