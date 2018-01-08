import * as actions from '.';

import { GameState } from '../game';

interface Args {
    playerId: number;
}

actions.declare<Args>('NOMINATE', ctx => {
    if (ctx.game.state != GameState.NOMINATING)
        return actions.error(ctx, `nominated chancellor in game state ${ctx.game.state}`);

    if (ctx.sender != ctx.game.nomination!.president)
        return actions.error(ctx, `nominated chancellor when ${ctx.game.nomination!.president} is president`);

    let player = ctx.game.allPlayers.find(p => p.id == ctx.params.playerId);
    if (player == null)
        return actions.error(ctx, 'nominated unknown player: ' + ctx.params.playerId);
    if (!player.isAlive)
        return actions.error(ctx, 'nominated dead player: ' + ctx.params.playerId);
    if (player.termLimited)
        return actions.error(ctx, 'nominated term-limited player: ' + ctx.params.playerId);

    ctx.game.nomination!.chancellor = player;
});
