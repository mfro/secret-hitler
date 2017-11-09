import { json, StateMachine, StateMachine2 } from '../util';

import { CardPool } from './cardPool';

import { Role, Player, Faction, Assignment } from '.';

import { TypeState } from 'typestate';

import { GameEvent } from './gameEvent';

export enum GameState {
    LOBBY = 'LOBBY',
    NOMINATING = 'NOMINATING',
    VOTING = 'VOTING',
    // _VOTES_COUNTED = '_VOTES_COUNTED',
    LEGISLATING = 'LEGISLATING',
    // _POLICY_ENACTED = '_POLICY_ENACTED',
    EXECUTIVE_ACTION = 'EXECUTIVE_ACTION',

    COMPLETED = 'COMPLETED',
}

enum Transitions {
    START_GAME = 'START_GAME',
    START_VOTING = 'START_VOTING',
    COMPLETE_VOTING = 'COMPLETE_VOTING',
    VETO_POLICY = 'VETO_POLICY',
    ENACT_LIBERAL = 'ENACT_LIBERAL',
    ENACT_FASCIST = 'ENACT_FASCIST',
    COMPLETE_ACTION = 'COMPLETE_ACTION',
}

function assert(value: boolean, message: string): value is true {
    if (!value) {
        throw new Error(message);
    }

    return value;
}

function assertPresent<T>(value: T | null | undefined, message: string) {
    if (!value) {
        throw new Error(message);
    }

    return value;
}

const mac = StateMachine2<GameState, Game>();

function END_TURN(game: Game) {
    game.emit(new GameEvent.TurnCompleted({
        turn: game.currentTurn,
    }));

    game.currentTurn++;

    return START_NOMINATING(game);
}

function FINISH_LEGISLATURE(game: Game) {
    game.cardPool.check();
    game.updateCardPool();

    let session = assertPresent(game.legislativeSession, 'no session in FINISH_LEGISLATURE');

    session.president.termLimited = game.alivePlayers.length > 5;
    session.chancellor.termLimited = true;

    game.legislativeSession = null;

    return END_TURN(game);
}

function FINISH_EXECUTIVE_ACTION(game: Game) {
    let action = assertPresent(game.executiveAction, 'no action in FINISH_EXECUTIVE_ACTION');

    switch (action.type) {
        case ExecutiveActionType.PREVIEW_DECK: {
            game.emit(new GameEvent.PreviewDeck({
                president: action.president,
            }));
            break;
        }

        case ExecutiveActionType.INSPECT: {
            game.emit(new GameEvent.Investigation({
                president: action.president,
                target: assertPresent(action.target, 'no target in inspection'),
            }));
            break;
        }

        case ExecutiveActionType.SPECIAL_ELECTION: {
            game.emit(new GameEvent.SpecialElection({
                president: action.president,
                target: assertPresent(action.target, 'no target in special election'),
            }));
            break;
        }

        case ExecutiveActionType.BULLET: {
            game.emit(new GameEvent.Assassination({
                president: action.president,
                target: assertPresent(action.target, 'no target in assassination'),
            }));
            break;
        }
    }

    game.executiveAction = null;

    let hitler = game.allPlayers.find(p => p.assignment!.isHitler)!;
    if (!hitler.isAlive) {
        game.victory = 'LIBERAL_HITLER';
        return GameState.COMPLETED;
    }

    return FINISH_LEGISLATURE(game);
}

function START_EXECUTIVE_ACTION(game: Game, president: Player) {
    let type;
    let count = game.allPlayers.length;

    if (count <= 6) {
        type = [
            ExecutiveActionType.NONE,
            ExecutiveActionType.NONE,
            ExecutiveActionType.PREVIEW_DECK,
            ExecutiveActionType.BULLET,
            ExecutiveActionType.BULLET,
        ][game.boardState.fascists - 1];
    } else if (count <= 8) {
        type = [
            ExecutiveActionType.NONE,
            ExecutiveActionType.INSPECT,
            ExecutiveActionType.SPECIAL_ELECTION,
            ExecutiveActionType.BULLET,
            ExecutiveActionType.BULLET,
        ][game.boardState.fascists - 1];
    } else if (count <= 10) {
        type = [
            ExecutiveActionType.INSPECT,
            ExecutiveActionType.INSPECT,
            ExecutiveActionType.SPECIAL_ELECTION,
            ExecutiveActionType.BULLET,
            ExecutiveActionType.BULLET,
        ][game.boardState.fascists - 1];
    } else {
        throw new Error(`There are ${count} players??`);
    }

    game.executiveAction = {
        president: president,
        type: type,
        target: null,
        complete: false,
        learned: null,
    };

    return GameState.EXECUTIVE_ACTION;
}

function ENACT_POLICY(game: Game, policy: Faction) {
    let session = assertPresent(game.legislativeSession, 'no session in ENACT_POLICY');

    let discard = session.presidentCards;
    let index = discard.indexOf(policy);
    discard.splice(index, 1);
    game.cardPool.discard(...discard);

    game.enact(policy, {
        president: session.president,
        chancellor: session.chancellor,
    });

    if (game.victory)
        return GameState.COMPLETED;

    if (policy == Faction.FASCIST)
        return START_EXECUTIVE_ACTION(game, session.president);

    return FINISH_LEGISLATURE(game);
}

function VETO_POLICY(game: Game) {
    let session = assertPresent(game.legislativeSession, 'no session in VETO_POLICY');

    game.cardPool.discard(...session.presidentCards);

    game.emit(new GameEvent.Veto({
        agree: true,
        president: session.president,
        chancellor: session.chancellor,
    }));

    return FINISH_LEGISLATURE(game);
}

function START_LEGISLATURE(game: Game, args: { president: Player, chancellor: Player }) {
    game.legislativeSession = {
        president: args.president,
        chancellor: args.chancellor,
        presidentCards: <any>game.cardPool.draw(),
        chancellorCards: null,
        enactedPolicy: null,

        vetoAccepted: null,
        vetoRequested: false,
    };

    return GameState.LEGISLATING;
}

function ANARCHY(game: Game) {
    let policy = assertPresent(game.cardPool.single(), 'empty deck in ANARCHY');

    game.enact(policy, undefined);
    game.updateCardPool();

    game.cardPool.check();

    if (game.victory)
        return GameState.COMPLETED;

    return END_TURN(game);
}

function ELECTED_HITLER(game: Game) {
    game.victory = 'FASCIST_HITLER';
    return GameState.COMPLETED;
}

function FINISH_VOTING(game: Game) {
    let ja = game.alivePlayers.filter(p => p.vote == true);
    let nein = game.alivePlayers.filter(p => p.vote == false);

    let nomination = assertPresent(game.nomination, 'no nomination in FINISH_VOTING');

    let pres = nomination.president;
    let chan = assertPresent(nomination.chancellor, 'no chancellor in FINISH_VOTING');

    game.nomination = null;

    let passed = ja.length > nein.length;

    game.emit(new GameEvent.Vote({
        pass: passed,
        president: pres,
        chancellor: chan,
        votes: { ja, nein },
    }));

    if (passed) {
        game.boardState.voteFailures = 0;

        if (game.boardState.fascists >= 3 && chan.assignment!.isHitler)
            return ELECTED_HITLER(game);

        return START_LEGISLATURE(game, {
            president: pres,
            chancellor: chan,
        });
    } else {
        game.boardState.voteFailures++;

        if (game.boardState.voteFailures == 3)
            return ANARCHY(game);

        return START_NOMINATING(game);
    }
};

function START_VOTING(game: Game) {
    for (let player of game.allPlayers) {
        player.vote = null;
    }

    return GameState.VOTING;
};

function FINISH_NOMINATING(game: Game) {
    let nomination = assertPresent(game.nomination, 'no nomination in FINISH_NOMINATING');
    let chan = assertPresent(nomination.chancellor, 'no chancellor in FINISH_NOMINATING');

    game.emit(new GameEvent.Nomination({
        president: nomination.president,
        chancellor: chan,
    }));

    return START_VOTING(game);
};

function START_NOMINATING(game: Game) {
    for (let player of game.allPlayers) {
        player.vote = null;
    }
    
    if (game.nomination == null) {
        while (!game.allPlayers[game.nextPresident].isAlive) {
            game.nextPresident = (game.nextPresident + 1) % game.allPlayers.length;
        }

        game.nomination = {
            president: game.allPlayers[game.nextPresident],
            chancellor: null,
        };

        do {
            game.nextPresident = (game.nextPresident + 1) % game.allPlayers.length;
        } while (!game.allPlayers[game.nextPresident].isAlive);
    }

    return GameState.NOMINATING;
};

function BEGIN_GAME(game: Game) {
    game.cardPool = new CardPool();

    game.boardState = {
        liberals: 0,
        fascists: 0,
        voteFailures: 0,
        drawSize: game.cardPool.drawSize,
        discardSize: game.cardPool.discardSize,
    };

    game.currentTurn = 1;
    game.nextPresident = 0;

    game.assignRoles();

    game.emit(new GameEvent.RoleAssignment({}));

    return START_NOMINATING(game);
};

mac.update(GameState.LOBBY, function (game) {
    let notReady = game.allPlayers.filter(p => !p.isReady);
    if (game.allPlayers.length >= 5 &&
        game.allPlayers.length <= 10 &&
        notReady.length == 0)
        return BEGIN_GAME(game);
});

mac.update(GameState.NOMINATING, function (game) {
    let nomination = assertPresent(game.nomination, 'no nomination in NOMINATING');

    if (nomination.chancellor)
        return FINISH_NOMINATING(game);
});

mac.update(GameState.VOTING, function (game) {
    let notVoted = game.alivePlayers.filter(p => p.vote == null);
    if (notVoted.length == 0)
        return FINISH_VOTING(game);
});

mac.update(GameState.LEGISLATING, function (game) {
    let session = assertPresent(game.legislativeSession, 'no session in LEGISLATING');

    if (session.vetoAccepted === true)
        return VETO_POLICY(game);

    if (session.vetoAccepted === false) {
        game.emit(new GameEvent.Veto({
            agree: false,
            president: session.president,
            chancellor: session.chancellor,
        }));
    }

    if (session.enactedPolicy != null)
        return ENACT_POLICY(game, session.enactedPolicy);
});

mac.update(GameState.EXECUTIVE_ACTION, function (game) {
    let action = assertPresent(game.executiveAction, 'no action in EXECUTIVE_ACTION');

    switch (action.type) {
        case ExecutiveActionType.NONE:
            action.complete = true;
            break;

        case ExecutiveActionType.PREVIEW_DECK:
            action.learned = game.cardPool.preview();
            break;

        case ExecutiveActionType.INSPECT:
            if (action.target != null) {
                action.learned = {
                    membership: action.target.assignment!.membership,
                };
            }
            break;

        case ExecutiveActionType.SPECIAL_ELECTION:
            if (action.target != null) {
                game.nomination = {
                    president: action.target,
                    chancellor: null,
                };

                action.complete = true;
            }
            break;

        case ExecutiveActionType.BULLET:
            if (action.target != null) {
                action.target.isAlive = false;

                action.complete = true;
            }
            break;
    }

    if (action.complete)
        return FINISH_EXECUTIVE_ACTION(game);
});

mac.update(GameState.COMPLETED, function (game) {

});

/*
    const mac = StateMachine3<GameState, Game>().create({
        START_GAME: {
            from: GameState.LOBBY,
            to: GameState.NOMINATING,
            action(game) {

            }
        },

        START_VOTING: {
            from: GameState.NOMINATING,
            to: GameState.VOTING,
            action(game) {
                for (let player of game.allPlayers) {
                    player.vote = null;
                }
            }
        },

        COUNT_VOTES: {
            from: GameState.VOTING,
            to: GameState._VOTES_COUNTED,
            action(game) {

            }
        },

        ELECTED_HITLER: {
            from: GameState._VOTES_COUNTED,
            to: GameState.COMPLETED,
            action(game) {

            }
        },

        START_LEGISLATING: {
            from: GameState._VOTES_COUNTED,
            to: GameState.LEGISLATING,
            action(game) {

            }
        },

        VETO_POLICY: {
            from: GameState.LEGISLATING,
            to: GameState.NOMINATING,
            action(game) {

            }
        },

        ENACT_POLICY: {
            from: GameState.LEGISLATING,
            to: GameState._POLICY_ENACTED,
            action(game) {

            }
        },

        ENACTED_LIBERAL_VICTORY: {
            from: GameState._POLICY_ENACTED,
            to: GameState.COMPLETED,
            action(game) {

            }
        },

        ENACTED_FASCIST_VICTORY: {
            from: GameState._POLICY_ENACTED,
            to: GameState.COMPLETED,
            action(game) {

            }
        },

        ENACTED_LIBERAL: {
            from: GameState._POLICY_ENACTED,
            to: GameState.NOMINATING,
            action(game) {

            }
        },

        ENACTED_FASCIST: {
            from: GameState._POLICY_ENACTED,
            to: GameState.EXECUTIVE_ACTION,
            action(game) {

            }
        },

        ACTION_COMPLETED: {
            from: GameState.EXECUTIVE_ACTION,
            to: GameState.NOMINATING,
            action(game) {

            }
        },
    });

    mac.update(GameState.LOBBY, function (game) {
        let notReady = game.allPlayers.filter(p => !p.isReady);
        if (game.allPlayers.length >= 5 &&
            game.allPlayers.length <= 10 &&
            notReady.length == 0)
            return mac.transitions.START_GAME;
    });

    mac.enter(GameState.NOMINATING, function (game) {
        if (game.nomination == null) {
            while (!game.allPlayers[game.nextPresident].isAlive) {
                game.nextPresident = (game.nextPresident + 1) % game.allPlayers.length;
            }

            game.nomination = {
                president: game.allPlayers[game.nextPresident],
                chancellor: null,
            };

            do {
                game.nextPresident = (game.nextPresident + 1) % game.allPlayers.length;
            } while (!game.allPlayers[game.nextPresident].isAlive);
        }
    });

    mac.update(GameState.NOMINATING, function (game) {
        if (game.nomination!.chancellor)
            return mac.transitions.START_VOTING;
    });

    mac.exit(GameState.NOMINATING, function(game) {
        
                game.emit(new GameEvent.Nomination({
                    president: game.nomination!.president,
                    chancellor: game.nomination!.chancellor!,
                }));

    })

    mac.update(GameState._STARTING_TURN, function (game) {
        return mac.transitions.START_TURN;
    });

    const mac2 = StateMachine2<GameState, Game>();

    /*mac2.define(GameState.LOBBY, {
        update() {
            let notReady = this.allPlayers.filter(p => !p.isReady);
            if (this.allPlayers.length >= 5 &&
                this.allPlayers.length <= 10 &&
                notReady.length == 0)
                return GameState.NOMINATING;
        },

        exit() {
            this.cardPool = new CardPool();

            this.boardState = {
                liberals: 0,
                fascists: 0,
                voteFailures: 0,
            };

            this.nextPresident = 0;

            this.assignRoles();

            this.emit(new GameEvent.RoleAssignment({}));
        }
    })

    /* mac2.define(GameState.NOMINATING, {
        enter() {
            if (this.nomination == null) {
                while (!this.allPlayers[this.nextPresident].isAlive) {
                    this.nextPresident = (this.nextPresident + 1) % this.allPlayers.length;
                }

                this.nomination = {
                    president: this.allPlayers[this.nextPresident],
                    chancellor: null,
                };

                do {
                    this.nextPresident = (this.nextPresident + 1) % this.allPlayers.length;
                } while (!this.allPlayers[this.nextPresident].isAlive);
            }
        },

        update() {
            if (this.nomination!.chancellor)
                return GameState.VOTING;
        },

        exit() {
            this.emit(new GameEvent.Nomination({
                president: this.nomination!.president,
                chancellor: this.nomination!.chancellor!,
            }));
        }
    });

    mac2.define(GameState.VOTING, {
        enter() {
            for (let player of this.allPlayers) {
                player.vote = null;
            }
        },

        update() {
            let notVoted = this.alivePlayers.filter(p => p.vote == null);
            if (notVoted.length == 0) {
                let ja = this.alivePlayers.filter(p => p.vote == true);
                let nein = this.alivePlayers.filter(p => p.vote == false);

                let pres = this.nomination!.president;
                let chan = this.nomination!.chancellor!;

                let passed = ja.length > nein.length;

                this.emit(new GameEvent.Vote({
                    pass: passed,
                    president: pres,
                    chancellor: chan,
                    votes: { ja, nein },
                }));

                if (passed) {
                    this.boardState.voteFailures = 0;

                    if (this.boardState.fascists >= 3 && chan.assignment!.isHitler) {
                        this.victory = 'FASCIST_HITLER';
                        return GameState.COMPLETED;
                    }

                    this.legislativeSession = {
                        president: pres,
                        chancellor: chan,
                        presidentCards: <any>this.cardPool.draw(),
                        chancellorCards: null,
                        enactedPolicy: null,

                        vetoAccepted: null,
                        vetoRequested: false,
                    };

                    return GameState.LEGISLATING;
                } else {
                    this.boardState.voteFailures++;

                    if (this.boardState.voteFailures == 3) {
                        let policy = this.cardPool.single()!;
                        this.enact('ANARCHY', policy);

                        this.cardPool.check();

                        if (this.victory)
                            return GameState.COMPLETED;
                    }

                    return GameState.NOMINATING;
                }
            }
        },

        exit() {
            this.nomination = null;
        }
    });

    mac2.define(GameState.LEGISLATING, {
        update() {
            let session = this.legislativeSession!;

            if (session.vetoAccepted) {
                this.cardPool.discard(...session.presidentCards);

                this.emit(new GameEvent.Veto({
                    president: session.president,
                    chancellor: session.chancellor,
                }));

                return GameState.NOMINATING;
            }

            if (session.enactedPolicy != null) {
                let discard = session.presidentCards;
                let index = discard.indexOf(session.enactedPolicy);
                discard.splice(index, 1);
                this.cardPool.discard(...discard);

                this.enact('LEGISLATURE', session.enactedPolicy);

                if (this.victory)
                    return GameState.COMPLETED;

                if (session.enactedPolicy == Faction.LIBERAL)
                    return GameState.NOMINATING;

                let type;
                let count = this.allPlayers.length;

                if (count <= 6) {
                    type = [
                        ExecutiveActionType.NONE,
                        ExecutiveActionType.NONE,
                        ExecutiveActionType.PREVIEW_DECK,
                        ExecutiveActionType.BULLET,
                        ExecutiveActionType.BULLET,
                    ][this.boardState.fascists - 1];
                } else if (count <= 8) {
                    type = [
                        ExecutiveActionType.NONE,
                        ExecutiveActionType.INSPECT,
                        ExecutiveActionType.SPECIAL_ELECTION,
                        ExecutiveActionType.BULLET,
                        ExecutiveActionType.BULLET,
                    ][this.boardState.fascists - 1];
                } else if (count <= 10) {
                    type = [
                        ExecutiveActionType.INSPECT,
                        ExecutiveActionType.INSPECT,
                        ExecutiveActionType.SPECIAL_ELECTION,
                        ExecutiveActionType.BULLET,
                        ExecutiveActionType.BULLET,
                    ][this.boardState.fascists - 1];
                } else {
                    throw new Error(`There are ${count} players??`);
                }

                this.executiveAction = {
                    president: session.president,
                    type: type,
                    target: null,
                    complete: false,
                    learned: null,
                };

                return GameState.EXECUTIVE_ACTION;
            }
        },

        exit() {
            this.cardPool.check();

            let session = this.legislativeSession!;

            session.president.termLimited = this.alivePlayers.length > 5;
            session.chancellor.termLimited = true;

            this.legislativeSession = null;
        }
    })

    mac2.define(GameState.EXECUTIVE_ACTION, {
    update() {
        let action = this.executiveAction!;

        switch (action.type) {
            case ExecutiveActionType.NONE:
                return GameState.NOMINATING;

            case ExecutiveActionType.PREVIEW_DECK:
                action.learned = this.cardPool.preview();
                break;

            case ExecutiveActionType.INSPECT:
                if (action.target != null) {
                    action.learned = {
                        membership: action.target.assignment!.membership,
                    };

                    this.emit(new GameEvent.Investigation({
                        president: action.president,
                        target: action.target,
                    }));
                }
                break;

            case ExecutiveActionType.SPECIAL_ELECTION:
                if (action.target != null) {
                    this.nomination = {
                        president: action.target,
                        chancellor: null,
                    };

                    this.emit(new GameEvent.SpecialElection({
                        president: action.president,
                        target: action.target,
                    }));

                    action.complete = true;
                }
                break;

            case ExecutiveActionType.BULLET:
                if (action.target != null) {
                    action.target.isAlive = false;

                    this.emit(new GameEvent.Assassination({
                        president: action.president,
                        target: action.target,
                    }));

                    if (action.target.assignment!.isHitler) {
                        this.victory = 'LIBERAL_HITLER';
                        return GameState.COMPLETED;
                    }

                    action.complete = true;
                }
                break;
        }

        if (action.complete)
            return GameState.NOMINATING;
    },

    exit() {
        this.executiveAction = null;
    }
    })
*/

/*
    const mac = StateMachine<GameState, Game, Transitions>({
    START_GAME: {
        from: GameState.LOBBY,
        to: [GameState.NOMINATING],
    },

    START_VOTING: {
        from: GameState.NOMINATING,
        to: [GameState.VOTING],
    },

    COMPLETE_VOTING: {
        from: GameState.VOTING,
        to: [GameState.LEGISLATING, GameState.NOMINATING, GameState.COMPLETED],
    },

    VETO_POLICY: {
        from: GameState.LEGISLATING,
        to: [GameState.NOMINATING],
    },

    ENACT_LIBERAL: {
        from: GameState.LEGISLATING,
        to: [GameState.NOMINATING, GameState.COMPLETED],
    },

    ENACT_FASCIST: {
        from: GameState.LEGISLATING,
        to: [GameState.EXECUTIVE_ACTION, GameState.COMPLETED],
    },

    COMPLETE_ACTION: {
        from: GameState.EXECUTIVE_ACTION,
        to: [GameState.NOMINATING, GameState.COMPLETED],
    }
    });

    mac.update(GameState.LOBBY, function () {
        let notReady = this.allPlayers.filter(p => !p.isReady);
        if (this.allPlayers.length >= 5 &&
            this.allPlayers.length <= 10 &&
            notReady.length == 0)
            return Transitions.START_GAME;
    });

    mac.update(GameState.NOMINATING, function () {
        if (this.nomination!.chancellor)
            return Transitions.START_VOTING;
    });

    mac.update(GameState.VOTING, function () {
        let notVoted = this.alivePlayers.filter(p => p.vote == null);
        if (notVoted.length == 0)
            return Transitions.COMPLETE_VOTING;
    });

    mac.update(GameState.LEGISLATING, function () {
        let session = this.legislativeSession!;
        if (session.vetoAccepted)
            return Transitions.VETO_POLICY;

        if (session.enactedPolicy == Faction.FASCIST)
            return Transitions.ENACT_FASCIST;

        if (session.enactedPolicy == Faction.LIBERAL)
            return Transitions.ENACT_LIBERAL;
    });

    mac.update(GameState.EXECUTIVE_ACTION, function () {
        let action = this.executiveAction!;

        switch (action.type) {
            case ExecutiveActionType.NONE:
                return Transitions.COMPLETE_ACTION;

            case ExecutiveActionType.PREVIEW_DECK:
                action.learned = this.cardPool.preview();
                break;

            case ExecutiveActionType.INSPECT:
                if (action.target != null) {
                    action.learned = {
                        membership: action.target.assignment!.membership,
                    };

                    this.emit(new GameEvent.Investigation({
                        president: action.president,
                        target: action.target,
                    }));
                }
                break;

            case ExecutiveActionType.SPECIAL_ELECTION:
                if (action.target != null) {
                    this.nomination = {
                        president: action.target,
                        chancellor: null,
                    };

                    this.emit(new GameEvent.SpecialElection({
                        president: action.president,
                        target: action.target,
                    }));

                    return Transitions.COMPLETE_ACTION;
                }
                break;

            case ExecutiveActionType.BULLET:
                if (action.target != null) {
                    action.target.isAlive = false;

                    this.emit(new GameEvent.Assassination({
                        president: action.president,
                        target: action.target,
                    }));

                    return Transitions.COMPLETE_ACTION;
                }
                break;
        }

        if (action.complete)
            return Transitions.COMPLETE_ACTION;
    });

    mac.update(GameState.COMPLETED, function () { })

    mac.from(GameState.LOBBY, function () {
        this.cardPool = new CardPool();

        this.boardState = {
            liberals: 0,
            fascists: 0,
            voteFailures: 0,
        };

        this.nextPresident = 0;

        this.assignRoles();

        this.emit(new GameEvent.RoleAssignment({}));
    });

    mac.to(GameState.NOMINATING, function () {
        if (this.nomination == null) {
            while (!this.allPlayers[this.nextPresident].isAlive) {
                this.nextPresident = (this.nextPresident + 1) % this.allPlayers.length;
            }

            this.nomination = {
                president: this.allPlayers[this.nextPresident],
                chancellor: null,
            };

            do {
                this.nextPresident = (this.nextPresident + 1) % this.allPlayers.length;
            } while (!this.allPlayers[this.nextPresident].isAlive);
        }
    });

    mac.from(GameState.NOMINATING, function () {
        this.emit(new GameEvent.Nomination({
            president: this.nomination!.president,
            chancellor: this.nomination!.chancellor!,
        }))
    });

    mac.to(GameState.VOTING, function () {
        for (let player of this.allPlayers) {
            player.vote = null;
        }
    });

    mac.from(GameState.VOTING, function () {
        this.nomination = null;
    });

    mac.on(Transitions.COMPLETE_VOTING, function () {
        let ja = this.alivePlayers.filter(p => p.vote == true);
        let nein = this.alivePlayers.filter(p => p.vote == false);

        let pres = this.nomination!.president;
        let chan = this.nomination!.chancellor!;
        let passed = ja.length > nein.length;

        this.emit(new GameEvent.Vote({
            pass: passed,
            president: pres,
            chancellor: chan,
            votes: { ja, nein },
        }));

        if (passed) {
            this.boardState.voteFailures = 0;

            if (this.boardState.fascists >= 3 && chan.assignment!.isHitler) {
                this.victory = 'FASCIST_HITLER';
                return GameState.COMPLETED;
            }

            this.legislativeSession = {
                president: pres,
                chancellor: chan,
                presidentCards: <any>this.cardPool.draw(),
                chancellorCards: null,
                enactedPolicy: null,

                vetoAccepted: null,
                vetoRequested: false,
            };

            return GameState.LEGISLATING;
        } else {
            this.boardState.voteFailures++;

            if (this.boardState.voteFailures == 3) {
                let policy = this.cardPool.single()!;
                this.enact('ANARCHY', policy);

                this.cardPool.check();

                if (this.victory)
                    return GameState.COMPLETED;
            }

            return GameState.NOMINATING;
        }
    });

    mac.on(Transitions.VETO_POLICY, function () {
        let session = this.legislativeSession!;

        this.cardPool.discard(...session.presidentCards);

        this.emit(new GameEvent.Veto({
            president: session.president,
            chancellor: session.chancellor,
        }));

        return GameState.NOMINATING;
    });

    mac.on(Transitions.ENACT_LIBERAL, function () {
        let session = this.legislativeSession!;

        let discard = session.presidentCards;
        let index = discard.indexOf(Faction.LIBERAL);
        discard.splice(index, 1);
        this.cardPool.discard(...discard);

        this.enact('LEGISLATURE', Faction.LIBERAL);

        if (this.victory)
            return GameState.COMPLETED;

        return GameState.NOMINATING;
    });

    mac.on(Transitions.ENACT_FASCIST, function () {
        let session = this.legislativeSession!;

        let discard = session.presidentCards;
        let index = discard.indexOf(Faction.FASCIST);
        discard.splice(index, 1);
        this.cardPool.discard(...discard);

        this.enact('LEGISLATURE', Faction.FASCIST);

        let type;
        let count = this.allPlayers.length;

        if (count <= 6) {
            type = [
                ExecutiveActionType.NONE,
                ExecutiveActionType.NONE,
                ExecutiveActionType.PREVIEW_DECK,
                ExecutiveActionType.BULLET,
                ExecutiveActionType.BULLET,
            ][this.boardState.fascists - 1];
        } else if (count <= 8) {
            type = [
                ExecutiveActionType.NONE,
                ExecutiveActionType.INSPECT,
                ExecutiveActionType.SPECIAL_ELECTION,
                ExecutiveActionType.BULLET,
                ExecutiveActionType.BULLET,
            ][this.boardState.fascists - 1];
        } else if (count <= 10) {
            type = [
                ExecutiveActionType.INSPECT,
                ExecutiveActionType.INSPECT,
                ExecutiveActionType.SPECIAL_ELECTION,
                ExecutiveActionType.BULLET,
                ExecutiveActionType.BULLET,
            ][this.boardState.fascists - 1];
        } else {
            throw new Error(`There are ${count} players??`);
        }

        this.executiveAction = {
            president: session.president,
            type: type,
            target: null,
            complete: false,
            learned: null,
        };

        if (this.victory)
            return GameState.COMPLETED;

        return GameState.EXECUTIVE_ACTION;
    });

    mac.on(Transitions.COMPLETE_ACTION, function () {
        let hitler = this.allPlayers.find(p => p.assignment!.isHitler)!;
        if (!hitler.isAlive) {
            this.victory = 'LIBERAL_HITLER';
            return GameState.COMPLETED;
        }

        return GameState.NOMINATING;
    });

    mac.from(GameState.LEGISLATING, function () {
        this.cardPool.check();

        let session = this.legislativeSession!;

        session.president.termLimited = this.alivePlayers.length > 5;
        session.chancellor.termLimited = true;

        this.legislativeSession = null;
    });

    mac.from(GameState.EXECUTIVE_ACTION, function () {
        this.executiveAction = null;
    });
*/

export interface BoardState {
    liberals: number;
    fascists: number;
    drawSize: number;
    discardSize: number;

    voteFailures: number;
}

export interface Nomination {
    president: Player;
    chancellor: Player | null;
}

export interface LegislativeSession {
    president: Player;
    chancellor: Player;

    vetoAccepted: boolean | null;
    vetoRequested: boolean;

    presidentCards: Faction[];
    chancellorCards: Faction[] | null;
    enactedPolicy: Faction | null;
}

export enum ExecutiveActionType {
    NONE = 'NONE',
    PREVIEW_DECK = 'PREVIEW_DECK',
    INSPECT = 'INSPECT',
    SPECIAL_ELECTION = 'SPECIAL_ELECTION',
    BULLET = 'BULLET',
}

export interface ExecutiveAction {
    president: Player;
    type: ExecutiveActionType;
    complete: boolean;
    target: Player | null;

    learned: any;
}

export class Game {
    readonly allPlayers = new Array<Player>();
    get alivePlayers() { return this.allPlayers.filter(p => p.isAlive); }

    name: string;

    cardPool: CardPool;
    nextPresident: number;
    currentTurn: number;

    state = GameState.LOBBY;

    boardState: BoardState;

    nomination: Nomination | null;

    legislativeSession: LegislativeSession | null;

    executiveAction: ExecutiveAction | null;

    alerts = new Array<GameEvent.Any>();
    log = new Array<GameEvent.Any>();

    victory: string | null = null;

    constructor() {
        let id = Math.floor(Math.random() * 100);
        this.name = id.toString();
    }

    emit(event: GameEvent.Any) {
        if (event.alert)
            this.alerts.push(event);

        if (event.log)
            this.log.push(event);
    }

    update() {
        this.state = mac.do_update(this, this.state);

        return this.alerts.splice(0, this.alerts.length);
    }

    enact(policy: Faction, government: { president: Player, chancellor: Player } | undefined) {
        this.boardState.voteFailures = 0;

        for (let player of this.allPlayers)
            player.termLimited = false;

        if (policy == Faction.LIBERAL)
            this.boardState.liberals++;
        else if (policy == Faction.FASCIST)
            this.boardState.fascists++;
        else
            throw new Error(`Invalid faction: ${policy}`);

        if (this.boardState.fascists == 6)
            this.victory = 'FASCIST_POLICY';

        if (this.boardState.liberals == 5)
            this.victory = 'LIBERAL_POLICY';

        this.emit(new GameEvent.Policy({
            policy: policy,
            government: government,
        }));
    }

    updateCardPool() {
        this.boardState.drawSize = this.cardPool.drawSize;
        this.boardState.discardSize = this.cardPool.discardSize;
    }

    addPlayer(name: string) {
        if (this.state != GameState.LOBBY)
            throw new Error(`Added player ${name} in game state ${this.state}`);

        let player = new Player(this, name);
        this.allPlayers.push(player);
        return player;
    }

    removePlayer(player: Player) {
        if (this.state != GameState.LOBBY)
            throw new Error(`Removed player ${player} in game state ${this.state}`);

        let index = this.allPlayers.indexOf(player);
        if (index < 0) throw new Error(`Player not found: ${player}`);

        this.allPlayers.splice(index, 1);
    }

    assignRoles() {
        let fCount = Math.floor((this.allPlayers.length - 3) / 2);
        let lCount = this.allPlayers.length - 1 - fCount;
        let hitlerKnows = (this.allPlayers.length < 7);

        console.log('Assigning roles');

        console.log(`  ${this.allPlayers.length} players`);
        console.log(`  ${fCount} fascists (+ hitler)`);
        console.log(`  ${lCount} liberals`);
        console.log(`  1 hitler`);
        console.log(`  hitler ${hitlerKnows ? 'knows' : 'does not know'} who the other fascists are`);

        let roles = [Role.HITLER];
        for (let i = 0; i < fCount; i++) roles.push(Role.FASCIST);
        for (let i = 0; i < lCount; i++) roles.push(Role.LIBERAL);

        for (let player of this.allPlayers) {
            let i = Math.floor(Math.random() * roles.length);
            let role = roles.splice(i, 1)[0];

            player.assignment = new Assignment(role);
            console.log(`  player ${player} is ${role}`);
        }
    }

    serialize(perspective: Player | null) {
        let data: any = {
            log: this.log,
            name: this.name,
            players: this.allPlayers.map(p => json.serialize(p, perspective)),

            state: this.state,
        };

        if (this.state != GameState.LOBBY) {
            data.boardState = this.boardState;

            if (this.victory) {
                data.victory = this.victory;
            }

            if (this.nomination) {
                data.nomination = this.nomination;
            }

            if (this.executiveAction) {
                data.executiveAction = {
                    type: this.executiveAction.type,
                    target: this.executiveAction.target,
                    complete: this.executiveAction.complete,
                    president: this.executiveAction.president,
                };

                if (perspective == this.executiveAction.president) {
                    data.executiveAction.learned = this.executiveAction.learned;
                }
            }

            if (this.legislativeSession) {
                data.legislature = {
                    president: this.legislativeSession.president,
                    chancellor: this.legislativeSession.chancellor,
                    vetoAccepted: this.legislativeSession.vetoAccepted,
                    vetoRequested: this.legislativeSession.vetoRequested,
                };

                if (perspective == this.legislativeSession.president) {
                    data.legislature.presidentCards = this.legislativeSession.presidentCards;
                }

                if (perspective == this.legislativeSession.president ||
                    perspective == this.legislativeSession.chancellor) {
                    data.legislature.chancellorCards = this.legislativeSession.chancellorCards;
                }
            }

            data.nextPresident = this.allPlayers[this.nextPresident];
        }

        return data;
    }
}
