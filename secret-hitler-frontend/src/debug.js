import store from '@/store';

export const isDebug = location.hostname == 'localhost';

export const PLAYERS = [
    {
        id: 0,
        name: 'Player 0',
        isLocalPlayer: true,
        isAlive: true,
    },
    {
        id: 1,
        name: 'Player 1',
        isLocalPlayer: false,
        isAlive: true,
    },
    {
        id: 2,
        name: 'Player 2',
        isLocalPlayer: false,
        isAlive: true,
    },
    {
        id: 3,
        name: 'Player 3',
        isLocalPlayer: false,
        isAlive: true,
    },
    {
        id: 4,
        name: 'Player 4',
        isLocalPlayer: false,
        isAlive: true,
    },
];

function make_game(args, mapper) {
    mapper = mapper || (p => {});
    return Object.assign({
        log: [],
        name: 69,
        players: PLAYERS.map(p => {
            let r = mapper(p);
            if (r == null)
                return null;
            return Object.assign({}, p, r);
        }).filter(p => p),
        boardState: {
            liberals: 0,
            fascists: 0,
            voteFailures: 0,
            deckSize: 17,
            discardSize: 0,
        },
    }, args)
}

export const GAME_LOBBY = make_game({
    state: 'LOBBY',
}, p => ({
    isReady: false,
}));

export const GAME_NOMINATING_SELF = make_game({
    state: 'NOMINATING',
    nomination: {
        president: 0,
    },
});

export const GAME_NOMINATING_OTHER = make_game({
    state: 'NOMINATING',
    nomination: {
        president: 1,
    },
});

export const GAME_VOTING_NOT_DONE = make_game({
    state: 'VOTING',
    nomination: {
        president: 1,
        chancellor: 2,
    },
}, p => ({
    hasVoted: false,
}));

export const GAME_VOTING_DONE = make_game({
    state: 'VOTING',
    nomination: {
        president: 1,
        chancellor: 2,
    },
}, p => ({
    hasVoted: p.id % 2 == 0,
}));

export const GAME_DEAD_SELF = make_game({
    state: 'VOTING',
    nomination: {
        president: 1,
        chancellor: 2,
    },
}, p => ({
    hasVoted: p.id % 2 == 1 || p.id == 0,
    isAlive: p.id != 0,
}));

export const GAME_DEAD_OTHER = make_game({
    state: 'VOTING',
    nomination: {
        president: 1,
        chancellor: 3,
    },
}, p => ({
    hasVoted: p.id % 2 == 1,
    isAlive: p.id != 2,
}));

export const GAME_LIBERAL_POLICY_VICTORY = make_game({
    state: 'COMPLETED',
    victory: 'LIBERAL_POLICY',
});

export const GAME_FASCIST_POLICY_VICTORY = make_game({
    state: 'COMPLETED',
    victory: 'FASCIST_POLICY',
});

export const GAME_LIBERAL_HITLER_VICTORY = make_game({
    state: 'COMPLETED',
    victory: 'LIBERAL_HITLER',
});

export const GAME_FASCIST_HITLER_VICTORY = make_game({
    state: 'COMPLETED',
    victory: 'FASCIST_HITLER',
});

export const VOTE_EVENT = {
    name: 'vote',
    args: {
        pass: false,
        president: 0,
        chancellor: 2,
        votes: {
            ja: [],
            nein: [0, 1, 2, 3, 4]
        }
    },
};

export const POLICY_EVENT = {
    name: 'policy',
    args: {
        policy: 'LIBERAL',
        government: {
            president: 0,
            chancellor: 2,
        },
    },
};

export const VETO_AGREE_EVENT = {
    name: 'veto',
    args: {
        agree: true,
        president: 0,
        chancellor: 2,
    },
};

export const VETO_DISAGREE_EVENT = {
    name: 'veto',
    args: {
        agree: false,
        president: 0,
        chancellor: 2,
    },
};

export const ASSASSINATION_EVENT = {
    name: 'assassination',
    args: {
        president: 0,
        target: 2,
    },
};

if (isDebug) {
    // store.commit('SET_GAME', GAME_FASCIST_HITLER_VICTORY);
    // store.commit('SET_WATCHING', true);
}