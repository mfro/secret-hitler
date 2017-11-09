import store from '@/store';

export const isDebug = location.hostname == 'localhost';

const VOTE_EVENT = {
    name: 'vote',
    args: {
        pass: false,
        president: 17,
        chancellor: 19,
        votes: {
            ja: [],
            nein: [17, 18, 19, 20, 21]
        }
    },
};

const POLICY_EVENT = {
    name: 'policy',
    args: {
        policy: 'LIBERAL',
        government: {
            president: 17,
            chancellor: 19,
        },
    },
};

const VETO_AGREE_EVENT = {
    name: 'veto',
    args: {
        agree: true,
        president: 17,
        chancellor: 19,
    },
};

const VETO_DISAGREE_EVENT = {
    name: 'veto',
    args: {
        agree: false,
        president: 17,
        chancellor: 19,
    },
};
