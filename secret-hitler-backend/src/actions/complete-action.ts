import * as actions from '.';

import { GameState } from '../game';

interface Args { }

actions.declare<Args>('COMPLETE_ACTION', ctx => {
    if (ctx.game.state != GameState.EXECUTIVE_ACTION)
        return actions.error(ctx, `requsted executed action in game state ${ctx.game.state}`);

    let action = ctx.game.executiveAction!;

    if (ctx.sender != action.president)
        return actions.error(ctx, `executed action when ${action.president} is president`);
    
    action.complete = true;
});
