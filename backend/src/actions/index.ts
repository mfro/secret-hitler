import { Game, Player } from '../game';

interface ActionContext<T> {
    game: Game;
    params: T;
    sender: Player;
}

interface ActionDeclaration {
    name: string;
    invoke: (ctx: ActionContext<any>) => any;
}

const actions = new Map<string, ActionDeclaration>();

export function invoke<T>(name: string, ctx: ActionContext<T>) {
    let action = actions.get(name);
    if (action == null)
        return Promise.reject(new Error(`Action not found: ${name}`));

    try {
        let result = action.invoke(ctx);
        return Promise.resolve(result);
    } catch (e) {
        return Promise.reject(e);
    }
}

export function declare<T>(name: string, action: (ctx: ActionContext<T>) => any) {
    actions.set(name, {
        name: name,
        invoke: action,
    });
}

export function error(ctx: ActionContext<any>, msg: string) {
    return Promise.reject({
        message: `Player ${ctx.sender}: ${msg}`,
    });
}
