import { json, StateMachine } from '../util';

import { CardPool } from './cardPool';

import { Role, Player, Faction, Assignment } from '.';

import { TypeState } from 'typestate';

export enum GameState {
    LOBBY = 'LOBBY',
    NOMINATING = 'NOMINATING',
    VOTING = 'VOTING',
    LEGISLATING = 'LEGISLATING',
    EXECUTIVE_ACTION = 'EXECUTIVE_ACTION',

    COMPLETED = 'COMPLETED',
}

enum Transitions {
    START_GAME = 'START_GAME',
    START_VOTING = 'START_VOTING',
    ACCEPT_VOTE = 'ACCEPT_VOTE',
    REJECT_VOTE = 'REJECT_VOTE',
    VETO_POLICY = 'VETO_POLICY',
    ENACT_LIBERAL = 'ENACT_LIBERAL',
    ENACT_FASCIST = 'ENACT_FASCIST',
    COMPLETE_ACTION = 'COMPLETE_ACTION',
    FASCIST_HITLER_VICTORY = 'HITLER_VICTORY',
    LIBERAL_HITLER_VICTORY = 'ASSASSIN_VICTORY',
    FASCIST_POLICY_VICTORY = 'FASCIST_POLICY_VICTORY',
    LIBERAL_POLICY_VICTORY = 'LIBERAL_POLICY_VICTORY',
}

const mac = StateMachine<GameState, Game, Transitions>({
    START_GAME: [GameState.LOBBY, GameState.NOMINATING],
    START_VOTING: [GameState.NOMINATING, GameState.VOTING],
    ACCEPT_VOTE: [GameState.VOTING, GameState.LEGISLATING],
    REJECT_VOTE: [GameState.VOTING, GameState.NOMINATING],

    VETO_POLICY: [GameState.LEGISLATING, GameState.NOMINATING],
    ENACT_LIBERAL: [GameState.LEGISLATING, GameState.NOMINATING],
    ENACT_FASCIST: [GameState.LEGISLATING, GameState.EXECUTIVE_ACTION],

    COMPLETE_ACTION: [GameState.EXECUTIVE_ACTION, GameState.NOMINATING],

    HITLER_VICTORY: [GameState.VOTING, GameState.COMPLETED],
    ASSASSIN_VICTORY: [GameState.EXECUTIVE_ACTION, GameState.COMPLETED],
    FASCIST_POLICY_VICTORY: [GameState.LEGISLATING, GameState.COMPLETED],
    LIBERAL_POLICY_VICTORY: [GameState.LEGISLATING, GameState.COMPLETED],
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
    if (notVoted.length == 0) {
        let ja = this.alivePlayers.filter(p => p.vote === true).length;
        let nein = this.alivePlayers.filter(p => p.vote === false).length;

        if (ja > nein) {
            let chan = this.nomination!.chancellor!;
            if (this.boardState.fascists >= 3 && chan.assignment!.isHitler)
                return Transitions.FASCIST_HITLER_VICTORY;

            return Transitions.ACCEPT_VOTE;
        }

        return Transitions.REJECT_VOTE;
    }
});

mac.update(GameState.LEGISLATING, function () {
    let session = this.legislativeSession!;
    if (session.vetoAccepted)
        return Transitions.VETO_POLICY;

    if (session.enactedPolicy == Faction.FASCIST) {
        if (this.boardState.fascists == 5) // + 1
            return Transitions.FASCIST_POLICY_VICTORY;

        return Transitions.ENACT_FASCIST;
    }

    if (session.enactedPolicy == Faction.LIBERAL) {
        if (this.boardState.fascists == 4) // + 1
            return Transitions.FASCIST_POLICY_VICTORY;

        return Transitions.ENACT_LIBERAL;
    }
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
            }
            break;

        case ExecutiveActionType.SPECIAL_ELECTION:
            if (action.target != null) {
                this.nomination = {
                    president: action.target,
                    chancellor: null,
                };
                return Transitions.COMPLETE_ACTION;
            }
            break;

        case ExecutiveActionType.BULLET:
            if (action.target != null) {
                action.target.isAlive = false;
                if (action.target.assignment!.isHitler)
                    return Transitions.LIBERAL_HITLER_VICTORY;

                return Transitions.COMPLETE_ACTION;
            }
            break;
    }

    if (action.complete)
        return Transitions.COMPLETE_ACTION;
});

mac.from(GameState.LOBBY, function () {
    this.cardPool = new CardPool();

    this.boardState = {
        liberals: 0,
        fascists: 0,
        voteFailures: 0,
    };

    this.nextPresident = 0;

    this.assignRoles();

    this.postResult('role-assignment', {});
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

mac.to(GameState.VOTING, function () {
    for (let player of this.allPlayers) {
        player.vote = null;
    }
});

mac.from(GameState.VOTING, function () {
    this.nomination = null;
});

mac.on(Transitions.ACCEPT_VOTE, function () {
    let pres = this.nomination!.president;
    let chan = this.nomination!.chancellor!;

    this.boardState.voteFailures = 0;

    this.legislativeSession = {
        president: pres,
        chancellor: chan,
        presidentCards: <any>this.cardPool.draw(),
        chancellorCards: null,
        enactedPolicy: null,

        vetoAccepted: null,
        vetoRequested: false,
    };

    this.postResult('vote', {
        pass: true,
        president: pres,
        chancellor: chan,
        votes: {
            ja: this.alivePlayers.filter(p => p.vote == true),
            nein: this.alivePlayers.filter(p => p.vote == false),
        }
    });
});

mac.on(Transitions.REJECT_VOTE, function () {
    this.boardState.voteFailures++;

    this.postResult('vote', {
        pass: false,
        votes: {
            ja: this.alivePlayers.filter(p => p.vote == true),
            nein: this.alivePlayers.filter(p => p.vote == false),
        }
    });

    if (this.boardState.voteFailures == 3) {
        let policy = this.cardPool.single()!;
        this.enact(policy);

        this.cardPool.check();

        this.postResult('anarchy', {
            policy: policy,
        });
    }
});

mac.on(Transitions.VETO_POLICY, function () {
    let session = this.legislativeSession!;

    this.cardPool.discard(...session.presidentCards);

    this.postResult('veto', {});
});

mac.on(Transitions.ENACT_LIBERAL, function () {
    let session = this.legislativeSession!;

    let discard = session.presidentCards;
    let index = discard.indexOf(Faction.LIBERAL);
    discard.splice(index, 1);
    this.cardPool.discard(...discard);

    this.enact(Faction.LIBERAL);

    this.postResult('enact', {
        policy: Faction.LIBERAL,
    });
});

mac.on(Transitions.ENACT_FASCIST, function () {
    let session = this.legislativeSession!;

    let discard = session.presidentCards;
    let index = discard.indexOf(Faction.FASCIST);
    discard.splice(index, 1);
    this.cardPool.discard(...discard);

    this.enact(Faction.FASCIST);

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

    this.postResult('enact', {
        policy: Faction.FASCIST,
    });
});

mac.from(GameState.LEGISLATING, function () {
    this.cardPool.check();

    let session = this.legislativeSession!;

    session.president.termLimited = true;
    session.chancellor.termLimited = this.alivePlayers.length > 5;

    this.legislativeSession = null;
});

mac.from(GameState.EXECUTIVE_ACTION, function () {
    this.executiveAction = null;
});

mac.on(Transitions.FASCIST_HITLER_VICTORY, function () {
    this.victory = 'FASCIST_HITLER';
});

mac.on(Transitions.LIBERAL_HITLER_VICTORY, function () {
    this.victory = 'LIBERAL_HITLER';
});

mac.on(Transitions.FASCIST_POLICY_VICTORY, function () {
    this.enact(Faction.FASCIST);
    this.victory = 'FASCIST_POLICY';
});

mac.on(Transitions.LIBERAL_POLICY_VICTORY, function () {
    this.enact(Faction.LIBERAL);
    this.victory = 'LIBERAL_POLICY';
});

export interface BoardState {
    liberals: number;
    fascists: number;

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

    cardPool: CardPool;
    nextPresident: number;

    state = GameState.LOBBY;

    boardState: BoardState;

    nomination: Nomination | null;

    legislativeSession: LegislativeSession | null;

    executiveAction: ExecutiveAction | null;

    results = new Array<{ name: string, args: any }>();

    victory: string | null = null;

    postResult(name: string, args: any) {
        this.results.push({
            name, args
        });
    }

    update() {
        this.state = mac.do_update(this, this.state);

        return this.results.splice(0, this.results.length);
    }

    enact(policy: Faction) {
        this.boardState.voteFailures = 0;

        for (let player of this.allPlayers)
            player.termLimited = false;

        if (policy == Faction.LIBERAL)
            this.boardState.liberals++;
        else if (policy == Faction.FASCIST)
            this.boardState.fascists++;
        else
            throw new Error(`Invalid faction: ${policy}`);
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

    serialize(perspective: Player) {
        let data: any = {
            players: this.allPlayers.map(p => json.serialize(p, perspective)),

            state: this.state,
        };

        if (this.state != GameState.LOBBY) {
            data.deckSize = this.cardPool.drawSize;

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
