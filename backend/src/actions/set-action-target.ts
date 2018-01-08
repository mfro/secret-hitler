import * as actions from '.';

import { GameState } from '../game';

interface Args {
    target: number;
}

actions.declare<Args>('SET_ACTION_TARGET', ctx => {
    if (ctx.game.state != GameState.EXECUTIVE_ACTION)
        return actions.error(ctx, `requsted executed action in game state ${ctx.game.state}`);

    let action = ctx.game.executiveAction!;

    if (ctx.sender != action.president)
        return actions.error(ctx, `executed action when ${action.president} is president`);

    let player = ctx.game.allPlayers.find(p => p.id == ctx.params.target);
    if (player == null)
        return actions.error(ctx, 'set action target to unknown player: ' + ctx.params.target);

    if (!player.isAlive)
        return actions.error(ctx, 'set action target to dead player: ' + ctx.params.target);

    action.target = player;
});
