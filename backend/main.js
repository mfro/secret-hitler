'use strict';

var http = require('http');
var EventEmitter = require('events');
var crypto = require('crypto');
var https = require('https');
var url = require('url');
var buffer = require('buffer');
var zlib = require('zlib');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var http__default = /*#__PURE__*/_interopDefaultLegacy(http);
var EventEmitter__default = /*#__PURE__*/_interopDefaultLegacy(EventEmitter);
var crypto__default = /*#__PURE__*/_interopDefaultLegacy(crypto);
var https__default = /*#__PURE__*/_interopDefaultLegacy(https);
var url__default = /*#__PURE__*/_interopDefaultLegacy(url);
var buffer__default = /*#__PURE__*/_interopDefaultLegacy(buffer);
var zlib__default = /*#__PURE__*/_interopDefaultLegacy(zlib);

const actions = new Map();
function invoke(name, ctx) {
    let action = actions.get(name);
    if (action == null)
        return Promise.reject(new Error(`Action not found: ${name}`));
    try {
        let result = action.invoke(ctx);
        return Promise.resolve(result);
    }
    catch (e) {
        return Promise.reject(e);
    }
}
function declare(name, action) {
    actions.set(name, {
        name: name,
        invoke: action,
    });
}
function error(ctx, msg) {
    return Promise.reject({
        message: `Player ${ctx.sender}: ${msg}`,
    });
}

var Faction;
(function (Faction) {
    Faction["LIBERAL"] = "LIBERAL";
    Faction["FASCIST"] = "FASCIST";
})(Faction || (Faction = {}));
var Role;
(function (Role) {
    Role["LIBERAL"] = "LIBERAL";
    Role["FASCIST"] = "FASCIST";
    Role["HITLER"] = "HITLER";
})(Role || (Role = {}));

class Assignment {
    constructor(role) {
        this.role = role;
    }
    get isHitler() {
        return this.role == Role.HITLER;
    }
    get isFascist() {
        return this.role == Role.HITLER || this.role == Role.FASCIST;
    }
    get isLiberal() {
        return this.role == Role.LIBERAL;
    }
    get membership() {
        if (this.role == Role.LIBERAL)
            return Faction.LIBERAL;
        return Faction.FASCIST;
    }
    serialize(player) {
        let players = player.game.allPlayers;
        if (players.find(p => p.assignment == null) != null)
            throw new Error(`Unassigned players while serializing ${player}`);
        let hitlerKnows = (players.length < 7);
        let data = {
            role: this.role,
        };
        if (this.role == Role.FASCIST) {
            data.hitler = players.find(p => p.assignment.isHitler);
        }
        if (this.role == Role.FASCIST ||
            (this.role == Role.HITLER) && hitlerKnows) {
            data.fascists = players
                .filter(p => p.assignment.role == Role.FASCIST)
                .filter(p => p != player);
        }
        return data;
    }
}

function serialize(t, t1) {
    if (t == null)
        return null;
    return t.serialize(t1);
}

function StateMachine2() {
    class StateMachine {
        constructor() {
            this.updates = new Map();
        }
        do_update(context, state) {
            let update = this.updates.get(state);
            if (!update)
                throw new Error(`Stuck on state ${state}`);
            let next = update(context);
            if (!next)
                return state;
            return this.do_update(context, next);
        }
        update(state, handler) {
            if (this.updates.get(state))
                throw new Error(`Overwriting state: ${state}`);
            this.updates.set(state, handler);
        }
    }
    return new StateMachine();
}

class Pile {
    constructor(liberal, fascist) {
        this.cards = new Array();
        while (liberal + fascist > 0) {
            let pLiberal = liberal / (liberal + fascist);
            let isLiberal = Math.random() < pLiberal;
            if (isLiberal) {
                this.cards.push(Faction.LIBERAL);
                liberal--;
            }
            else {
                this.cards.push(Faction.FASCIST);
                fascist--;
            }
        }
    }
    get size() { return this.cards.length; }
    add(f) {
        this.cards.push(f);
    }
    draw() {
        return this.cards.shift();
    }
    static combine(p1, p2) {
        let libs = p1.cards.filter(p => p == Faction.LIBERAL).length +
            p2.cards.filter(p => p == Faction.LIBERAL).length;
        return new Pile(libs, p1.size + p2.size - libs);
    }
}
class CardPool {
    constructor() {
        this.drawPile = new Pile(6, 11);
        this.discardPile = new Pile(0, 0);
    }
    get drawSize() {
        return this.drawPile.size;
    }
    get discardSize() {
        return this.discardPile.size;
    }
    check() {
        if (this.drawPile.size < 3) {
            this.drawPile = Pile.combine(this.drawPile, this.discardPile);
            this.discardPile = new Pile(0, 0);
        }
    }
    single() {
        let card = this.drawPile.draw();
        return card;
    }
    draw() {
        return [
            this.drawPile.draw(),
            this.drawPile.draw(),
            this.drawPile.draw(),
        ];
    }
    preview() {
        return this.drawPile.cards.slice(0, 3);
    }
    discard(...policies) {
        for (let policy of policies)
            this.discardPile.add(policy);
    }
}

class GameEvent {
    toJSON() {
        return {
            name: this.name,
            args: this.args,
        };
    }
}
(function (GameEvent) {
    const kRoleAssignment = 'role-assignment';
    const kTurnCompleted = 'turn-completed';
    const kNomination = 'nomination';
    const kVote = 'vote';
    const kPolicy = 'policy';
    const kVeto = 'veto';
    const kPreviewDeck = 'preview-deck';
    const kInvestigation = 'investigation';
    const kSpecialElection = 'special-election';
    const kAssassination = 'assassination';
    class RoleAssignment extends GameEvent {
        constructor(args) {
            super();
            this.args = args;
            this.name = kRoleAssignment;
            this.alert = true;
            this.log = false;
        }
    }
    GameEvent.RoleAssignment = RoleAssignment;
    class TurnCompleted extends GameEvent {
        constructor(args) {
            super();
            this.args = args;
            this.name = kTurnCompleted;
            this.alert = false;
            this.log = true;
        }
    }
    GameEvent.TurnCompleted = TurnCompleted;
    class Nomination extends GameEvent {
        constructor(args) {
            super();
            this.args = args;
            this.name = kNomination;
            this.alert = false;
            this.log = true;
        }
    }
    GameEvent.Nomination = Nomination;
    class Vote extends GameEvent {
        constructor(args) {
            super();
            this.args = args;
            this.name = kVote;
            this.alert = true;
            this.log = true;
        }
    }
    GameEvent.Vote = Vote;
    class Policy extends GameEvent {
        constructor(args) {
            super();
            this.args = args;
            this.name = kPolicy;
            this.alert = true;
            this.log = true;
        }
    }
    GameEvent.Policy = Policy;
    class Veto extends GameEvent {
        constructor(args) {
            super();
            this.args = args;
            this.name = kVeto;
            this.alert = true;
            this.log = true;
        }
    }
    GameEvent.Veto = Veto;
    class PreviewDeck extends GameEvent {
        constructor(args) {
            super();
            this.args = args;
            this.name = kPreviewDeck;
            this.alert = false;
            this.log = true;
        }
    }
    GameEvent.PreviewDeck = PreviewDeck;
    class Investigation extends GameEvent {
        constructor(args) {
            super();
            this.args = args;
            this.name = kInvestigation;
            this.alert = true;
            this.log = true;
        }
    }
    GameEvent.Investigation = Investigation;
    class SpecialElection extends GameEvent {
        constructor(args) {
            super();
            this.args = args;
            this.name = kSpecialElection;
            this.alert = true;
            this.log = true;
        }
    }
    GameEvent.SpecialElection = SpecialElection;
    class Assassination extends GameEvent {
        constructor(args) {
            super();
            this.args = args;
            this.name = kAssassination;
            this.alert = true;
            this.log = true;
        }
    }
    GameEvent.Assassination = Assassination;
})(GameEvent || (GameEvent = {}));

let nextId = 1;
class Player {
    constructor(game, name) {
        this.isReady = false;
        this.isAlive = true;
        this.index = null;
        this.assignment = null;
        this.vote = null;
        this.termLimited = false;
        this.game = game;
        this.id = nextId++;
        this.name = name;
    }
    toString() {
        return `[${this.id} ${this.name}]`;
    }
    toJSON() {
        return this.id;
    }
    serialize(perspective) {
        let data = {
            id: this.id,
            name: this.name,
            isLocalPlayer: false,
        };
        if (this == perspective) {
            data.isLocalPlayer = true;
            data.assignment = serialize(this.assignment, this);
        }
        if (this.game.state == GameState.LOBBY) {
            data.isReady = this.isReady;
        }
        else {
            data.index = this.index;
            data.isAlive = this.isAlive;
            data.isTermLimited = this.termLimited;
        }
        if (this.game.state == GameState.VOTING) {
            data.hasVoted = this.vote !== null;
        }
        else {
            data.vote = this.vote;
        }
        return data;
    }
}

var GameState;
(function (GameState) {
    GameState["LOBBY"] = "LOBBY";
    GameState["NOMINATING"] = "NOMINATING";
    GameState["VOTING"] = "VOTING";
    // _VOTES_COUNTED = '_VOTES_COUNTED',
    GameState["LEGISLATING"] = "LEGISLATING";
    // _POLICY_ENACTED = '_POLICY_ENACTED',
    GameState["EXECUTIVE_ACTION"] = "EXECUTIVE_ACTION";
    GameState["COMPLETED"] = "COMPLETED";
})(GameState || (GameState = {}));
var Transitions;
(function (Transitions) {
    Transitions["START_GAME"] = "START_GAME";
    Transitions["START_VOTING"] = "START_VOTING";
    Transitions["COMPLETE_VOTING"] = "COMPLETE_VOTING";
    Transitions["VETO_POLICY"] = "VETO_POLICY";
    Transitions["ENACT_LIBERAL"] = "ENACT_LIBERAL";
    Transitions["ENACT_FASCIST"] = "ENACT_FASCIST";
    Transitions["COMPLETE_ACTION"] = "COMPLETE_ACTION";
})(Transitions || (Transitions = {}));
function assertPresent(value, message) {
    if (!value) {
        throw new Error(message);
    }
    return value;
}
const mac = StateMachine2();
function END_TURN(game) {
    game.emit(new GameEvent.TurnCompleted({
        turn: game.currentTurn,
    }));
    game.currentTurn++;
    return START_NOMINATING(game);
}
function FINISH_LEGISLATURE(game) {
    game.cardPool.check();
    game.updateCardPool();
    let session = assertPresent(game.legislativeSession, 'no session in FINISH_LEGISLATURE');
    session.president.termLimited = game.alivePlayers.length > 5;
    session.chancellor.termLimited = true;
    game.legislativeSession = null;
    return END_TURN(game);
}
function FINISH_EXECUTIVE_ACTION(game) {
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
    let hitler = game.allPlayers.find(p => p.assignment.isHitler);
    if (!hitler.isAlive) {
        game.victory = 'LIBERAL_HITLER';
        return GameState.COMPLETED;
    }
    return FINISH_LEGISLATURE(game);
}
function START_EXECUTIVE_ACTION(game, president) {
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
    }
    else if (count <= 8) {
        type = [
            ExecutiveActionType.NONE,
            ExecutiveActionType.INSPECT,
            ExecutiveActionType.SPECIAL_ELECTION,
            ExecutiveActionType.BULLET,
            ExecutiveActionType.BULLET,
        ][game.boardState.fascists - 1];
    }
    else if (count <= 10) {
        type = [
            ExecutiveActionType.INSPECT,
            ExecutiveActionType.INSPECT,
            ExecutiveActionType.SPECIAL_ELECTION,
            ExecutiveActionType.BULLET,
            ExecutiveActionType.BULLET,
        ][game.boardState.fascists - 1];
    }
    else {
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
function ENACT_POLICY(game, policy) {
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
function VETO_POLICY(game) {
    let session = assertPresent(game.legislativeSession, 'no session in VETO_POLICY');
    game.cardPool.discard(...session.presidentCards);
    game.emit(new GameEvent.Veto({
        agree: true,
        president: session.president,
        chancellor: session.chancellor,
    }));
    return FINISH_LEGISLATURE(game);
}
function START_LEGISLATURE(game, args) {
    game.legislativeSession = {
        president: args.president,
        chancellor: args.chancellor,
        presidentCards: game.cardPool.draw(),
        chancellorCards: null,
        enactedPolicy: null,
        vetoAccepted: null,
        vetoRequested: false,
    };
    return GameState.LEGISLATING;
}
function ANARCHY(game) {
    let policy = assertPresent(game.cardPool.single(), 'empty deck in ANARCHY');
    game.enact(policy, undefined);
    game.updateCardPool();
    game.cardPool.check();
    if (game.victory)
        return GameState.COMPLETED;
    return END_TURN(game);
}
function ELECTED_HITLER(game) {
    game.victory = 'FASCIST_HITLER';
    return GameState.COMPLETED;
}
function FINISH_VOTING(game) {
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
        if (game.boardState.fascists >= 3 && chan.assignment.isHitler)
            return ELECTED_HITLER(game);
        return START_LEGISLATURE(game, {
            president: pres,
            chancellor: chan,
        });
    }
    else {
        game.boardState.voteFailures++;
        if (game.boardState.voteFailures == 3)
            return ANARCHY(game);
        return START_NOMINATING(game);
    }
}
function START_VOTING(game) {
    for (let player of game.allPlayers) {
        player.vote = null;
    }
    return GameState.VOTING;
}
function FINISH_NOMINATING(game) {
    let nomination = assertPresent(game.nomination, 'no nomination in FINISH_NOMINATING');
    let chan = assertPresent(nomination.chancellor, 'no chancellor in FINISH_NOMINATING');
    game.emit(new GameEvent.Nomination({
        president: nomination.president,
        chancellor: chan,
    }));
    return START_VOTING(game);
}
function START_NOMINATING(game) {
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
}
function BEGIN_GAME(game) {
    game.cardPool = new CardPool();
    game.boardState = {
        liberals: 0,
        fascists: 0,
        voteFailures: 0,
        drawSize: game.cardPool.drawSize,
        discardSize: game.cardPool.discardSize,
    };
    game.currentTurn = 1;
    game.nextPresident = Math.floor(Math.random() * game.allPlayers.length);
    game.assignRoles();
    game.emit(new GameEvent.RoleAssignment({}));
    return START_NOMINATING(game);
}
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
                    membership: action.target.assignment.membership,
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
var ExecutiveActionType;
(function (ExecutiveActionType) {
    ExecutiveActionType["NONE"] = "NONE";
    ExecutiveActionType["PREVIEW_DECK"] = "PREVIEW_DECK";
    ExecutiveActionType["INSPECT"] = "INSPECT";
    ExecutiveActionType["SPECIAL_ELECTION"] = "SPECIAL_ELECTION";
    ExecutiveActionType["BULLET"] = "BULLET";
})(ExecutiveActionType || (ExecutiveActionType = {}));
class Game {
    constructor() {
        this.allPlayers = new Array();
        this.state = GameState.LOBBY;
        this.alerts = new Array();
        this.log = new Array();
        this.victory = null;
        let id = Math.floor(Math.random() * 100);
        this.name = id.toString();
    }
    get alivePlayers() { return this.allPlayers.filter(p => p.isAlive); }
    emit(event) {
        if (event.alert)
            this.alerts.push(event);
        if (event.log)
            this.log.push(event);
    }
    update() {
        this.state = mac.do_update(this, this.state);
        return this.alerts.splice(0, this.alerts.length);
    }
    enact(policy, government) {
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
    addPlayer(name) {
        if (this.state != GameState.LOBBY)
            throw new Error(`Added player ${name} in game state ${this.state}`);
        let player = new Player(this, name);
        this.allPlayers.push(player);
        return player;
    }
    removePlayer(player) {
        if (this.state != GameState.LOBBY)
            throw new Error(`Removed player ${player} in game state ${this.state}`);
        let index = this.allPlayers.indexOf(player);
        if (index < 0)
            throw new Error(`Player not found: ${player}`);
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
        for (let i = 0; i < fCount; i++)
            roles.push(Role.FASCIST);
        for (let i = 0; i < lCount; i++)
            roles.push(Role.LIBERAL);
        for (let index = 0; index < this.allPlayers.length; index++) {
            let player = this.allPlayers[index];
            player.index = index;
            let i = Math.floor(Math.random() * roles.length);
            let role = roles.splice(i, 1)[0];
            player.assignment = new Assignment(role);
            console.log(`  player ${player} is ${role}`);
        }
    }
    serialize(perspective) {
        let data = {
            log: this.log,
            name: this.name,
            players: this.allPlayers.map(p => serialize(p, perspective)),
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

declare('COMPLETE_ACTION', ctx => {
    if (ctx.game.state != GameState.EXECUTIVE_ACTION)
        return error(ctx, `finished action in game state ${ctx.game.state}`);
    let action = ctx.game.executiveAction;
    if (ctx.sender != action.president)
        return error(ctx, `finished action when ${action.president} is president`);
    switch (action.type) {
        case ExecutiveActionType.INSPECT:
        case ExecutiveActionType.SPECIAL_ELECTION:
        case ExecutiveActionType.BULLET:
            if (action.target == null)
                return error(ctx, `finished action ${action.type} with no target`);
            break;
    }
    action.complete = true;
});

declare('LEGISLATURE_DISCARD', ctx => {
    if (ctx.game.state != GameState.LEGISLATING)
        return error(ctx, `discarded legislature in game state ${ctx.game.state}`);
    let session = ctx.game.legislativeSession;
    if (session.chancellorCards == null) {
        if (ctx.sender != session.president)
            return error(ctx, `discarded legislature when ${session.president} is president`);
        let index = session.presidentCards.findIndex(p => p == ctx.params.card);
        if (index < 0)
            return error(ctx, `discarded card ${ctx.params.card} which is not an option`);
        let copy = session.presidentCards.slice();
        copy.splice(index, 1);
        session.chancellorCards = copy;
    }
    else {
        if (ctx.sender != session.chancellor)
            return error(ctx, `discarded legislature when ${session.chancellor} is chancellor`);
        let index = session.chancellorCards.findIndex(p => p == ctx.params.card);
        if (index < 0)
            return error(ctx, `discarded card ${ctx.params.card} which is not an option`);
        let copy = session.chancellorCards.slice();
        copy.splice(index, 1);
        session.enactedPolicy = copy[0];
    }
});

declare('LEGISLATURE_VETO', ctx => {
    if (ctx.game.state != GameState.LEGISLATING)
        return error(ctx, `requsted veto in game state ${ctx.game.state}`);
    let session = ctx.game.legislativeSession;
    if (ctx.sender == session.president) {
        if (!session.vetoRequested)
            return error(ctx, `accepted veto when none was requested`);
        if (typeof ctx.params.response != 'boolean')
            return error(ctx, `invalid veto response ${ctx.params.response}`);
        session.vetoAccepted = ctx.params.response;
    }
    else if (ctx.sender == session.chancellor) {
        if (session.vetoRequested)
            return error(ctx, `requested duplicate veto`);
        session.vetoRequested = true;
    }
    else
        return error(ctx, `requested veto when not in legislature`);
});

declare('NOMINATE', ctx => {
    if (ctx.game.state != GameState.NOMINATING)
        return error(ctx, `nominated chancellor in game state ${ctx.game.state}`);
    if (ctx.sender != ctx.game.nomination.president)
        return error(ctx, `nominated chancellor when ${ctx.game.nomination.president} is president`);
    let player = ctx.game.allPlayers.find(p => p.id == ctx.params.playerId);
    if (player == null)
        return error(ctx, 'nominated unknown player: ' + ctx.params.playerId);
    if (!player.isAlive)
        return error(ctx, 'nominated dead player: ' + ctx.params.playerId);
    if (player.termLimited)
        return error(ctx, 'nominated term-limited player: ' + ctx.params.playerId);
    ctx.game.nomination.chancellor = player;
});

declare('SET_ACTION_TARGET', ctx => {
    if (ctx.game.state != GameState.EXECUTIVE_ACTION)
        return error(ctx, `requsted executed action in game state ${ctx.game.state}`);
    let action = ctx.game.executiveAction;
    if (ctx.sender != action.president)
        return error(ctx, `executed action when ${action.president} is president`);
    let player = ctx.game.allPlayers.find(p => p.id == ctx.params.target);
    if (player == null)
        return error(ctx, 'set action target to unknown player: ' + ctx.params.target);
    if (!player.isAlive)
        return error(ctx, 'set action target to dead player: ' + ctx.params.target);
    action.target = player;
});

declare('SET_READY', ctx => {
    if (ctx.game.state != GameState.LOBBY)
        return error(ctx, `set ready in game state ${ctx.game.state}`);
    if (typeof ctx.params.isReady != 'boolean')
        return error(ctx, `submitted invalid ready: ${ctx.params}`);
    ctx.sender.isReady = ctx.params.isReady;
});

declare('SUBMIT_VOTE', ctx => {
    if (ctx.game.state != GameState.VOTING)
        return error(ctx, `submitted vote in game state ${ctx.game.state}`);
    if (ctx.sender.vote !== null)
        return error(ctx, `submitted duplicate vote`);
    if (typeof ctx.params.vote != 'boolean')
        return error(ctx, `submitted invalid vote: ${ctx.params}`);
    ctx.sender.vote = ctx.params.vote;
});

var has = Object.prototype.hasOwnProperty;

/**
 * An auto incrementing id which we can use to create "unique" Ultron instances
 * so we can track the event emitters that are added through the Ultron
 * interface.
 *
 * @type {Number}
 * @private
 */
var id = 0;

/**
 * Ultron is high-intelligence robot. It gathers intelligence so it can start improving
 * upon his rudimentary design. It will learn from your EventEmitting patterns
 * and exterminate them.
 *
 * @constructor
 * @param {EventEmitter} ee EventEmitter instance we need to wrap.
 * @api public
 */
function Ultron(ee) {
  if (!(this instanceof Ultron)) return new Ultron(ee);

  this.id = id++;
  this.ee = ee;
}

/**
 * Register a new EventListener for the given event.
 *
 * @param {String} event Name of the event.
 * @param {Functon} fn Callback function.
 * @param {Mixed} context The context of the function.
 * @returns {Ultron}
 * @api public
 */
Ultron.prototype.on = function on(event, fn, context) {
  fn.__ultron = this.id;
  this.ee.on(event, fn, context);

  return this;
};
/**
 * Add an EventListener that's only called once.
 *
 * @param {String} event Name of the event.
 * @param {Function} fn Callback function.
 * @param {Mixed} context The context of the function.
 * @returns {Ultron}
 * @api public
 */
Ultron.prototype.once = function once(event, fn, context) {
  fn.__ultron = this.id;
  this.ee.once(event, fn, context);

  return this;
};

/**
 * Remove the listeners we assigned for the given event.
 *
 * @returns {Ultron}
 * @api public
 */
Ultron.prototype.remove = function remove() {
  var args = arguments
    , ee = this.ee
    , event;

  //
  // When no event names are provided we assume that we need to clear all the
  // events that were assigned through us.
  //
  if (args.length === 1 && 'string' === typeof args[0]) {
    args = args[0].split(/[, ]+/);
  } else if (!args.length) {
    if (ee.eventNames) {
      args = ee.eventNames();
    } else if (ee._events) {
      args = [];

      for (event in ee._events) {
        if (has.call(ee._events, event)) args.push(event);
      }

      if (Object.getOwnPropertySymbols) {
        args = args.concat(Object.getOwnPropertySymbols(ee._events));
      }
    }
  }

  for (var i = 0; i < args.length; i++) {
    var listeners = ee.listeners(args[i]);

    for (var j = 0; j < listeners.length; j++) {
      event = listeners[j];

      //
      // Once listeners have a `listener` property that stores the real listener
      // in the EventEmitter that ships with Node.js.
      //
      if (event.listener) {
        if (event.listener.__ultron !== this.id) continue;
      } else if (event.__ultron !== this.id) {
        continue;
      }

      ee.removeListener(args[i], event);
    }
  }

  return this;
};

/**
 * Destroy the Ultron instance, remove all listeners and release all references.
 *
 * @returns {Boolean}
 * @api public
 */
Ultron.prototype.destroy = function destroy() {
  if (!this.ee) return false;

  this.remove();
  this.ee = null;

  return true;
};

//
// Expose the module.
//
var ultron = Ultron;

function createCommonjsModule(fn) {
  var module = { exports: {} };
	return fn(module, module.exports), module.exports;
}

/* eslint-disable node/no-deprecated-api */

var safeBuffer = createCommonjsModule(function (module, exports) {
var Buffer = buffer__default['default'].Buffer;

// alternative to using Object.keys for old browsers
function copyProps (src, dst) {
  for (var key in src) {
    dst[key] = src[key];
  }
}
if (Buffer.from && Buffer.alloc && Buffer.allocUnsafe && Buffer.allocUnsafeSlow) {
  module.exports = buffer__default['default'];
} else {
  // Copy properties from require('buffer')
  copyProps(buffer__default['default'], exports);
  exports.Buffer = SafeBuffer;
}

function SafeBuffer (arg, encodingOrOffset, length) {
  return Buffer(arg, encodingOrOffset, length)
}

// Copy static methods from Buffer
copyProps(Buffer, SafeBuffer);

SafeBuffer.from = function (arg, encodingOrOffset, length) {
  if (typeof arg === 'number') {
    throw new TypeError('Argument must not be a number')
  }
  return Buffer(arg, encodingOrOffset, length)
};

SafeBuffer.alloc = function (size, fill, encoding) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  var buf = Buffer(size);
  if (fill !== undefined) {
    if (typeof encoding === 'string') {
      buf.fill(fill, encoding);
    } else {
      buf.fill(fill);
    }
  } else {
    buf.fill(0);
  }
  return buf
};

SafeBuffer.allocUnsafe = function (size) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  return Buffer(size)
};

SafeBuffer.allocUnsafeSlow = function (size) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  return buffer__default['default'].SlowBuffer(size)
};
});

function Queue(options) {
  if (!(this instanceof Queue)) {
    return new Queue(options);
  }

  options = options || {};
  this.concurrency = options.concurrency || Infinity;
  this.pending = 0;
  this.jobs = [];
  this.cbs = [];
  this._done = done.bind(this);
}

var arrayAddMethods = [
  'push',
  'unshift',
  'splice'
];

arrayAddMethods.forEach(function(method) {
  Queue.prototype[method] = function() {
    var methodResult = Array.prototype[method].apply(this.jobs, arguments);
    this._run();
    return methodResult;
  };
});

Object.defineProperty(Queue.prototype, 'length', {
  get: function() {
    return this.pending + this.jobs.length;
  }
});

Queue.prototype._run = function() {
  if (this.pending === this.concurrency) {
    return;
  }
  if (this.jobs.length) {
    var job = this.jobs.shift();
    this.pending++;
    job(this._done);
    this._run();
  }

  if (this.pending === 0) {
    while (this.cbs.length !== 0) {
      var cb = this.cbs.pop();
      process.nextTick(cb);
    }
  }
};

Queue.prototype.onDone = function(cb) {
  if (typeof cb === 'function') {
    this.cbs.push(cb);
    this._run();
  }
};

function done() {
  this.pending--;
  this._run();
}

var asyncLimiter = Queue;

/*!
 * ws: a node.js websocket client
 * Copyright(c) 2011 Einar Otto Stangvik <einaros@gmail.com>
 * MIT Licensed
 */

var BufferUtil = createCommonjsModule(function (module) {



const Buffer = safeBuffer.Buffer;

/**
 * Merges an array of buffers into a new buffer.
 *
 * @param {Buffer[]} list The array of buffers to concat
 * @param {Number} totalLength The total length of buffers in the list
 * @return {Buffer} The resulting buffer
 * @public
 */
const concat = (list, totalLength) => {
  const target = Buffer.allocUnsafe(totalLength);
  var offset = 0;

  for (var i = 0; i < list.length; i++) {
    const buf = list[i];
    buf.copy(target, offset);
    offset += buf.length;
  }

  return target;
};

try {
  const bufferUtil = require('bufferutil');

  module.exports = Object.assign({ concat }, bufferUtil.BufferUtil || bufferUtil);
} catch (e) /* istanbul ignore next */ {
  /**
   * Masks a buffer using the given mask.
   *
   * @param {Buffer} source The buffer to mask
   * @param {Buffer} mask The mask to use
   * @param {Buffer} output The buffer where to store the result
   * @param {Number} offset The offset at which to start writing
   * @param {Number} length The number of bytes to mask.
   * @public
   */
  const mask = (source, mask, output, offset, length) => {
    for (var i = 0; i < length; i++) {
      output[offset + i] = source[i] ^ mask[i & 3];
    }
  };

  /**
   * Unmasks a buffer using the given mask.
   *
   * @param {Buffer} buffer The buffer to unmask
   * @param {Buffer} mask The mask to use
   * @public
   */
  const unmask = (buffer, mask) => {
    // Required until https://github.com/nodejs/node/issues/9006 is resolved.
    const length = buffer.length;
    for (var i = 0; i < length; i++) {
      buffer[i] ^= mask[i & 3];
    }
  };

  module.exports = { concat, mask, unmask };
}
});

const Buffer = safeBuffer.Buffer;

const TRAILER = Buffer.from([0x00, 0x00, 0xff, 0xff]);
const EMPTY_BLOCK = Buffer.from([0x00]);

const kWriteInProgress = Symbol('write-in-progress');
const kPendingClose = Symbol('pending-close');
const kTotalLength = Symbol('total-length');
const kCallback = Symbol('callback');
const kBuffers = Symbol('buffers');
const kError = Symbol('error');
const kOwner = Symbol('owner');

//
// We limit zlib concurrency, which prevents severe memory fragmentation
// as documented in https://github.com/nodejs/node/issues/8871#issuecomment-250915913
// and https://github.com/websockets/ws/issues/1202
//
// Intentionally global; it's the global thread pool that's an issue.
//
let zlibLimiter;

/**
 * permessage-deflate implementation.
 */
class PerMessageDeflate {
  /**
   * Creates a PerMessageDeflate instance.
   *
   * @param {Object} options Configuration options
   * @param {Boolean} options.serverNoContextTakeover Request/accept disabling
   *     of server context takeover
   * @param {Boolean} options.clientNoContextTakeover Advertise/acknowledge
   *     disabling of client context takeover
   * @param {(Boolean|Number)} options.serverMaxWindowBits Request/confirm the
   *     use of a custom server window size
   * @param {(Boolean|Number)} options.clientMaxWindowBits Advertise support
   *     for, or request, a custom client window size
   * @param {Number} options.level The value of zlib's `level` param
   * @param {Number} options.memLevel The value of zlib's `memLevel` param
   * @param {Number} options.threshold Size (in bytes) below which messages
   *     should not be compressed
   * @param {Number} options.concurrencyLimit The number of concurrent calls to
   *     zlib
   * @param {Boolean} isServer Create the instance in either server or client
   *     mode
   * @param {Number} maxPayload The maximum allowed message length
   */
  constructor (options, isServer, maxPayload) {
    this._maxPayload = maxPayload | 0;
    this._options = options || {};
    this._threshold = this._options.threshold !== undefined
      ? this._options.threshold
      : 1024;
    this._isServer = !!isServer;
    this._deflate = null;
    this._inflate = null;

    this.params = null;

    if (!zlibLimiter) {
      const concurrency = this._options.concurrencyLimit !== undefined
        ? this._options.concurrencyLimit
        : 10;
      zlibLimiter = new asyncLimiter({ concurrency });
    }
  }

  /**
   * @type {String}
   */
  static get extensionName () {
    return 'permessage-deflate';
  }

  /**
   * Create extension parameters offer.
   *
   * @return {Object} Extension parameters
   * @public
   */
  offer () {
    const params = {};

    if (this._options.serverNoContextTakeover) {
      params.server_no_context_takeover = true;
    }
    if (this._options.clientNoContextTakeover) {
      params.client_no_context_takeover = true;
    }
    if (this._options.serverMaxWindowBits) {
      params.server_max_window_bits = this._options.serverMaxWindowBits;
    }
    if (this._options.clientMaxWindowBits) {
      params.client_max_window_bits = this._options.clientMaxWindowBits;
    } else if (this._options.clientMaxWindowBits == null) {
      params.client_max_window_bits = true;
    }

    return params;
  }

  /**
   * Accept extension offer.
   *
   * @param {Array} paramsList Extension parameters
   * @return {Object} Accepted configuration
   * @public
   */
  accept (paramsList) {
    paramsList = this.normalizeParams(paramsList);

    var params;
    if (this._isServer) {
      params = this.acceptAsServer(paramsList);
    } else {
      params = this.acceptAsClient(paramsList);
    }

    this.params = params;
    return params;
  }

  /**
   * Releases all resources used by the extension.
   *
   * @public
   */
  cleanup () {
    if (this._inflate) {
      if (this._inflate[kWriteInProgress]) {
        this._inflate[kPendingClose] = true;
      } else {
        this._inflate.close();
        this._inflate = null;
      }
    }
    if (this._deflate) {
      if (this._deflate[kWriteInProgress]) {
        this._deflate[kPendingClose] = true;
      } else {
        this._deflate.close();
        this._deflate = null;
      }
    }
  }

  /**
   * Accept extension offer from client.
   *
   * @param {Array} paramsList Extension parameters
   * @return {Object} Accepted configuration
   * @private
   */
  acceptAsServer (paramsList) {
    const accepted = {};
    const result = paramsList.some((params) => {
      if (
        (this._options.serverNoContextTakeover === false &&
          params.server_no_context_takeover) ||
        (this._options.serverMaxWindowBits === false &&
          params.server_max_window_bits) ||
        (typeof this._options.serverMaxWindowBits === 'number' &&
          typeof params.server_max_window_bits === 'number' &&
          this._options.serverMaxWindowBits > params.server_max_window_bits) ||
        (typeof this._options.clientMaxWindowBits === 'number' &&
          !params.client_max_window_bits)
      ) {
        return;
      }

      if (
        this._options.serverNoContextTakeover ||
        params.server_no_context_takeover
      ) {
        accepted.server_no_context_takeover = true;
      }
      if (
        this._options.clientNoContextTakeover ||
        (this._options.clientNoContextTakeover !== false &&
          params.client_no_context_takeover)
      ) {
        accepted.client_no_context_takeover = true;
      }
      if (typeof this._options.serverMaxWindowBits === 'number') {
        accepted.server_max_window_bits = this._options.serverMaxWindowBits;
      } else if (typeof params.server_max_window_bits === 'number') {
        accepted.server_max_window_bits = params.server_max_window_bits;
      }
      if (typeof this._options.clientMaxWindowBits === 'number') {
        accepted.client_max_window_bits = this._options.clientMaxWindowBits;
      } else if (
        this._options.clientMaxWindowBits !== false &&
        typeof params.client_max_window_bits === 'number'
      ) {
        accepted.client_max_window_bits = params.client_max_window_bits;
      }
      return true;
    });

    if (!result) throw new Error("Doesn't support the offered configuration");

    return accepted;
  }

  /**
   * Accept extension response from server.
   *
   * @param {Array} paramsList Extension parameters
   * @return {Object} Accepted configuration
   * @private
   */
  acceptAsClient (paramsList) {
    const params = paramsList[0];

    if (
      this._options.clientNoContextTakeover === false &&
      params.client_no_context_takeover
    ) {
      throw new Error('Invalid value for "client_no_context_takeover"');
    }

    if (
      (typeof this._options.clientMaxWindowBits === 'number' &&
        (!params.client_max_window_bits ||
          params.client_max_window_bits > this._options.clientMaxWindowBits)) ||
      (this._options.clientMaxWindowBits === false &&
        params.client_max_window_bits)
    ) {
      throw new Error('Invalid value for "client_max_window_bits"');
    }

    return params;
  }

  /**
   * Normalize extensions parameters.
   *
   * @param {Array} paramsList Extension parameters
   * @return {Array} Normalized extensions parameters
   * @private
   */
  normalizeParams (paramsList) {
    return paramsList.map((params) => {
      Object.keys(params).forEach((key) => {
        var value = params[key];
        if (value.length > 1) {
          throw new Error(`Multiple extension parameters for ${key}`);
        }

        value = value[0];

        switch (key) {
          case 'server_no_context_takeover':
          case 'client_no_context_takeover':
            if (value !== true) {
              throw new Error(`invalid extension parameter value for ${key} (${value})`);
            }
            params[key] = true;
            break;
          case 'server_max_window_bits':
          case 'client_max_window_bits':
            if (typeof value === 'string') {
              value = parseInt(value, 10);
              if (
                Number.isNaN(value) ||
                value < zlib__default['default'].Z_MIN_WINDOWBITS ||
                value > zlib__default['default'].Z_MAX_WINDOWBITS
              ) {
                throw new Error(`invalid extension parameter value for ${key} (${value})`);
              }
            }
            if (!this._isServer && value === true) {
              throw new Error(`Missing extension parameter value for ${key}`);
            }
            params[key] = value;
            break;
          default:
            throw new Error(`Not defined extension parameter (${key})`);
        }
      });
      return params;
    });
  }

  /**
   * Decompress data. Concurrency limited by async-limiter.
   *
   * @param {Buffer} data Compressed data
   * @param {Boolean} fin Specifies whether or not this is the last fragment
   * @param {Function} callback Callback
   * @public
   */
  decompress (data, fin, callback) {
    zlibLimiter.push((done) => {
      this._decompress(data, fin, (err, result) => {
        done();
        callback(err, result);
      });
    });
  }

  /**
   * Compress data. Concurrency limited by async-limiter.
   *
   * @param {Buffer} data Data to compress
   * @param {Boolean} fin Specifies whether or not this is the last fragment
   * @param {Function} callback Callback
   * @public
   */
  compress (data, fin, callback) {
    zlibLimiter.push((done) => {
      this._compress(data, fin, (err, result) => {
        done();
        callback(err, result);
      });
    });
  }

  /**
   * Decompress data.
   *
   * @param {Buffer} data Compressed data
   * @param {Boolean} fin Specifies whether or not this is the last fragment
   * @param {Function} callback Callback
   * @private
   */
  _decompress (data, fin, callback) {
    const endpoint = this._isServer ? 'client' : 'server';

    if (!this._inflate) {
      const key = `${endpoint}_max_window_bits`;
      const windowBits = typeof this.params[key] !== 'number'
        ? zlib__default['default'].Z_DEFAULT_WINDOWBITS
        : this.params[key];

      this._inflate = zlib__default['default'].createInflateRaw({ windowBits });
      this._inflate[kTotalLength] = 0;
      this._inflate[kBuffers] = [];
      this._inflate[kOwner] = this;
      this._inflate.on('error', inflateOnError);
      this._inflate.on('data', inflateOnData);
    }

    this._inflate[kCallback] = callback;
    this._inflate[kWriteInProgress] = true;

    this._inflate.write(data);
    if (fin) this._inflate.write(TRAILER);

    this._inflate.flush(() => {
      const err = this._inflate[kError];

      if (err) {
        this._inflate.close();
        this._inflate = null;
        callback(err);
        return;
      }

      const data = BufferUtil.concat(
        this._inflate[kBuffers],
        this._inflate[kTotalLength]
      );

      if (
        (fin && this.params[`${endpoint}_no_context_takeover`]) ||
        this._inflate[kPendingClose]
      ) {
        this._inflate.close();
        this._inflate = null;
      } else {
        this._inflate[kWriteInProgress] = false;
        this._inflate[kTotalLength] = 0;
        this._inflate[kBuffers] = [];
      }

      callback(null, data);
    });
  }

  /**
   * Compress data.
   *
   * @param {Buffer} data Data to compress
   * @param {Boolean} fin Specifies whether or not this is the last fragment
   * @param {Function} callback Callback
   * @private
   */
  _compress (data, fin, callback) {
    if (!data || data.length === 0) {
      process.nextTick(callback, null, EMPTY_BLOCK);
      return;
    }

    const endpoint = this._isServer ? 'server' : 'client';

    if (!this._deflate) {
      const key = `${endpoint}_max_window_bits`;
      const windowBits = typeof this.params[key] !== 'number'
        ? zlib__default['default'].Z_DEFAULT_WINDOWBITS
        : this.params[key];

      this._deflate = zlib__default['default'].createDeflateRaw({
        memLevel: this._options.memLevel,
        level: this._options.level,
        flush: zlib__default['default'].Z_SYNC_FLUSH,
        windowBits
      });

      this._deflate[kTotalLength] = 0;
      this._deflate[kBuffers] = [];

      //
      // `zlib.DeflateRaw` emits an `'error'` event only when an attempt to use
      // it is made after it has already been closed. This cannot happen here,
      // so we only add a listener for the `'data'` event.
      //
      this._deflate.on('data', deflateOnData);
    }

    this._deflate[kWriteInProgress] = true;

    this._deflate.write(data);
    this._deflate.flush(zlib__default['default'].Z_SYNC_FLUSH, () => {
      var data = BufferUtil.concat(
        this._deflate[kBuffers],
        this._deflate[kTotalLength]
      );

      if (fin) data = data.slice(0, data.length - 4);

      if (
        (fin && this.params[`${endpoint}_no_context_takeover`]) ||
        this._deflate[kPendingClose]
      ) {
        this._deflate.close();
        this._deflate = null;
      } else {
        this._deflate[kWriteInProgress] = false;
        this._deflate[kTotalLength] = 0;
        this._deflate[kBuffers] = [];
      }

      callback(null, data);
    });
  }
}

var PerMessageDeflate_1 = PerMessageDeflate;

/**
 * The listener of the `zlib.DeflateRaw` stream `'data'` event.
 *
 * @param {Buffer} chunk A chunk of data
 * @private
 */
function deflateOnData (chunk) {
  this[kBuffers].push(chunk);
  this[kTotalLength] += chunk.length;
}

/**
 * The listener of the `zlib.InflateRaw` stream `'data'` event.
 *
 * @param {Buffer} chunk A chunk of data
 * @private
 */
function inflateOnData (chunk) {
  this[kTotalLength] += chunk.length;

  if (
    this[kOwner]._maxPayload < 1 ||
    this[kTotalLength] <= this[kOwner]._maxPayload
  ) {
    this[kBuffers].push(chunk);
    return;
  }

  this[kError] = new Error('max payload size exceeded');
  this[kError].closeCode = 1009;
  this.removeListener('data', inflateOnData);
  this.reset();
}

/**
 * The listener of the `zlib.InflateRaw` stream `'error'` event.
 *
 * @param {Error} err The emitted error
 * @private
 */
function inflateOnError (err) {
  //
  // There is no need to call `Zlib#close()` as the handle is automatically
  // closed when an error is emitted.
  //
  this[kOwner]._inflate = null;
  this[kCallback](err);
}

/**
 * Class representing an event.
 *
 * @private
 */
class Event {
  /**
   * Create a new `Event`.
   *
   * @param {String} type The name of the event
   * @param {Object} target A reference to the target to which the event was dispatched
   */
  constructor (type, target) {
    this.target = target;
    this.type = type;
  }
}

/**
 * Class representing a message event.
 *
 * @extends Event
 * @private
 */
class MessageEvent extends Event {
  /**
   * Create a new `MessageEvent`.
   *
   * @param {(String|Buffer|ArrayBuffer|Buffer[])} data The received data
   * @param {WebSocket} target A reference to the target to which the event was dispatched
   */
  constructor (data, target) {
    super('message', target);

    this.data = data;
  }
}

/**
 * Class representing a close event.
 *
 * @extends Event
 * @private
 */
class CloseEvent extends Event {
  /**
   * Create a new `CloseEvent`.
   *
   * @param {Number} code The status code explaining why the connection is being closed
   * @param {String} reason A human-readable string explaining why the connection is closing
   * @param {WebSocket} target A reference to the target to which the event was dispatched
   */
  constructor (code, reason, target) {
    super('close', target);

    this.wasClean = target._closeFrameReceived && target._closeFrameSent;
    this.reason = reason;
    this.code = code;
  }
}

/**
 * Class representing an open event.
 *
 * @extends Event
 * @private
 */
class OpenEvent extends Event {
  /**
   * Create a new `OpenEvent`.
   *
   * @param {WebSocket} target A reference to the target to which the event was dispatched
   */
  constructor (target) {
    super('open', target);
  }
}

/**
 * This provides methods for emulating the `EventTarget` interface. It's not
 * meant to be used directly.
 *
 * @mixin
 */
const EventTarget = {
  /**
   * Register an event listener.
   *
   * @param {String} method A string representing the event type to listen for
   * @param {Function} listener The listener to add
   * @public
   */
  addEventListener (method, listener) {
    if (typeof listener !== 'function') return;

    function onMessage (data) {
      listener.call(this, new MessageEvent(data, this));
    }

    function onClose (code, message) {
      listener.call(this, new CloseEvent(code, message, this));
    }

    function onError (event) {
      event.type = 'error';
      event.target = this;
      listener.call(this, event);
    }

    function onOpen () {
      listener.call(this, new OpenEvent(this));
    }

    if (method === 'message') {
      onMessage._listener = listener;
      this.on(method, onMessage);
    } else if (method === 'close') {
      onClose._listener = listener;
      this.on(method, onClose);
    } else if (method === 'error') {
      onError._listener = listener;
      this.on(method, onError);
    } else if (method === 'open') {
      onOpen._listener = listener;
      this.on(method, onOpen);
    } else {
      this.on(method, listener);
    }
  },

  /**
   * Remove an event listener.
   *
   * @param {String} method A string representing the event type to remove
   * @param {Function} listener The listener to remove
   * @public
   */
  removeEventListener (method, listener) {
    const listeners = this.listeners(method);

    for (var i = 0; i < listeners.length; i++) {
      if (listeners[i] === listener || listeners[i]._listener === listener) {
        this.removeListener(method, listeners[i]);
      }
    }
  }
};

var EventTarget_1 = EventTarget;

//
// Allowed token characters:
//
// '!', '#', '$', '%', '&', ''', '*', '+', '-',
// '.', 0-9, A-Z, '^', '_', '`', a-z, '|', '~'
//
// tokenChars[32] === 0 // ' '
// tokenChars[33] === 1 // '!'
// tokenChars[34] === 0 // '"'
// ...
//
const tokenChars = [
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, // 0 - 15
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, // 16 - 31
  0, 1, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 1, 1, 0, // 32 - 47
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, // 48 - 63
  0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, // 64 - 79
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, // 80 - 95
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, // 96 - 111
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0 // 112 - 127
];

/**
 * Adds an offer to the map of extension offers or a parameter to the map of
 * parameters.
 *
 * @param {Object} dest The map of extension offers or parameters
 * @param {String} name The extension or parameter name
 * @param {(Object|Boolean|String)} elem The extension parameters or the
 *     parameter value
 * @private
 */
function push (dest, name, elem) {
  if (Object.prototype.hasOwnProperty.call(dest, name)) dest[name].push(elem);
  else dest[name] = [elem];
}

/**
 * Parses the `Sec-WebSocket-Extensions` header into an object.
 *
 * @param {String} header The field value of the header
 * @return {Object} The parsed object
 * @public
 */
function parse (header) {
  const offers = {};

  if (header === undefined || header === '') return offers;

  var params = {};
  var mustUnescape = false;
  var isEscaping = false;
  var inQuotes = false;
  var extensionName;
  var paramName;
  var start = -1;
  var end = -1;

  for (var i = 0; i < header.length; i++) {
    const code = header.charCodeAt(i);

    if (extensionName === undefined) {
      if (end === -1 && tokenChars[code] === 1) {
        if (start === -1) start = i;
      } else if (code === 0x20/* ' ' */|| code === 0x09/* '\t' */) {
        if (end === -1 && start !== -1) end = i;
      } else if (code === 0x3b/* ';' */ || code === 0x2c/* ',' */) {
        if (start === -1) throw new Error(`unexpected character at index ${i}`);

        if (end === -1) end = i;
        const name = header.slice(start, end);
        if (code === 0x2c) {
          push(offers, name, params);
          params = {};
        } else {
          extensionName = name;
        }

        start = end = -1;
      } else {
        throw new Error(`unexpected character at index ${i}`);
      }
    } else if (paramName === undefined) {
      if (end === -1 && tokenChars[code] === 1) {
        if (start === -1) start = i;
      } else if (code === 0x20 || code === 0x09) {
        if (end === -1 && start !== -1) end = i;
      } else if (code === 0x3b || code === 0x2c) {
        if (start === -1) throw new Error(`unexpected character at index ${i}`);

        if (end === -1) end = i;
        push(params, header.slice(start, end), true);
        if (code === 0x2c) {
          push(offers, extensionName, params);
          params = {};
          extensionName = undefined;
        }

        start = end = -1;
      } else if (code === 0x3d/* '=' */&& start !== -1 && end === -1) {
        paramName = header.slice(start, i);
        start = end = -1;
      } else {
        throw new Error(`unexpected character at index ${i}`);
      }
    } else {
      //
      // The value of a quoted-string after unescaping must conform to the
      // token ABNF, so only token characters are valid.
      // Ref: https://tools.ietf.org/html/rfc6455#section-9.1
      //
      if (isEscaping) {
        if (tokenChars[code] !== 1) {
          throw new Error(`unexpected character at index ${i}`);
        }
        if (start === -1) start = i;
        else if (!mustUnescape) mustUnescape = true;
        isEscaping = false;
      } else if (inQuotes) {
        if (tokenChars[code] === 1) {
          if (start === -1) start = i;
        } else if (code === 0x22/* '"' */ && start !== -1) {
          inQuotes = false;
          end = i;
        } else if (code === 0x5c/* '\' */) {
          isEscaping = true;
        } else {
          throw new Error(`unexpected character at index ${i}`);
        }
      } else if (code === 0x22 && header.charCodeAt(i - 1) === 0x3d) {
        inQuotes = true;
      } else if (end === -1 && tokenChars[code] === 1) {
        if (start === -1) start = i;
      } else if (start !== -1 && (code === 0x20 || code === 0x09)) {
        if (end === -1) end = i;
      } else if (code === 0x3b || code === 0x2c) {
        if (start === -1) throw new Error(`unexpected character at index ${i}`);

        if (end === -1) end = i;
        var value = header.slice(start, end);
        if (mustUnescape) {
          value = value.replace(/\\/g, '');
          mustUnescape = false;
        }
        push(params, paramName, value);
        if (code === 0x2c) {
          push(offers, extensionName, params);
          params = {};
          extensionName = undefined;
        }

        paramName = undefined;
        start = end = -1;
      } else {
        throw new Error(`unexpected character at index ${i}`);
      }
    }
  }

  if (start === -1 || inQuotes) throw new Error('unexpected end of input');

  if (end === -1) end = i;
  const token = header.slice(start, end);
  if (extensionName === undefined) {
    push(offers, token, {});
  } else {
    if (paramName === undefined) {
      push(params, token, true);
    } else if (mustUnescape) {
      push(params, paramName, token.replace(/\\/g, ''));
    } else {
      push(params, paramName, token);
    }
    push(offers, extensionName, params);
  }

  return offers;
}

/**
 * Serializes a parsed `Sec-WebSocket-Extensions` header to a string.
 *
 * @param {Object} value The object to format
 * @return {String} A string representing the given value
 * @public
 */
function format (value) {
  return Object.keys(value).map((token) => {
    var paramsList = value[token];
    if (!Array.isArray(paramsList)) paramsList = [paramsList];
    return paramsList.map((params) => {
      return [token].concat(Object.keys(params).map((k) => {
        var p = params[k];
        if (!Array.isArray(p)) p = [p];
        return p.map((v) => v === true ? k : `${k}=${v}`).join('; ');
      })).join('; ');
    }).join(', ');
  }).join(', ');
}

var Extensions = { format, parse };

const Buffer$1 = safeBuffer.Buffer;

var BINARY_TYPES = ['nodebuffer', 'arraybuffer', 'fragments'];
var GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';
var EMPTY_BUFFER = Buffer$1.alloc(0);
var NOOP = () => {};

var Constants = {
	BINARY_TYPES: BINARY_TYPES,
	GUID: GUID,
	EMPTY_BUFFER: EMPTY_BUFFER,
	NOOP: NOOP
};

/*!
 * ws: a node.js websocket client
 * Copyright(c) 2011 Einar Otto Stangvik <einaros@gmail.com>
 * MIT Licensed
 */

var Validation = createCommonjsModule(function (module) {

try {
  const isValidUTF8 = require('utf-8-validate');

  module.exports = typeof isValidUTF8 === 'object'
    ? isValidUTF8.Validation.isValidUTF8 // utf-8-validate@<3.0.0
    : isValidUTF8;
} catch (e) /* istanbul ignore next */ {
  module.exports = () => true;
}
});

/*!
 * ws: a node.js websocket client
 * Copyright(c) 2011 Einar Otto Stangvik <einaros@gmail.com>
 * MIT Licensed
 */

var ErrorCodes = {
  isValidErrorCode: function (code) {
    return (code >= 1000 && code <= 1013 && code !== 1004 && code !== 1005 && code !== 1006) ||
      (code >= 3000 && code <= 4999);
  },
  1000: 'normal',
  1001: 'going away',
  1002: 'protocol error',
  1003: 'unsupported data',
  1004: 'reserved',
  1005: 'reserved for extensions',
  1006: 'reserved for extensions',
  1007: 'inconsistent or invalid data',
  1008: 'policy violation',
  1009: 'message too big',
  1010: 'extension handshake missing',
  1011: 'an unexpected condition prevented the request from being fulfilled',
  1012: 'service restart',
  1013: 'try again later'
};

/*!
 * ws: a node.js websocket client
 * Copyright(c) 2011 Einar Otto Stangvik <einaros@gmail.com>
 * MIT Licensed
 */









const Buffer$2 = safeBuffer.Buffer;

const GET_INFO = 0;
const GET_PAYLOAD_LENGTH_16 = 1;
const GET_PAYLOAD_LENGTH_64 = 2;
const GET_MASK = 3;
const GET_DATA = 4;
const INFLATING = 5;

/**
 * HyBi Receiver implementation.
 */
class Receiver {
  /**
   * Creates a Receiver instance.
   *
   * @param {Object} extensions An object containing the negotiated extensions
   * @param {Number} maxPayload The maximum allowed message length
   * @param {String} binaryType The type for binary data
   */
  constructor (extensions, maxPayload, binaryType) {
    this._binaryType = binaryType || Constants.BINARY_TYPES[0];
    this._extensions = extensions || {};
    this._maxPayload = maxPayload | 0;

    this._bufferedBytes = 0;
    this._buffers = [];

    this._compressed = false;
    this._payloadLength = 0;
    this._fragmented = 0;
    this._masked = false;
    this._fin = false;
    this._mask = null;
    this._opcode = 0;

    this._totalPayloadLength = 0;
    this._messageLength = 0;
    this._fragments = [];

    this._cleanupCallback = null;
    this._hadError = false;
    this._dead = false;
    this._loop = false;

    this.onmessage = null;
    this.onclose = null;
    this.onerror = null;
    this.onping = null;
    this.onpong = null;

    this._state = GET_INFO;
  }

  /**
   * Consumes bytes from the available buffered data.
   *
   * @param {Number} bytes The number of bytes to consume
   * @return {Buffer} Consumed bytes
   * @private
   */
  readBuffer (bytes) {
    var offset = 0;
    var dst;
    var l;

    this._bufferedBytes -= bytes;

    if (bytes === this._buffers[0].length) return this._buffers.shift();

    if (bytes < this._buffers[0].length) {
      dst = this._buffers[0].slice(0, bytes);
      this._buffers[0] = this._buffers[0].slice(bytes);
      return dst;
    }

    dst = Buffer$2.allocUnsafe(bytes);

    while (bytes > 0) {
      l = this._buffers[0].length;

      if (bytes >= l) {
        this._buffers[0].copy(dst, offset);
        offset += l;
        this._buffers.shift();
      } else {
        this._buffers[0].copy(dst, offset, 0, bytes);
        this._buffers[0] = this._buffers[0].slice(bytes);
      }

      bytes -= l;
    }

    return dst;
  }

  /**
   * Checks if the number of buffered bytes is bigger or equal than `n` and
   * calls `cleanup` if necessary.
   *
   * @param {Number} n The number of bytes to check against
   * @return {Boolean} `true` if `bufferedBytes >= n`, else `false`
   * @private
   */
  hasBufferedBytes (n) {
    if (this._bufferedBytes >= n) return true;

    this._loop = false;
    if (this._dead) this.cleanup(this._cleanupCallback);
    return false;
  }

  /**
   * Adds new data to the parser.
   *
   * @public
   */
  add (data) {
    if (this._dead) return;

    this._bufferedBytes += data.length;
    this._buffers.push(data);
    this.startLoop();
  }

  /**
   * Starts the parsing loop.
   *
   * @private
   */
  startLoop () {
    this._loop = true;

    while (this._loop) {
      switch (this._state) {
        case GET_INFO:
          this.getInfo();
          break;
        case GET_PAYLOAD_LENGTH_16:
          this.getPayloadLength16();
          break;
        case GET_PAYLOAD_LENGTH_64:
          this.getPayloadLength64();
          break;
        case GET_MASK:
          this.getMask();
          break;
        case GET_DATA:
          this.getData();
          break;
        default: // `INFLATING`
          this._loop = false;
      }
    }
  }

  /**
   * Reads the first two bytes of a frame.
   *
   * @private
   */
  getInfo () {
    if (!this.hasBufferedBytes(2)) return;

    const buf = this.readBuffer(2);

    if ((buf[0] & 0x30) !== 0x00) {
      this.error(new Error('RSV2 and RSV3 must be clear'), 1002);
      return;
    }

    const compressed = (buf[0] & 0x40) === 0x40;

    if (compressed && !this._extensions[PerMessageDeflate_1.extensionName]) {
      this.error(new Error('RSV1 must be clear'), 1002);
      return;
    }

    this._fin = (buf[0] & 0x80) === 0x80;
    this._opcode = buf[0] & 0x0f;
    this._payloadLength = buf[1] & 0x7f;

    if (this._opcode === 0x00) {
      if (compressed) {
        this.error(new Error('RSV1 must be clear'), 1002);
        return;
      }

      if (!this._fragmented) {
        this.error(new Error(`invalid opcode: ${this._opcode}`), 1002);
        return;
      } else {
        this._opcode = this._fragmented;
      }
    } else if (this._opcode === 0x01 || this._opcode === 0x02) {
      if (this._fragmented) {
        this.error(new Error(`invalid opcode: ${this._opcode}`), 1002);
        return;
      }

      this._compressed = compressed;
    } else if (this._opcode > 0x07 && this._opcode < 0x0b) {
      if (!this._fin) {
        this.error(new Error('FIN must be set'), 1002);
        return;
      }

      if (compressed) {
        this.error(new Error('RSV1 must be clear'), 1002);
        return;
      }

      if (this._payloadLength > 0x7d) {
        this.error(new Error('invalid payload length'), 1002);
        return;
      }
    } else {
      this.error(new Error(`invalid opcode: ${this._opcode}`), 1002);
      return;
    }

    if (!this._fin && !this._fragmented) this._fragmented = this._opcode;

    this._masked = (buf[1] & 0x80) === 0x80;

    if (this._payloadLength === 126) this._state = GET_PAYLOAD_LENGTH_16;
    else if (this._payloadLength === 127) this._state = GET_PAYLOAD_LENGTH_64;
    else this.haveLength();
  }

  /**
   * Gets extended payload length (7+16).
   *
   * @private
   */
  getPayloadLength16 () {
    if (!this.hasBufferedBytes(2)) return;

    this._payloadLength = this.readBuffer(2).readUInt16BE(0, true);
    this.haveLength();
  }

  /**
   * Gets extended payload length (7+64).
   *
   * @private
   */
  getPayloadLength64 () {
    if (!this.hasBufferedBytes(8)) return;

    const buf = this.readBuffer(8);
    const num = buf.readUInt32BE(0, true);

    //
    // The maximum safe integer in JavaScript is 2^53 - 1. An error is returned
    // if payload length is greater than this number.
    //
    if (num > Math.pow(2, 53 - 32) - 1) {
      this.error(new Error('max payload size exceeded'), 1009);
      return;
    }

    this._payloadLength = (num * Math.pow(2, 32)) + buf.readUInt32BE(4, true);
    this.haveLength();
  }

  /**
   * Payload length has been read.
   *
   * @private
   */
  haveLength () {
    if (this._opcode < 0x08 && this.maxPayloadExceeded(this._payloadLength)) {
      return;
    }

    if (this._masked) this._state = GET_MASK;
    else this._state = GET_DATA;
  }

  /**
   * Reads mask bytes.
   *
   * @private
   */
  getMask () {
    if (!this.hasBufferedBytes(4)) return;

    this._mask = this.readBuffer(4);
    this._state = GET_DATA;
  }

  /**
   * Reads data bytes.
   *
   * @private
   */
  getData () {
    var data = Constants.EMPTY_BUFFER;

    if (this._payloadLength) {
      if (!this.hasBufferedBytes(this._payloadLength)) return;

      data = this.readBuffer(this._payloadLength);
      if (this._masked) BufferUtil.unmask(data, this._mask);
    }

    if (this._opcode > 0x07) {
      this.controlMessage(data);
    } else if (this._compressed) {
      this._state = INFLATING;
      this.decompress(data);
    } else if (this.pushFragment(data)) {
      this.dataMessage();
    }
  }

  /**
   * Decompresses data.
   *
   * @param {Buffer} data Compressed data
   * @private
   */
  decompress (data) {
    const perMessageDeflate = this._extensions[PerMessageDeflate_1.extensionName];

    perMessageDeflate.decompress(data, this._fin, (err, buf) => {
      if (err) {
        this.error(err, err.closeCode === 1009 ? 1009 : 1007);
        return;
      }

      if (this.pushFragment(buf)) this.dataMessage();
      this.startLoop();
    });
  }

  /**
   * Handles a data message.
   *
   * @private
   */
  dataMessage () {
    if (this._fin) {
      const messageLength = this._messageLength;
      const fragments = this._fragments;

      this._totalPayloadLength = 0;
      this._messageLength = 0;
      this._fragmented = 0;
      this._fragments = [];

      if (this._opcode === 2) {
        var data;

        if (this._binaryType === 'nodebuffer') {
          data = toBuffer(fragments, messageLength);
        } else if (this._binaryType === 'arraybuffer') {
          data = toArrayBuffer(toBuffer(fragments, messageLength));
        } else {
          data = fragments;
        }

        this.onmessage(data);
      } else {
        const buf = toBuffer(fragments, messageLength);

        if (!Validation(buf)) {
          this.error(new Error('invalid utf8 sequence'), 1007);
          return;
        }

        this.onmessage(buf.toString());
      }
    }

    this._state = GET_INFO;
  }

  /**
   * Handles a control message.
   *
   * @param {Buffer} data Data to handle
   * @private
   */
  controlMessage (data) {
    if (this._opcode === 0x08) {
      if (data.length === 0) {
        this.onclose(1000, '');
        this._loop = false;
        this.cleanup(this._cleanupCallback);
      } else if (data.length === 1) {
        this.error(new Error('invalid payload length'), 1002);
      } else {
        const code = data.readUInt16BE(0, true);

        if (!ErrorCodes.isValidErrorCode(code)) {
          this.error(new Error(`invalid status code: ${code}`), 1002);
          return;
        }

        const buf = data.slice(2);

        if (!Validation(buf)) {
          this.error(new Error('invalid utf8 sequence'), 1007);
          return;
        }

        this.onclose(code, buf.toString());
        this._loop = false;
        this.cleanup(this._cleanupCallback);
      }

      return;
    }

    if (this._opcode === 0x09) this.onping(data);
    else this.onpong(data);

    this._state = GET_INFO;
  }

  /**
   * Handles an error.
   *
   * @param {Error} err The error
   * @param {Number} code Close code
   * @private
   */
  error (err, code) {
    this.onerror(err, code);
    this._hadError = true;
    this._loop = false;
    this.cleanup(this._cleanupCallback);
  }

  /**
   * Checks payload size, disconnects socket when it exceeds `maxPayload`.
   *
   * @param {Number} length Payload length
   * @private
   */
  maxPayloadExceeded (length) {
    if (length === 0 || this._maxPayload < 1) return false;

    const fullLength = this._totalPayloadLength + length;

    if (fullLength <= this._maxPayload) {
      this._totalPayloadLength = fullLength;
      return false;
    }

    this.error(new Error('max payload size exceeded'), 1009);
    return true;
  }

  /**
   * Appends a fragment in the fragments array after checking that the sum of
   * fragment lengths does not exceed `maxPayload`.
   *
   * @param {Buffer} fragment The fragment to add
   * @return {Boolean} `true` if `maxPayload` is not exceeded, else `false`
   * @private
   */
  pushFragment (fragment) {
    if (fragment.length === 0) return true;

    const totalLength = this._messageLength + fragment.length;

    if (this._maxPayload < 1 || totalLength <= this._maxPayload) {
      this._messageLength = totalLength;
      this._fragments.push(fragment);
      return true;
    }

    this.error(new Error('max payload size exceeded'), 1009);
    return false;
  }

  /**
   * Releases resources used by the receiver.
   *
   * @param {Function} cb Callback
   * @public
   */
  cleanup (cb) {
    this._dead = true;

    if (!this._hadError && (this._loop || this._state === INFLATING)) {
      this._cleanupCallback = cb;
    } else {
      this._extensions = null;
      this._fragments = null;
      this._buffers = null;
      this._mask = null;

      this._cleanupCallback = null;
      this.onmessage = null;
      this.onclose = null;
      this.onerror = null;
      this.onping = null;
      this.onpong = null;

      if (cb) cb();
    }
  }
}

var Receiver_1 = Receiver;

/**
 * Makes a buffer from a list of fragments.
 *
 * @param {Buffer[]} fragments The list of fragments composing the message
 * @param {Number} messageLength The length of the message
 * @return {Buffer}
 * @private
 */
function toBuffer (fragments, messageLength) {
  if (fragments.length === 1) return fragments[0];
  if (fragments.length > 1) return BufferUtil.concat(fragments, messageLength);
  return Constants.EMPTY_BUFFER;
}

/**
 * Converts a buffer to an `ArrayBuffer`.
 *
 * @param {Buffer} The buffer to convert
 * @return {ArrayBuffer} Converted buffer
 */
function toArrayBuffer (buf) {
  if (buf.byteOffset === 0 && buf.byteLength === buf.buffer.byteLength) {
    return buf.buffer;
  }

  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
}

/*!
 * ws: a node.js websocket client
 * Copyright(c) 2011 Einar Otto Stangvik <einaros@gmail.com>
 * MIT Licensed
 */









const Buffer$3 = safeBuffer.Buffer;

/**
 * HyBi Sender implementation.
 */
class Sender {
  /**
   * Creates a Sender instance.
   *
   * @param {net.Socket} socket The connection socket
   * @param {Object} extensions An object containing the negotiated extensions
   */
  constructor (socket, extensions) {
    this._extensions = extensions || {};
    this._socket = socket;

    this._firstFragment = true;
    this._compress = false;

    this._bufferedBytes = 0;
    this._deflating = false;
    this._queue = [];
  }

  /**
   * Frames a piece of data according to the HyBi WebSocket protocol.
   *
   * @param {Buffer} data The data to frame
   * @param {Object} options Options object
   * @param {Number} options.opcode The opcode
   * @param {Boolean} options.readOnly Specifies whether `data` can be modified
   * @param {Boolean} options.fin Specifies whether or not to set the FIN bit
   * @param {Boolean} options.mask Specifies whether or not to mask `data`
   * @param {Boolean} options.rsv1 Specifies whether or not to set the RSV1 bit
   * @return {Buffer[]} The framed data as a list of `Buffer` instances
   * @public
   */
  static frame (data, options) {
    const merge = data.length < 1024 || (options.mask && options.readOnly);
    var offset = options.mask ? 6 : 2;
    var payloadLength = data.length;

    if (data.length >= 65536) {
      offset += 8;
      payloadLength = 127;
    } else if (data.length > 125) {
      offset += 2;
      payloadLength = 126;
    }

    const target = Buffer$3.allocUnsafe(merge ? data.length + offset : offset);

    target[0] = options.fin ? options.opcode | 0x80 : options.opcode;
    if (options.rsv1) target[0] |= 0x40;

    if (payloadLength === 126) {
      target.writeUInt16BE(data.length, 2, true);
    } else if (payloadLength === 127) {
      target.writeUInt32BE(0, 2, true);
      target.writeUInt32BE(data.length, 6, true);
    }

    if (!options.mask) {
      target[1] = payloadLength;
      if (merge) {
        data.copy(target, offset);
        return [target];
      }

      return [target, data];
    }

    const mask = crypto__default['default'].randomBytes(4);

    target[1] = payloadLength | 0x80;
    target[offset - 4] = mask[0];
    target[offset - 3] = mask[1];
    target[offset - 2] = mask[2];
    target[offset - 1] = mask[3];

    if (merge) {
      BufferUtil.mask(data, mask, target, offset, data.length);
      return [target];
    }

    BufferUtil.mask(data, mask, data, 0, data.length);
    return [target, data];
  }

  /**
   * Sends a close message to the other peer.
   *
   * @param {(Number|undefined)} code The status code component of the body
   * @param {String} data The message component of the body
   * @param {Boolean} mask Specifies whether or not to mask the message
   * @param {Function} cb Callback
   * @public
   */
  close (code, data, mask, cb) {
    var buf;

    if (code === undefined) {
      code = 1000;
    } else if (typeof code !== 'number' || !ErrorCodes.isValidErrorCode(code)) {
      throw new Error('first argument must be a valid error code number');
    }

    if (data === undefined || data === '') {
      if (code === 1000) {
        buf = Constants.EMPTY_BUFFER;
      } else {
        buf = Buffer$3.allocUnsafe(2);
        buf.writeUInt16BE(code, 0, true);
      }
    } else {
      buf = Buffer$3.allocUnsafe(2 + Buffer$3.byteLength(data));
      buf.writeUInt16BE(code, 0, true);
      buf.write(data, 2);
    }

    if (this._deflating) {
      this.enqueue([this.doClose, buf, mask, cb]);
    } else {
      this.doClose(buf, mask, cb);
    }
  }

  /**
   * Frames and sends a close message.
   *
   * @param {Buffer} data The message to send
   * @param {Boolean} mask Specifies whether or not to mask `data`
   * @param {Function} cb Callback
   * @private
   */
  doClose (data, mask, cb) {
    this.sendFrame(Sender.frame(data, {
      fin: true,
      rsv1: false,
      opcode: 0x08,
      mask,
      readOnly: false
    }), cb);
  }

  /**
   * Sends a ping message to the other peer.
   *
   * @param {*} data The message to send
   * @param {Boolean} mask Specifies whether or not to mask `data`
   * @public
   */
  ping (data, mask) {
    var readOnly = true;

    if (!Buffer$3.isBuffer(data)) {
      if (data instanceof ArrayBuffer) {
        data = Buffer$3.from(data);
      } else if (ArrayBuffer.isView(data)) {
        data = viewToBuffer(data);
      } else {
        data = Buffer$3.from(data);
        readOnly = false;
      }
    }

    if (this._deflating) {
      this.enqueue([this.doPing, data, mask, readOnly]);
    } else {
      this.doPing(data, mask, readOnly);
    }
  }

  /**
   * Frames and sends a ping message.
   *
   * @param {*} data The message to send
   * @param {Boolean} mask Specifies whether or not to mask `data`
   * @param {Boolean} readOnly Specifies whether `data` can be modified
   * @private
   */
  doPing (data, mask, readOnly) {
    this.sendFrame(Sender.frame(data, {
      fin: true,
      rsv1: false,
      opcode: 0x09,
      mask,
      readOnly
    }));
  }

  /**
   * Sends a pong message to the other peer.
   *
   * @param {*} data The message to send
   * @param {Boolean} mask Specifies whether or not to mask `data`
   * @public
   */
  pong (data, mask) {
    var readOnly = true;

    if (!Buffer$3.isBuffer(data)) {
      if (data instanceof ArrayBuffer) {
        data = Buffer$3.from(data);
      } else if (ArrayBuffer.isView(data)) {
        data = viewToBuffer(data);
      } else {
        data = Buffer$3.from(data);
        readOnly = false;
      }
    }

    if (this._deflating) {
      this.enqueue([this.doPong, data, mask, readOnly]);
    } else {
      this.doPong(data, mask, readOnly);
    }
  }

  /**
   * Frames and sends a pong message.
   *
   * @param {*} data The message to send
   * @param {Boolean} mask Specifies whether or not to mask `data`
   * @param {Boolean} readOnly Specifies whether `data` can be modified
   * @private
   */
  doPong (data, mask, readOnly) {
    this.sendFrame(Sender.frame(data, {
      fin: true,
      rsv1: false,
      opcode: 0x0a,
      mask,
      readOnly
    }));
  }

  /**
   * Sends a data message to the other peer.
   *
   * @param {*} data The message to send
   * @param {Object} options Options object
   * @param {Boolean} options.compress Specifies whether or not to compress `data`
   * @param {Boolean} options.binary Specifies whether `data` is binary or text
   * @param {Boolean} options.fin Specifies whether the fragment is the last one
   * @param {Boolean} options.mask Specifies whether or not to mask `data`
   * @param {Function} cb Callback
   * @public
   */
  send (data, options, cb) {
    var opcode = options.binary ? 2 : 1;
    var rsv1 = options.compress;
    var readOnly = true;

    if (!Buffer$3.isBuffer(data)) {
      if (data instanceof ArrayBuffer) {
        data = Buffer$3.from(data);
      } else if (ArrayBuffer.isView(data)) {
        data = viewToBuffer(data);
      } else {
        data = Buffer$3.from(data);
        readOnly = false;
      }
    }

    const perMessageDeflate = this._extensions[PerMessageDeflate_1.extensionName];

    if (this._firstFragment) {
      this._firstFragment = false;
      if (rsv1 && perMessageDeflate) {
        rsv1 = data.length >= perMessageDeflate._threshold;
      }
      this._compress = rsv1;
    } else {
      rsv1 = false;
      opcode = 0;
    }

    if (options.fin) this._firstFragment = true;

    if (perMessageDeflate) {
      const opts = {
        fin: options.fin,
        rsv1,
        opcode,
        mask: options.mask,
        readOnly
      };

      if (this._deflating) {
        this.enqueue([this.dispatch, data, this._compress, opts, cb]);
      } else {
        this.dispatch(data, this._compress, opts, cb);
      }
    } else {
      this.sendFrame(Sender.frame(data, {
        fin: options.fin,
        rsv1: false,
        opcode,
        mask: options.mask,
        readOnly
      }), cb);
    }
  }

  /**
   * Dispatches a data message.
   *
   * @param {Buffer} data The message to send
   * @param {Boolean} compress Specifies whether or not to compress `data`
   * @param {Object} options Options object
   * @param {Number} options.opcode The opcode
   * @param {Boolean} options.readOnly Specifies whether `data` can be modified
   * @param {Boolean} options.fin Specifies whether or not to set the FIN bit
   * @param {Boolean} options.mask Specifies whether or not to mask `data`
   * @param {Boolean} options.rsv1 Specifies whether or not to set the RSV1 bit
   * @param {Function} cb Callback
   * @private
   */
  dispatch (data, compress, options, cb) {
    if (!compress) {
      this.sendFrame(Sender.frame(data, options), cb);
      return;
    }

    const perMessageDeflate = this._extensions[PerMessageDeflate_1.extensionName];

    this._deflating = true;
    perMessageDeflate.compress(data, options.fin, (_, buf) => {
      options.readOnly = false;
      this.sendFrame(Sender.frame(buf, options), cb);
      this._deflating = false;
      this.dequeue();
    });
  }

  /**
   * Executes queued send operations.
   *
   * @private
   */
  dequeue () {
    while (!this._deflating && this._queue.length) {
      const params = this._queue.shift();

      this._bufferedBytes -= params[1].length;
      params[0].apply(this, params.slice(1));
    }
  }

  /**
   * Enqueues a send operation.
   *
   * @param {Array} params Send operation parameters.
   * @private
   */
  enqueue (params) {
    this._bufferedBytes += params[1].length;
    this._queue.push(params);
  }

  /**
   * Sends a frame.
   *
   * @param {Buffer[]} list The frame to send
   * @param {Function} cb Callback
   * @private
   */
  sendFrame (list, cb) {
    if (list.length === 2) {
      this._socket.write(list[0]);
      this._socket.write(list[1], cb);
    } else {
      this._socket.write(list[0], cb);
    }
  }
}

var Sender_1 = Sender;

/**
 * Converts an `ArrayBuffer` view into a buffer.
 *
 * @param {(DataView|TypedArray)} view The view to convert
 * @return {Buffer} Converted view
 * @private
 */
function viewToBuffer (view) {
  const buf = Buffer$3.from(view.buffer);

  if (view.byteLength !== view.buffer.byteLength) {
    return buf.slice(view.byteOffset, view.byteOffset + view.byteLength);
  }

  return buf;
}

/*!
 * ws: a node.js websocket client
 * Copyright(c) 2011 Einar Otto Stangvik <einaros@gmail.com>
 * MIT Licensed
 */















const protocolVersions = [8, 13];
const closeTimeout = 30 * 1000; // Allow 30 seconds to terminate the connection cleanly.

/**
 * Class representing a WebSocket.
 *
 * @extends EventEmitter
 */
class WebSocket extends EventEmitter__default['default'] {
  /**
   * Create a new `WebSocket`.
   *
   * @param {String} address The URL to which to connect
   * @param {(String|String[])} protocols The subprotocols
   * @param {Object} options Connection options
   */
  constructor (address, protocols, options) {
    super();

    if (!protocols) {
      protocols = [];
    } else if (typeof protocols === 'string') {
      protocols = [protocols];
    } else if (!Array.isArray(protocols)) {
      options = protocols;
      protocols = [];
    }

    this.readyState = WebSocket.CONNECTING;
    this.bytesReceived = 0;
    this.extensions = {};
    this.protocol = '';

    this._binaryType = Constants.BINARY_TYPES[0];
    this._finalize = this.finalize.bind(this);
    this._closeFrameReceived = false;
    this._closeFrameSent = false;
    this._closeMessage = '';
    this._closeTimer = null;
    this._finalized = false;
    this._closeCode = 1006;
    this._receiver = null;
    this._sender = null;
    this._socket = null;
    this._ultron = null;

    if (Array.isArray(address)) {
      initAsServerClient.call(this, address[0], address[1], options);
    } else {
      initAsClient.call(this, address, protocols, options);
    }
  }

  get CONNECTING () { return WebSocket.CONNECTING; }
  get CLOSING () { return WebSocket.CLOSING; }
  get CLOSED () { return WebSocket.CLOSED; }
  get OPEN () { return WebSocket.OPEN; }

  /**
   * @type {Number}
   */
  get bufferedAmount () {
    var amount = 0;

    if (this._socket) {
      amount = this._socket.bufferSize + this._sender._bufferedBytes;
    }
    return amount;
  }

  /**
   * This deviates from the WHATWG interface since ws doesn't support the required
   * default "blob" type (instead we define a custom "nodebuffer" type).
   *
   * @type {String}
   */
  get binaryType () {
    return this._binaryType;
  }

  set binaryType (type) {
    if (Constants.BINARY_TYPES.indexOf(type) < 0) return;

    this._binaryType = type;

    //
    // Allow to change `binaryType` on the fly.
    //
    if (this._receiver) this._receiver._binaryType = type;
  }

  /**
   * Set up the socket and the internal resources.
   *
   * @param {net.Socket} socket The network socket between the server and client
   * @param {Buffer} head The first packet of the upgraded stream
   * @private
   */
  setSocket (socket, head) {
    socket.setTimeout(0);
    socket.setNoDelay();

    this._receiver = new Receiver_1(this.extensions, this._maxPayload, this.binaryType);
    this._sender = new Sender_1(socket, this.extensions);
    this._ultron = new ultron(socket);
    this._socket = socket;

    this._ultron.on('close', this._finalize);
    this._ultron.on('error', this._finalize);
    this._ultron.on('end', this._finalize);

    if (head.length > 0) socket.unshift(head);

    this._ultron.on('data', (data) => {
      this.bytesReceived += data.length;
      this._receiver.add(data);
    });

    this._receiver.onmessage = (data) => this.emit('message', data);
    this._receiver.onping = (data) => {
      this.pong(data, !this._isServer, true);
      this.emit('ping', data);
    };
    this._receiver.onpong = (data) => this.emit('pong', data);
    this._receiver.onclose = (code, reason) => {
      this._closeFrameReceived = true;
      this._closeMessage = reason;
      this._closeCode = code;
      if (!this._finalized) this.close(code, reason);
    };
    this._receiver.onerror = (error, code) => {
      this._closeMessage = '';
      this._closeCode = code;

      //
      // Ensure that the error is emitted even if `WebSocket#finalize()` has
      // already been called.
      //
      this.readyState = WebSocket.CLOSING;
      this.emit('error', error);
      this.finalize(true);
    };

    this.readyState = WebSocket.OPEN;
    this.emit('open');
  }

  /**
   * Clean up and release internal resources.
   *
   * @param {(Boolean|Error)} error Indicates whether or not an error occurred
   * @private
   */
  finalize (error) {
    if (this._finalized) return;

    this.readyState = WebSocket.CLOSING;
    this._finalized = true;

    if (typeof error === 'object') this.emit('error', error);
    if (!this._socket) return this.emitClose();

    clearTimeout(this._closeTimer);
    this._closeTimer = null;

    this._ultron.destroy();
    this._ultron = null;

    this._socket.on('error', Constants.NOOP);

    if (!error) this._socket.end();
    else this._socket.destroy();

    this._socket = null;
    this._sender = null;

    this._receiver.cleanup(() => this.emitClose());
    this._receiver = null;
  }

  /**
   * Emit the `close` event.
   *
   * @private
   */
  emitClose () {
    this.readyState = WebSocket.CLOSED;

    this.emit('close', this._closeCode, this._closeMessage);

    if (this.extensions[PerMessageDeflate_1.extensionName]) {
      this.extensions[PerMessageDeflate_1.extensionName].cleanup();
    }

    this.extensions = null;

    this.removeAllListeners();
  }

  /**
   * Pause the socket stream.
   *
   * @public
   */
  pause () {
    if (this.readyState !== WebSocket.OPEN) throw new Error('not opened');

    this._socket.pause();
  }

  /**
   * Resume the socket stream
   *
   * @public
   */
  resume () {
    if (this.readyState !== WebSocket.OPEN) throw new Error('not opened');

    this._socket.resume();
  }

  /**
   * Start a closing handshake.
   *
   *            +----------+     +-----------+   +----------+
   *     + - - -|ws.close()|---->|close frame|-->|ws.close()|- - - -
   *            +----------+     +-----------+   +----------+       |
   *     |      +----------+     +-----------+         |
   *            |ws.close()|<----|close frame|<--------+            |
   *            +----------+     +-----------+         |
   *  CLOSING         |              +---+             |         CLOSING
   *                  |          +---|fin|<------------+
   *     |            |          |   +---+                          |
   *                  |          |   +---+      +-------------+
   *     |            +----------+-->|fin|----->|ws.finalize()| - - +
   *                             |   +---+      +-------------+
   *     |     +-------------+   |
   *      - - -|ws.finalize()|<--+
   *           +-------------+
   *
   * @param {Number} code Status code explaining why the connection is closing
   * @param {String} data A string explaining why the connection is closing
   * @public
   */
  close (code, data) {
    if (this.readyState === WebSocket.CLOSED) return;
    if (this.readyState === WebSocket.CONNECTING) {
      this._req.abort();
      this.finalize(new Error('closed before the connection is established'));
      return;
    }

    if (this.readyState === WebSocket.CLOSING) {
      if (this._closeFrameSent && this._closeFrameReceived) this._socket.end();
      return;
    }

    this.readyState = WebSocket.CLOSING;
    this._sender.close(code, data, !this._isServer, (err) => {
      //
      // This error is handled by the `'error'` listener on the socket. We only
      // want to know if the close frame has been sent here.
      //
      if (err) return;

      this._closeFrameSent = true;

      if (!this._finalized) {
        if (this._closeFrameReceived) this._socket.end();

        //
        // Ensure that the connection is cleaned up even when the closing
        // handshake fails.
        //
        this._closeTimer = setTimeout(this._finalize, closeTimeout, true);
      }
    });
  }

  /**
   * Send a ping message.
   *
   * @param {*} data The message to send
   * @param {Boolean} mask Indicates whether or not to mask `data`
   * @param {Boolean} failSilently Indicates whether or not to throw if `readyState` isn't `OPEN`
   * @public
   */
  ping (data, mask, failSilently) {
    if (this.readyState !== WebSocket.OPEN) {
      if (failSilently) return;
      throw new Error('not opened');
    }

    if (typeof data === 'number') data = data.toString();
    if (mask === undefined) mask = !this._isServer;
    this._sender.ping(data || Constants.EMPTY_BUFFER, mask);
  }

  /**
   * Send a pong message.
   *
   * @param {*} data The message to send
   * @param {Boolean} mask Indicates whether or not to mask `data`
   * @param {Boolean} failSilently Indicates whether or not to throw if `readyState` isn't `OPEN`
   * @public
   */
  pong (data, mask, failSilently) {
    if (this.readyState !== WebSocket.OPEN) {
      if (failSilently) return;
      throw new Error('not opened');
    }

    if (typeof data === 'number') data = data.toString();
    if (mask === undefined) mask = !this._isServer;
    this._sender.pong(data || Constants.EMPTY_BUFFER, mask);
  }

  /**
   * Send a data message.
   *
   * @param {*} data The message to send
   * @param {Object} options Options object
   * @param {Boolean} options.compress Specifies whether or not to compress `data`
   * @param {Boolean} options.binary Specifies whether `data` is binary or text
   * @param {Boolean} options.fin Specifies whether the fragment is the last one
   * @param {Boolean} options.mask Specifies whether or not to mask `data`
   * @param {Function} cb Callback which is executed when data is written out
   * @public
   */
  send (data, options, cb) {
    if (typeof options === 'function') {
      cb = options;
      options = {};
    }

    if (this.readyState !== WebSocket.OPEN) {
      if (cb) cb(new Error('not opened'));
      else throw new Error('not opened');
      return;
    }

    if (typeof data === 'number') data = data.toString();

    const opts = Object.assign({
      binary: typeof data !== 'string',
      mask: !this._isServer,
      compress: true,
      fin: true
    }, options);

    if (!this.extensions[PerMessageDeflate_1.extensionName]) {
      opts.compress = false;
    }

    this._sender.send(data || Constants.EMPTY_BUFFER, opts, cb);
  }

  /**
   * Forcibly close the connection.
   *
   * @public
   */
  terminate () {
    if (this.readyState === WebSocket.CLOSED) return;
    if (this.readyState === WebSocket.CONNECTING) {
      this._req.abort();
      this.finalize(new Error('closed before the connection is established'));
      return;
    }

    this.finalize(true);
  }
}

WebSocket.CONNECTING = 0;
WebSocket.OPEN = 1;
WebSocket.CLOSING = 2;
WebSocket.CLOSED = 3;

//
// Add the `onopen`, `onerror`, `onclose`, and `onmessage` attributes.
// See https://html.spec.whatwg.org/multipage/comms.html#the-websocket-interface
//
['open', 'error', 'close', 'message'].forEach((method) => {
  Object.defineProperty(WebSocket.prototype, `on${method}`, {
    /**
     * Return the listener of the event.
     *
     * @return {(Function|undefined)} The event listener or `undefined`
     * @public
     */
    get () {
      const listeners = this.listeners(method);
      for (var i = 0; i < listeners.length; i++) {
        if (listeners[i]._listener) return listeners[i]._listener;
      }
    },
    /**
     * Add a listener for the event.
     *
     * @param {Function} listener The listener to add
     * @public
     */
    set (listener) {
      const listeners = this.listeners(method);
      for (var i = 0; i < listeners.length; i++) {
        //
        // Remove only the listeners added via `addEventListener`.
        //
        if (listeners[i]._listener) this.removeListener(method, listeners[i]);
      }
      this.addEventListener(method, listener);
    }
  });
});

WebSocket.prototype.addEventListener = EventTarget_1.addEventListener;
WebSocket.prototype.removeEventListener = EventTarget_1.removeEventListener;

var WebSocket_1 = WebSocket;

/**
 * Initialize a WebSocket server client.
 *
 * @param {http.IncomingMessage} req The request object
 * @param {net.Socket} socket The network socket between the server and client
 * @param {Buffer} head The first packet of the upgraded stream
 * @param {Object} options WebSocket attributes
 * @param {Number} options.protocolVersion The WebSocket protocol version
 * @param {Object} options.extensions The negotiated extensions
 * @param {Number} options.maxPayload The maximum allowed message size
 * @param {String} options.protocol The chosen subprotocol
 * @private
 */
function initAsServerClient (socket, head, options) {
  this.protocolVersion = options.protocolVersion;
  this._maxPayload = options.maxPayload;
  this.extensions = options.extensions;
  this.protocol = options.protocol;

  this._isServer = true;

  this.setSocket(socket, head);
}

/**
 * Initialize a WebSocket client.
 *
 * @param {String} address The URL to which to connect
 * @param {String[]} protocols The list of subprotocols
 * @param {Object} options Connection options
 * @param {String} options.protocol Value of the `Sec-WebSocket-Protocol` header
 * @param {(Boolean|Object)} options.perMessageDeflate Enable/disable permessage-deflate
 * @param {Number} options.handshakeTimeout Timeout in milliseconds for the handshake request
 * @param {String} options.localAddress Local interface to bind for network connections
 * @param {Number} options.protocolVersion Value of the `Sec-WebSocket-Version` header
 * @param {Object} options.headers An object containing request headers
 * @param {String} options.origin Value of the `Origin` or `Sec-WebSocket-Origin` header
 * @param {http.Agent} options.agent Use the specified Agent
 * @param {String} options.host Value of the `Host` header
 * @param {Number} options.family IP address family to use during hostname lookup (4 or 6).
 * @param {Function} options.checkServerIdentity A function to validate the server hostname
 * @param {Boolean} options.rejectUnauthorized Verify or not the server certificate
 * @param {String} options.passphrase The passphrase for the private key or pfx
 * @param {String} options.ciphers The ciphers to use or exclude
 * @param {String} options.ecdhCurve The curves for ECDH key agreement to use or exclude
 * @param {(String|String[]|Buffer|Buffer[])} options.cert The certificate key
 * @param {(String|String[]|Buffer|Buffer[])} options.key The private key
 * @param {(String|Buffer)} options.pfx The private key, certificate, and CA certs
 * @param {(String|String[]|Buffer|Buffer[])} options.ca Trusted certificates
 * @private
 */
function initAsClient (address, protocols, options) {
  options = Object.assign({
    protocolVersion: protocolVersions[1],
    protocol: protocols.join(','),
    perMessageDeflate: true,
    handshakeTimeout: null,
    localAddress: null,
    headers: null,
    family: null,
    origin: null,
    agent: null,
    host: null,

    //
    // SSL options.
    //
    checkServerIdentity: null,
    rejectUnauthorized: null,
    passphrase: null,
    ciphers: null,
    ecdhCurve: null,
    cert: null,
    key: null,
    pfx: null,
    ca: null
  }, options);

  if (protocolVersions.indexOf(options.protocolVersion) === -1) {
    throw new Error(
      `unsupported protocol version: ${options.protocolVersion} ` +
      `(supported versions: ${protocolVersions.join(', ')})`
    );
  }

  this.protocolVersion = options.protocolVersion;
  this._isServer = false;
  this.url = address;

  const serverUrl = url__default['default'].parse(address);
  const isUnixSocket = serverUrl.protocol === 'ws+unix:';

  if (!serverUrl.host && (!isUnixSocket || !serverUrl.path)) {
    throw new Error('invalid url');
  }

  const isSecure = serverUrl.protocol === 'wss:' || serverUrl.protocol === 'https:';
  const key = crypto__default['default'].randomBytes(16).toString('base64');
  const httpObj = isSecure ? https__default['default'] : http__default['default'];
  var perMessageDeflate;

  const requestOptions = {
    port: serverUrl.port || (isSecure ? 443 : 80),
    host: serverUrl.hostname,
    path: '/',
    headers: {
      'Sec-WebSocket-Version': options.protocolVersion,
      'Sec-WebSocket-Key': key,
      'Connection': 'Upgrade',
      'Upgrade': 'websocket'
    }
  };

  if (options.headers) Object.assign(requestOptions.headers, options.headers);
  if (options.perMessageDeflate) {
    perMessageDeflate = new PerMessageDeflate_1(
      options.perMessageDeflate !== true ? options.perMessageDeflate : {},
      false
    );
    requestOptions.headers['Sec-WebSocket-Extensions'] = Extensions.format({
      [PerMessageDeflate_1.extensionName]: perMessageDeflate.offer()
    });
  }
  if (options.protocol) {
    requestOptions.headers['Sec-WebSocket-Protocol'] = options.protocol;
  }
  if (options.origin) {
    if (options.protocolVersion < 13) {
      requestOptions.headers['Sec-WebSocket-Origin'] = options.origin;
    } else {
      requestOptions.headers.Origin = options.origin;
    }
  }
  if (options.host) requestOptions.headers.Host = options.host;
  if (serverUrl.auth) requestOptions.auth = serverUrl.auth;

  if (options.localAddress) requestOptions.localAddress = options.localAddress;
  if (options.family) requestOptions.family = options.family;

  if (isUnixSocket) {
    const parts = serverUrl.path.split(':');

    requestOptions.socketPath = parts[0];
    requestOptions.path = parts[1];
  } else if (serverUrl.path) {
    //
    // Make sure that path starts with `/`.
    //
    if (serverUrl.path.charAt(0) !== '/') {
      requestOptions.path = `/${serverUrl.path}`;
    } else {
      requestOptions.path = serverUrl.path;
    }
  }

  var agent = options.agent;

  //
  // A custom agent is required for these options.
  //
  if (
    options.rejectUnauthorized != null ||
    options.checkServerIdentity ||
    options.passphrase ||
    options.ciphers ||
    options.ecdhCurve ||
    options.cert ||
    options.key ||
    options.pfx ||
    options.ca
  ) {
    if (options.passphrase) requestOptions.passphrase = options.passphrase;
    if (options.ciphers) requestOptions.ciphers = options.ciphers;
    if (options.ecdhCurve) requestOptions.ecdhCurve = options.ecdhCurve;
    if (options.cert) requestOptions.cert = options.cert;
    if (options.key) requestOptions.key = options.key;
    if (options.pfx) requestOptions.pfx = options.pfx;
    if (options.ca) requestOptions.ca = options.ca;
    if (options.checkServerIdentity) {
      requestOptions.checkServerIdentity = options.checkServerIdentity;
    }
    if (options.rejectUnauthorized != null) {
      requestOptions.rejectUnauthorized = options.rejectUnauthorized;
    }

    if (!agent) agent = new httpObj.Agent(requestOptions);
  }

  if (agent) requestOptions.agent = agent;

  this._req = httpObj.get(requestOptions);

  if (options.handshakeTimeout) {
    this._req.setTimeout(options.handshakeTimeout, () => {
      this._req.abort();
      this.finalize(new Error('opening handshake has timed out'));
    });
  }

  this._req.on('error', (error) => {
    if (this._req.aborted) return;

    this._req = null;
    this.finalize(error);
  });

  this._req.on('response', (res) => {
    if (!this.emit('unexpected-response', this._req, res)) {
      this._req.abort();
      this.finalize(new Error(`unexpected server response (${res.statusCode})`));
    }
  });

  this._req.on('upgrade', (res, socket, head) => {
    this.emit('headers', res.headers, res);

    //
    // The user may have closed the connection from a listener of the `headers`
    // event.
    //
    if (this.readyState !== WebSocket.CONNECTING) return;

    this._req = null;

    const digest = crypto__default['default'].createHash('sha1')
      .update(key + Constants.GUID, 'binary')
      .digest('base64');

    if (res.headers['sec-websocket-accept'] !== digest) {
      socket.destroy();
      return this.finalize(new Error('invalid server key'));
    }

    const serverProt = res.headers['sec-websocket-protocol'];
    const protList = (options.protocol || '').split(/, */);
    var protError;

    if (!options.protocol && serverProt) {
      protError = 'server sent a subprotocol even though none requested';
    } else if (options.protocol && !serverProt) {
      protError = 'server sent no subprotocol even though requested';
    } else if (serverProt && protList.indexOf(serverProt) === -1) {
      protError = 'server responded with an invalid protocol';
    }

    if (protError) {
      socket.destroy();
      return this.finalize(new Error(protError));
    }

    if (serverProt) this.protocol = serverProt;

    if (perMessageDeflate) {
      try {
        const serverExtensions = Extensions.parse(
          res.headers['sec-websocket-extensions']
        );

        if (serverExtensions[PerMessageDeflate_1.extensionName]) {
          perMessageDeflate.accept(
            serverExtensions[PerMessageDeflate_1.extensionName]
          );
          this.extensions[PerMessageDeflate_1.extensionName] = perMessageDeflate;
        }
      } catch (err) {
        socket.destroy();
        this.finalize(new Error('invalid Sec-WebSocket-Extensions header'));
        return;
      }
    }

    this.setSocket(socket, head);
  });
}

/*!
 * ws: a node.js websocket client
 * Copyright(c) 2011 Einar Otto Stangvik <einaros@gmail.com>
 * MIT Licensed
 */













const Buffer$4 = safeBuffer.Buffer;

/**
 * Class representing a WebSocket server.
 *
 * @extends EventEmitter
 */
class WebSocketServer extends EventEmitter__default['default'] {
  /**
   * Create a `WebSocketServer` instance.
   *
   * @param {Object} options Configuration options
   * @param {String} options.host The hostname where to bind the server
   * @param {Number} options.port The port where to bind the server
   * @param {http.Server} options.server A pre-created HTTP/S server to use
   * @param {Function} options.verifyClient An hook to reject connections
   * @param {Function} options.handleProtocols An hook to handle protocols
   * @param {String} options.path Accept only connections matching this path
   * @param {Boolean} options.noServer Enable no server mode
   * @param {Boolean} options.clientTracking Specifies whether or not to track clients
   * @param {(Boolean|Object)} options.perMessageDeflate Enable/disable permessage-deflate
   * @param {Number} options.maxPayload The maximum allowed message size
   * @param {Function} callback A listener for the `listening` event
   */
  constructor (options, callback) {
    super();

    options = Object.assign({
      maxPayload: 100 * 1024 * 1024,
      perMessageDeflate: false,
      handleProtocols: null,
      clientTracking: true,
      verifyClient: null,
      noServer: false,
      backlog: null, // use default (511 as implemented in net.js)
      server: null,
      host: null,
      path: null,
      port: null
    }, options);

    if (options.port == null && !options.server && !options.noServer) {
      throw new TypeError('missing or invalid options');
    }

    if (options.port != null) {
      this._server = http__default['default'].createServer((req, res) => {
        const body = http__default['default'].STATUS_CODES[426];

        res.writeHead(426, {
          'Content-Length': body.length,
          'Content-Type': 'text/plain'
        });
        res.end(body);
      });
      this._server.listen(options.port, options.host, options.backlog, callback);
    } else if (options.server) {
      this._server = options.server;
    }

    if (this._server) {
      this._ultron = new ultron(this._server);
      this._ultron.on('listening', () => this.emit('listening'));
      this._ultron.on('error', (err) => this.emit('error', err));
      this._ultron.on('upgrade', (req, socket, head) => {
        this.handleUpgrade(req, socket, head, (client) => {
          this.emit('connection', client, req);
        });
      });
    }

    if (options.perMessageDeflate === true) options.perMessageDeflate = {};
    if (options.clientTracking) this.clients = new Set();
    this.options = options;
  }

  /**
   * Close the server.
   *
   * @param {Function} cb Callback
   * @public
   */
  close (cb) {
    //
    // Terminate all associated clients.
    //
    if (this.clients) {
      for (const client of this.clients) client.terminate();
    }

    const server = this._server;

    if (server) {
      this._ultron.destroy();
      this._ultron = this._server = null;

      //
      // Close the http server if it was internally created.
      //
      if (this.options.port != null) return server.close(cb);
    }

    if (cb) cb();
  }

  /**
   * See if a given request should be handled by this server instance.
   *
   * @param {http.IncomingMessage} req Request object to inspect
   * @return {Boolean} `true` if the request is valid, else `false`
   * @public
   */
  shouldHandle (req) {
    if (this.options.path && url__default['default'].parse(req.url).pathname !== this.options.path) {
      return false;
    }

    return true;
  }

  /**
   * Handle a HTTP Upgrade request.
   *
   * @param {http.IncomingMessage} req The request object
   * @param {net.Socket} socket The network socket between the server and client
   * @param {Buffer} head The first packet of the upgraded stream
   * @param {Function} cb Callback
   * @public
   */
  handleUpgrade (req, socket, head, cb) {
    socket.on('error', socketError);

    const version = +req.headers['sec-websocket-version'];
    const extensions = {};

    if (
      req.method !== 'GET' || req.headers.upgrade.toLowerCase() !== 'websocket' ||
      !req.headers['sec-websocket-key'] || (version !== 8 && version !== 13) ||
      !this.shouldHandle(req)
    ) {
      return abortConnection(socket, 400);
    }

    if (this.options.perMessageDeflate) {
      const perMessageDeflate = new PerMessageDeflate_1(
        this.options.perMessageDeflate,
        true,
        this.options.maxPayload
      );

      try {
        const offers = Extensions.parse(
          req.headers['sec-websocket-extensions']
        );

        if (offers[PerMessageDeflate_1.extensionName]) {
          perMessageDeflate.accept(offers[PerMessageDeflate_1.extensionName]);
          extensions[PerMessageDeflate_1.extensionName] = perMessageDeflate;
        }
      } catch (err) {
        return abortConnection(socket, 400);
      }
    }

    var protocol = (req.headers['sec-websocket-protocol'] || '').split(/, */);

    //
    // Optionally call external protocol selection handler.
    //
    if (this.options.handleProtocols) {
      protocol = this.options.handleProtocols(protocol, req);
      if (protocol === false) return abortConnection(socket, 401);
    } else {
      protocol = protocol[0];
    }

    //
    // Optionally call external client verification handler.
    //
    if (this.options.verifyClient) {
      const info = {
        origin: req.headers[`${version === 8 ? 'sec-websocket-origin' : 'origin'}`],
        secure: !!(req.connection.authorized || req.connection.encrypted),
        req
      };

      if (this.options.verifyClient.length === 2) {
        this.options.verifyClient(info, (verified, code, message) => {
          if (!verified) return abortConnection(socket, code || 401, message);

          this.completeUpgrade(
            protocol,
            extensions,
            version,
            req,
            socket,
            head,
            cb
          );
        });
        return;
      }

      if (!this.options.verifyClient(info)) return abortConnection(socket, 401);
    }

    this.completeUpgrade(protocol, extensions, version, req, socket, head, cb);
  }

  /**
   * Upgrade the connection to WebSocket.
   *
   * @param {String} protocol The chosen subprotocol
   * @param {Object} extensions The accepted extensions
   * @param {Number} version The WebSocket protocol version
   * @param {http.IncomingMessage} req The request object
   * @param {net.Socket} socket The network socket between the server and client
   * @param {Buffer} head The first packet of the upgraded stream
   * @param {Function} cb Callback
   * @private
   */
  completeUpgrade (protocol, extensions, version, req, socket, head, cb) {
    //
    // Destroy the socket if the client has already sent a FIN packet.
    //
    if (!socket.readable || !socket.writable) return socket.destroy();

    const key = crypto__default['default'].createHash('sha1')
      .update(req.headers['sec-websocket-key'] + Constants.GUID, 'binary')
      .digest('base64');

    const headers = [
      'HTTP/1.1 101 Switching Protocols',
      'Upgrade: websocket',
      'Connection: Upgrade',
      `Sec-WebSocket-Accept: ${key}`
    ];

    if (protocol) headers.push(`Sec-WebSocket-Protocol: ${protocol}`);
    if (extensions[PerMessageDeflate_1.extensionName]) {
      const params = extensions[PerMessageDeflate_1.extensionName].params;
      const value = Extensions.format({
        [PerMessageDeflate_1.extensionName]: [params]
      });
      headers.push(`Sec-WebSocket-Extensions: ${value}`);
    }

    //
    // Allow external modification/inspection of handshake headers.
    //
    this.emit('headers', headers, req);

    socket.write(headers.concat('\r\n').join('\r\n'));

    const client = new WebSocket_1([socket, head], null, {
      maxPayload: this.options.maxPayload,
      protocolVersion: version,
      extensions,
      protocol
    });

    if (this.clients) {
      this.clients.add(client);
      client.on('close', () => this.clients.delete(client));
    }

    socket.removeListener('error', socketError);
    cb(client);
  }
}

var WebSocketServer_1 = WebSocketServer;

/**
 * Handle premature socket errors.
 *
 * @private
 */
function socketError () {
  this.destroy();
}

/**
 * Close the connection when preconditions are not fulfilled.
 *
 * @param {net.Socket} socket The socket of the upgrade request
 * @param {Number} code The HTTP response status code
 * @param {String} [message] The HTTP response body
 * @private
 */
function abortConnection (socket, code, message) {
  if (socket.writable) {
    message = message || http__default['default'].STATUS_CODES[code];
    socket.write(
      `HTTP/1.1 ${code} ${http__default['default'].STATUS_CODES[code]}\r\n` +
      'Connection: close\r\n' +
      'Content-type: text/html\r\n' +
      `Content-Length: ${Buffer$4.byteLength(message)}\r\n` +
      '\r\n' +
      message
    );
  }

  socket.removeListener('error', socketError);
  socket.destroy();
}

/*!
 * ws: a node.js websocket client
 * Copyright(c) 2011 Einar Otto Stangvik <einaros@gmail.com>
 * MIT Licensed
 */



WebSocket_1.Server = WebSocketServer_1;
WebSocket_1.Receiver = Receiver_1;
WebSocket_1.Sender = Sender_1;

var ws = WebSocket_1;

class Socket extends EventEmitter.EventEmitter {
    constructor(base) {
        super();
        this.base = base;
        this.onClose = this.onClose.bind(this);
        this.onError = this.onError.bind(this);
        this.onMessage = this.onMessage.bind(this);
        this.base.on('close', this.onClose);
        this.base.on('error', this.onError);
        this.base.on('message', this.onMessage);
    }
    sendError(error) {
        this.send('error', error);
    }
    close() {
        this.base.close();
    }
    upgrade(ctor, arg) {
        this.removeAllListeners();
        this.base.removeListener('close', this.onClose);
        this.base.removeListener('error', this.onError);
        this.base.removeListener('message', this.onMessage);
        return new ctor(this.base, arg);
    }
    send(name, args) {
        this.base.send(JSON.stringify({
            name: name,
            args: args,
        }));
    }
    onClose(code, message) {
        this.emit('close');
    }
    onError(e) {
        console.error(e);
        this.emit('close');
    }
    onMessage(data) {
        if (typeof data != 'string')
            throw new Error('Invalid binary message');
        let msg = JSON.parse(data);
        this.emit('message', msg);
    }
}
(function (Socket) {
    class Unbound extends Socket {
        bind(ctor, arg) {
            return super.upgrade(ctor, arg);
        }
    }
    Socket.Unbound = Unbound;
    class Bound extends Socket {
        constructor(base, game) {
            super(base);
            this.game = game;
        }
        sendResult(result) {
            this.send('result', result);
        }
    }
    Socket.Bound = Bound;
    class Player extends Bound {
        constructor(base, player) {
            super(base, player.game);
            this.player = player;
        }
        sync() {
            this.send('state', serialize(this.game, this.player));
        }
        onClose(code, message) {
            if (this.game.state == GameState.LOBBY) {
                this.game.removePlayer(this.player);
            }
            super.onClose(code, message);
        }
    }
    Socket.Player = Player;
    class Spectator extends Bound {
        constructor(base, game) {
            super(base, game);
        }
        sync() {
            this.send('state', serialize(this.game, null));
        }
    }
    Socket.Spectator = Spectator;
})(Socket || (Socket = {}));

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

class Context extends EventEmitter.EventEmitter {
    constructor() {
        super(...arguments);
        this.game = new Game();
        this.sockets = new Array();
    }
    add(socket) {
        socket.on('close', () => this.cleanup(socket));
        socket.on('message', m => this.handle(socket, m));
        this.sockets.push(socket);
        this.sync();
    }
    join(unbound, name) {
        let player = this.game.allPlayers.find(p => intern(p.name) == intern(name));
        if (player == null) {
            player = this.game.addPlayer(name);
        }
        let socket = unbound.bind(Socket.Player, player);
        this.add(socket);
    }
    rejoin(unbound, id) {
        let player = this.game.allPlayers.find(p => p.id == id);
        let socket = unbound.bind(Socket.Player, player);
        this.add(socket);
    }
    watch(unbound) {
        let socket = unbound.bind(Socket.Spectator, this.game);
        this.add(socket);
    }
    static isValidName(name) {
        if (!name || !intern(name))
            return false;
        return true;
    }
    canJoin(name) {
        if (!Context.isValidName(name))
            return false;
        let player = this.game.allPlayers.find(p => intern(p.name) == intern(name));
        if (player == null)
            return this.game.state == GameState.LOBBY;
        let socket = this.sockets.find(s => s instanceof Socket.Player && s.player == player);
        if (socket != null)
            return false;
        return true;
    }
    canRejoin(id) {
        let player = this.game.allPlayers.find(p => p.id == id);
        if (player == null)
            return false;
        let socket = this.sockets.find(s => s instanceof Socket.Player && s.player == player);
        if (socket != null)
            return false;
        return true;
    }
    dispose() {
        for (let socket of this.sockets) {
            socket.close();
            this.cleanup(socket);
        }
        this.emit('complete');
        this.removeAllListeners();
    }
    sync() {
        if (this.sockets.length == 0) {
            this.dispose();
            return;
        }
        let results = this.game.update();
        for (let socket of this.sockets) {
            socket.sync();
            for (let result of results) {
                socket.sendResult(result);
            }
        }
        if (this.game.state == GameState.COMPLETED) {
            this.dispose();
            return;
        }
    }
    handle(socket, msg) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(socket instanceof Socket.Player)) {
                console.error('Got message from non-player socket', msg);
                return;
            }
            let ctx = {
                game: this.game,
                params: msg.args,
                sender: socket.player,
            };
            try {
                return yield invoke(msg.name, ctx);
            }
            catch (e) {
                console.error(e);
            }
            finally {
                try {
                    this.sync();
                }
                catch (e) {
                    console.error(e);
                }
            }
        });
    }
    cleanup(socket) {
        let index = this.sockets.indexOf(socket);
        if (index != -1)
            this.sockets.splice(index, 1);
        this.sync();
    }
}
function intern(name) {
    return name.toLowerCase().replace('\s+', '');
}

var version = "1.1.2";

class Dispatcher {
    constructor() {
        this.contexts = new Map();
    }
    add(socket) {
        socket.on('message', m => this.handle(socket, m));
    }
    handle_CREATE(socket, args) {
        if (!Context.isValidName(args.name)) {
            return socket.sendError({
                name: 'INVALID_NAME',
                args: {},
            });
        }
        let context = new Context();
        context.on('complete', () => this.contexts.delete(context.game.name));
        this.contexts.set(context.game.name, context);
        context.join(socket, args.name);
    }
    handle_JOIN(socket, args) {
        if (!Context.isValidName(args.name)) {
            return socket.sendError({
                name: 'INVALID_NAME',
                args: {},
            });
        }
        let context = this.contexts.get(args.game);
        if (!context) {
            return socket.sendError({
                name: 'GAME_NOT_FOUND',
                args: {},
            });
        }
        if (!context.canJoin(args.name)) {
            return socket.sendError({
                name: 'JOIN_FAILED',
                args: {},
            });
        }
        context.join(socket, args.name);
    }
    handle_REJOIN(socket, args) {
        let context = this.contexts.get(args.game);
        if (!context) {
            return socket.sendError({
                name: 'GAME_NOT_FOUND',
                args: {},
            });
        }
        if (!context.canRejoin(args.id)) {
            return socket.sendError({
                name: 'JOIN_FAILED',
                args: {},
            });
        }
        context.rejoin(socket, args.id);
    }
    handle_WATCH(socket, args) {
        let context = this.contexts.get(args.game);
        if (!context) {
            return socket.sendError({
                name: 'GAME_NOT_FOUND',
                args: {},
            });
        }
        context.watch(socket);
    }
    handle(socket, msg) {
        if (msg.version != version) {
            return socket.sendError({
                name: 'VERSION',
                args: { correct: version },
            });
        }
        if (msg.name == 'CREATE')
            return this.handle_CREATE(socket, msg.args);
        if (msg.name == 'JOIN')
            return this.handle_JOIN(socket, msg.args);
        if (msg.name == 'REJOIN')
            return this.handle_REJOIN(socket, msg.args);
        if (msg.name == 'WATCH')
            return this.handle_WATCH(socket, msg.args);
        socket.sendError({
            name: 'UPGRADE_NOT_FOUND',
            args: {},
        });
    }
}

let dispatcher = new Dispatcher();
function onConnect(base, req) {
    let socket = new Socket.Unbound(base);
    dispatcher.add(socket);
}
function start() {
    const httpServer = http.createServer();
    const wsServer = new ws.Server({
        server: httpServer,
    });
    wsServer.on('connection', onConnect);
    let port = process.argv[2] ? parseInt(process.argv[2]) : 8081;
    httpServer.listen(port, () => {
        let addr = httpServer.address();
        let info = typeof addr == 'string' ? addr : addr.port;
        console.log(`Started server version ${version}: ${info}`);
    });
}

start();
