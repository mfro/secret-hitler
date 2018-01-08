import { Context } from './context';
import { Socket } from './socket';

import * as packageJson from '../../package.json';

export class Dispatcher {
    private readonly contexts = new Map<string, Context>();

    add(socket: Socket.Unbound) {
        socket.on('message', m => this.handle(socket, m));
    }


    private handle_CREATE(socket: Socket.Unbound, args: { name: string }) {
        if (!Context.isValidName(args.name)) {
            return socket.sendError({
                name: 'INVALID_NAME',
                args: {},
            });
        }

        let context = new Context();
        context.on('complete', () => this.contexts.delete(context.game.name));
        this.contexts.set(context.game.name, context);

        context.join(socket, args.name);
    }

    private handle_JOIN(socket: Socket.Unbound, args: { game: string, name: string }) {
        if (!Context.isValidName(args.name)) {
            return socket.sendError({
                name: 'INVALID_NAME',
                args: {},
            });
        }

        let context = this.contexts.get(args.game);
        if (!context) {
            return socket.sendError({
                name: 'GAME_NOT_FOUND',
                args: {},
            });
        }

        if (!context.canJoin(args.name)) {
            return socket.sendError({
                name: 'JOIN_FAILED',
                args: {},
            });
        }

        context.join(socket, args.name);
    }

    private handle_REJOIN(socket: Socket.Unbound, args: { game: string, id: number }) {
        let context = this.contexts.get(args.game);
        if (!context) {
            return socket.sendError({
                name: 'GAME_NOT_FOUND',
                args: {},
            });
        }

        if (!context.canRejoin(args.id)) {
            return socket.sendError({
                name: 'JOIN_FAILED',
                args: {},
            });
        }

        context.rejoin(socket, args.id);
    }

    private handle_WATCH(socket: Socket.Unbound, args: { game: string }) {
        let context = this.contexts.get(args.game);
        if (!context) {
            return socket.sendError({
                name: 'GAME_NOT_FOUND',
                args: {},
            });
        }

        context.watch(socket);
    }


    private handle(socket: Socket.Unbound, msg: { name: string, version: string, args: any }) {
        if (msg.version != packageJson.version) {
            return socket.sendError({
                name: 'VERSION',
                args: { correct: packageJson.version },
            });
        }

        if (msg.name == 'CREATE')
            return this.handle_CREATE(socket, msg.args);

        if (msg.name == 'JOIN')
            return this.handle_JOIN(socket, msg.args);

        if (msg.name == 'REJOIN')
            return this.handle_REJOIN(socket, msg.args);

        if (msg.name == 'WATCH')
            return this.handle_WATCH(socket, msg.args);

        socket.sendError({
            name: 'UPGRADE_NOT_FOUND',
            args: {},
        });
    }
}
