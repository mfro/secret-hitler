import * as actions from '.';

import { GameState } from '../game';

interface Args {
    isReady: boolean;
}

actions.declare<Args>('SET_READY', ctx => {
    if (ctx.game.state != GameState.LOBBY)
        return actions.error(ctx, `set ready in game state ${ctx.game.state}`);

    if (typeof ctx.params.isReady != 'boolean')
        return actions.error(ctx, `submitted invalid ready: ${ctx.params}`);

    ctx.sender.isReady = ctx.params.isReady;
});
