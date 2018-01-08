import * as actions from '.';

import { GameState, ExecutiveActionType } from '../game';

interface Args { }

actions.declare<Args>('COMPLETE_ACTION', ctx => {
    if (ctx.game.state != GameState.EXECUTIVE_ACTION)
        return actions.error(ctx, `finished action in game state ${ctx.game.state}`);

    let action = ctx.game.executiveAction!;

    if (ctx.sender != action.president)
        return actions.error(ctx, `finished action when ${action.president} is president`);

    switch (action.type) {
        case ExecutiveActionType.INSPECT:
        case ExecutiveActionType.SPECIAL_ELECTION:
        case ExecutiveActionType.BULLET:
            if (action.target == null)
                return actions.error(ctx, `finished action ${action.type} with no target`);
            break;
    }

    action.complete = true;
});
