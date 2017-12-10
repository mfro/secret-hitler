import { EventEmitter } from 'events';

import * as url from 'url'
import * as http from 'http';
import * as WebSocket from 'ws';

import * as actions from '../actions';

import { Socket } from './socket';

import { Game, GameState } from '../game';

export class Context extends EventEmitter {
    readonly game = new Game();
    readonly sockets = new Array<Socket.Bound>();

    private add(socket: Socket.Bound) {
        socket.on('close', () => this.cleanup(socket));
        socket.on('message', m => this.handle(socket, m));

        this.sockets.push(socket);

        this.sync();
    }

    join(unbound: Socket.Unbound, name: string) {
        let player = this.game.allPlayers.find(p => intern(p.name) == intern(name));

        if (player == null) {
            player = this.game.addPlayer(name);
        }

        let socket = unbound.bind(Socket.Player, player);
        this.add(socket);
    }

    rejoin(unbound: Socket.Unbound, id: number) {
        let player = this.game.allPlayers.find(p => p.id == id)!;
        let socket = unbound.bind(Socket.Player, player);

        this.add(socket);
    }

    watch(unbound: Socket.Unbound) {
        let socket = unbound.bind(Socket.Spectator, this.game);

        this.add(socket);
    }

    static isValidName(name: string) {
        if (!name || !intern(name))
            return false;

        return true;
    }

    canJoin(name: string) {
        if (!Context.isValidName(name))
            return false;

        let player = this.game.allPlayers.find(p => intern(p.name) == intern(name));
        if (player == null)
            return this.game.state == GameState.LOBBY;

        let socket = this.sockets.find(s => s instanceof Socket.Player && s.player == player);
        if (socket != null)
            return false;

        return true;
    }

    canRejoin(id: number) {
        let player = this.game.allPlayers.find(p => p.id == id);

        if (player == null)
            return false;

        let socket = this.sockets.find(s => s instanceof Socket.Player && s.player == player);

        if (socket != null)
            return false;

        return true;
    }

    private dispose() {
        for (let socket of this.sockets) {
            socket.close();
            this.cleanup(socket);
        }

        this.emit('complete');
        this.removeAllListeners();
    }

    private sync() {
        if (this.sockets.length == 0) {
            this.dispose();
            return;
        }

        let results = this.game.update();

        for (let socket of this.sockets) {
            socket.sync();

            for (let result of results) {
                socket.sendResult(result);
            }
        }

        if (this.game.state == GameState.COMPLETED) {
            this.dispose();
            return;
        }
    }

    private handle(socket: Socket, msg: { name: string, args: any }) {
        if (!(socket instanceof Socket.Player)) {
            console.error('Got message from non-player socket', msg);
            return;
        }

        let ctx = {
            game: this.game,
            params: msg.args,
            sender: socket.player,
        };

        return actions.invoke(msg.name, ctx).catch(e => {
            console.error(e);
        }).finally(() => {
            try {
                this.sync();
            } catch (e) {
                console.error(e)
            }
        });
    }

    private cleanup(socket: Socket.Bound) {
        let index = this.sockets.indexOf(socket);
        if (index != -1)
            this.sockets.splice(index, 1);

        this.sync();
    }
}

function intern(name: string) {
    return name.toLowerCase().replace('\s+', '')
}
