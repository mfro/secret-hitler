import * as membership_back from './assets/membership/back.png';
import * as membership_fascist from './assets/membership/fascist.png';
import * as membership_liberal from './assets/membership/liberal.png';

import * as role_back from './assets/role/back.png';
import * as role_fascist0 from './assets/role/fascist0.png';
import * as role_fascist1 from './assets/role/fascist1.png';
import * as role_fascist2 from './assets/role/fascist2.png';

import * as role_hitler0 from './assets/role/hitler0.png';
import * as role_liberal0 from './assets/role/liberal1.png';
import * as role_liberal1 from './assets/role/liberal2.png';
import * as role_liberal2 from './assets/role/liberal3.png';
import * as role_liberal3 from './assets/role/liberal4.png';
import * as role_liberal4 from './assets/role/liberal5.png';
import * as role_liberal5 from './assets/role/liberal5.png';

import * as vote_back from './assets/votes/back.png';
import * as vote_ja from './assets/votes/ja.png';
import * as vote_nein from './assets/votes/nein.png';

import * as policy_back from './assets/policy/back.png';
import * as policy_liberal from './assets/policy/liberal.png';
import * as policy_fascist from './assets/policy/fascist.png';

const role_fascist = [role_fascist0, role_fascist1, role_fascist2];
const role_liberal = [role_liberal0, role_liberal1, role_liberal2, role_liberal3, role_liberal4, role_liberal5];

export function getMembershipCard(role) {
    if (role == 'FASCIST' || role == 'HITLER')
        return { back: membership_back, front: membership_fascist };

    if (role == 'LIBERAL')
        return { back: membership_back, front: membership_liberal };

    return alert('something went wrong :/');
}

export function getRoleCard(role) {
    if (role == 'HITLER')
        return { back: role_back, front: role_hitler0 };

    if (role == 'FASCIST')
        return { back: role_back, front: rand(role_fascist) };

    if (role == 'LIBERAL')
        return { back: role_back, front: rand(role_liberal) };

    return alert('something went wrong :/');
}

export const ja_card = { back: vote_back, front: vote_ja };
export const nein_card = { back: vote_back, front: vote_nein };
export const voting_card = { back: vote_nein, front: vote_ja };

export const liberal_policy = { back: policy_back, front: policy_liberal };
export const fascist_policy = { back: policy_back, front: policy_fascist };

function rand(list) {
    return list[Math.floor(Math.random() * list.length)];
}
