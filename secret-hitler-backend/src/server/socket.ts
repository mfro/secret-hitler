import { EventEmitter } from 'events';

import * as WebSocket from 'ws';

import { json } from '../util';

import { Game, Player as GamePlayer, GameState } from '../game';

export abstract class Socket extends EventEmitter {
    readonly game: Game;

    private base: WebSocket;

    constructor(base: WebSocket, game: Game) {
        super();

        this.game = game;
        this.base = base;

        this.base.on('close', this.onClose.bind(this));
        this.base.on('message', this.onMessage.bind(this));
    }

    abstract sync(): void;

    sendResult(result: { name: string, args: any }) {
        this.send('result', result);
    }

    close() {
        this.base.close();
    }

    protected send(name: string, args: any) {
        this.base.send(JSON.stringify({
            name: name,
            args: args,
        }));
    }

    protected onClose(code: number, message: string) {
        this.emit('close');
    }

    protected onMessage(data: WebSocket.Data) {
        if (typeof data != 'string')
            throw new Error('Invalid binary message');

        let msg = JSON.parse(data);

        this.emit('message', msg);
    }
}

export namespace Socket {
    export class Player extends Socket {
        readonly player: GamePlayer;

        constructor(base: WebSocket, player: GamePlayer) {
            super(base, player.game);

            this.player = player;
        }

        sync() {
            this.send('state', json.serialize(this.game, this.player));
        }

        protected onClose(code: number, message: string) {
            if (this.game.state == GameState.LOBBY) {
                this.game.removePlayer(this.player);
            }

            super.onClose(code, message);
        }
    }

    export class Spectator extends Socket {
        constructor(base: WebSocket, game: Game) {
            super(base, game);
        }

        sync() {
            this.send('state', json.serialize(this.game, null));
        }
    }
}