import { Role, Player, Faction } from '.';

export class Assignment {
    constructor(
        readonly role: Role,
    ) { }

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

    serialize(player: Player) {
        let players = player.game.allPlayers;

        if (players.find(p => p.assignment == null) != null)
            throw new Error(`Unassigned players while serializing ${player}`);

        let hitlerKnows = (players.length < 7);

        let data: any = {
            role: this.role,
        };

        if (this.role == Role.FASCIST) {
            data.hitler = players.find(p => p.assignment!.isHitler);
        }

        if (this.role == Role.FASCIST ||
            (this.role == Role.HITLER) && hitlerKnows) {
            data.fascists = players
                .filter(p => p.assignment!.role == Role.FASCIST)
                .filter(p => p != player);
        }

        return data;
    }
}
