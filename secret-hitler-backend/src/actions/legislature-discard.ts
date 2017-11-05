import * as actions from '.';

import { GameState, Faction } from '../game';

interface Args {
    card: Faction;
}

actions.declare<Args>('LEGISLATURE_DISCARD', ctx => {
    if (ctx.game.state != GameState.LEGISLATING)
        return actions.error(ctx, `discarded legislature in game state ${ctx.game.state}`);

    let session = ctx.game.legislativeSession!;

    if (session.chancellorCards == null) {
        if (ctx.sender != session.president)
            return actions.error(ctx, `discarded legislature when ${session.president} is president`);

        let index = session.presidentCards.findIndex(p => p == ctx.params.card);
        if (index < 0)
            return actions.error(ctx, `discarded card ${ctx.params.card} which is not an option`);

        let copy = session.presidentCards.slice();
        copy.splice(index, 1);

        session.chancellorCards = copy;
    } else {
        if (ctx.sender != session.chancellor)
            return actions.error(ctx, `discarded legislature when ${session.chancellor} is chancellor`);

        let index = session.chancellorCards.findIndex(p => p == ctx.params.card);
        if (index < 0)
            return actions.error(ctx, `discarded card ${ctx.params.card} which is not an option`);

        let copy = session.chancellorCards.slice();
        copy.splice(index, 1);

        session.enactedPolicy = copy[0];
    }
});
