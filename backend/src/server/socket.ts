import { EventEmitter } from 'events';

import * as WebSocket from 'ws';

import { json } from '../util';

import { Game, Player as GamePlayer, GameState } from '../game';

export abstract class Socket extends EventEmitter {
    private base: WebSocket;

    constructor(base: WebSocket) {
        super();

        this.base = base;

        this.onClose = this.onClose.bind(this);
        this.onError = this.onError.bind(this);
        this.onMessage = this.onMessage.bind(this);

        this.base.on('close', this.onClose);
        this.base.on('error', this.onError);
        this.base.on('message', this.onMessage);
    }

    sendError(error: { name: string, args: any }) {
        this.send('error', error);
    }

    close() {
        this.base.close();
    }

    protected upgrade<TSocket extends Socket, T>(ctor: new (base: WebSocket, arg: T) => TSocket, arg: T) {
        this.removeAllListeners();
        this.base.removeListener('close', this.onClose);
        this.base.removeListener('error', this.onError);
        this.base.removeListener('message', this.onMessage);

        return new ctor(this.base, arg);
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

    protected onError(e: Error) {
        console.error(e);
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
    export class Unbound extends Socket {
        bind<TSocket extends Socket, T>(ctor: new (base: WebSocket, arg: T) => TSocket, arg: T) {
            return super.upgrade(ctor, arg);
        }
    }

    export abstract class Bound extends Socket {
        readonly game: Game;

        constructor(base: WebSocket, game: Game) {
            super(base);

            this.game = game;
        }

        abstract sync(): void;

        sendResult(result: { name: string, args: any }) {
            this.send('result', result);
        }
    }

    export class Player extends Bound {
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

    export class Spectator extends Bound {
        constructor(base: WebSocket, game: Game) {
            super(base, game);
        }

        sync() {
            this.send('state', json.serialize(this.game, null));
        }
    }
}
