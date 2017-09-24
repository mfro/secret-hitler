import { EventEmitter } from 'events';

export interface Player {
    id: number;
    name: string;
    handler: (event: string, data: any) => void;

    isReady: boolean;
}

export interface PlayerPatch {
    name?: string;
    isReady?: boolean;
}

let nextId = 1;
const players = new Array<Player>();

function update() {
    for (let player of players) {
        player.handler('update', players);
    }

    if (players.length < 5) return;

    for (let player of players) {
        if (!player.isReady) return;
    }

    let fCount = Math.floor((players.length - 3) / 2);
    let lCount = players.length - 1 - fCount;
    let hitlerKnows = (players.length < 7);

    let roles = ['hitler'];
    for (let i = 0; i < fCount; i++) roles.push('fascist');
    for (let i = 0; i < lCount; i++) roles.push('liberal');

    let assigned = new Map<number, string>();
    for (let player of players) {
        let i = Math.floor(Math.random() * roles.length);
        let role = roles.splice(i, 1)[0];
        assigned.set(player.id, role);
    }

    for (let player of players) {
        let role = assigned.get(player.id);
        let ass: any = { role: role };

        if (role == 'fascist') {
            ass.hitler = players.find(p => assigned.get(p.id) == 'hitler');
            ass.fascists = players.filter(p => assigned.get(p.id) == 'fascist' && p != player);
        } else if (role == 'hitler' && hitlerKnows) {
            ass.fascists = players.filter(p => assigned.get(p.id) == 'fascist' && p != player);
        }

        player.handler('assignment', ass);
    }

    players.splice(0, players.length);
    update();
}

export function isValidName(name: string) {
    let check = internalize(name);

    if (!check) return false;

    for (let player of players) {
        let other = internalize(player.name);
        if (other == check) {
            return false;
        }
    }

    return true;
}

export function addPlayer(name: string, cb: (type: string, arg: any) => void) {
    if (!isValidName(name))
        throw new Error("Invalid name: " + name);

    const player = {
        id: nextId++,
        name: name,
        handler: cb,

        isReady: false,
    };

    players.push(player);
    update();

    player.handler('self', player);
    player.handler('update', players);

    return player.id;
}

export function removePlayer(id: number) {
    let i = players.findIndex(p => p.id == id);
    if (i < 0) return;

    players.splice(i, 1);
    update();
}

export function updatePlayer(id: number, patch: PlayerPatch) {
    let p = players.find(p => p.id == id);
    if (p == null)
        return false;

    if (typeof patch.isReady == 'boolean')
        p.isReady = patch.isReady;

    if (typeof patch.name == 'string' && isValidName(patch.name))
        p.name = patch.name;

    update();

    return true;
}

function internalize(name: string) {
    return name.toLowerCase().replace('\s+', '');
}