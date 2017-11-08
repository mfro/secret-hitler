import { json } from '../util';

import { Assignment, Game, GameState } from '.';

let nextId = 1;

export class Player {
    readonly game: Game;

    readonly id: number;

    name: string;
    isReady = false;
    isAlive = true;

    assignment: Assignment | null = null;

    vote: boolean | null = null;

    termLimited = false;

    constructor(game: Game, name: string) {
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

    serialize(perspective: Player | null) {
        let data: any = {
            id: this.id,
            name: this.name,
            isLocalPlayer: false,
        };

        if (this == perspective) {
            data.isLocalPlayer = true;
            data.assignment = json.serialize(this.assignment, this);
        }

        if (this.game.state == GameState.LOBBY) {
            data.isReady = this.isReady;
        } else {
            data.isAlive = this.isAlive;
            data.isTermLimited = this.termLimited;
        }

        data.vote = this.vote;
        if (this.game.state == GameState.VOTING) {
            data.hasVoted = this.vote !== null;
        }

        return data;
    }
}
