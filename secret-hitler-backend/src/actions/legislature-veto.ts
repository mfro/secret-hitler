import * as actions from '.';

import { GameState } from '../game';

interface Args {
    response: boolean | null;
}

actions.declare<Args>('LEGISLATURE_VETO', ctx => {
    if (ctx.game.state != GameState.LEGISLATING)
        return actions.error(ctx, `requsted veto in game state ${ctx.game.state}`);

    let session = ctx.game.legislativeSession!;

    if (ctx.sender == session.president) {
        if (!session.vetoRequested)
            return actions.error(ctx, `accepted veto when none was requested`);
            
        if (typeof ctx.params.response != 'boolean')
        return actions.error(ctx, `invalid veto response ${ctx.params.response}`);

        session.vetoAccepted = ctx.params.response;
    } else if (ctx.sender == session.chancellor) {
        if (session.vetoRequested)
            return actions.error(ctx, `requested duplicate veto`);

        session.vetoRequested = true;
    } else
        return actions.error(ctx, `requested veto when not in legislature`);
});
