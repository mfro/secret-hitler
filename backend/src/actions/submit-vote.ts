import * as actions from '.';

import { GameState } from '../game';

interface Args {
    vote: boolean;
}

actions.declare<Args>('SUBMIT_VOTE', ctx => {
    if (ctx.game.state != GameState.VOTING)
        return actions.error(ctx, `submitted vote in game state ${ctx.game.state}`);

    if (ctx.sender.vote !== null)
        return actions.error(ctx, `submitted duplicate vote`);

    if (typeof ctx.params.vote != 'boolean')
        return actions.error(ctx, `submitted invalid vote: ${ctx.params}`);

    ctx.sender.vote = ctx.params.vote;
});
