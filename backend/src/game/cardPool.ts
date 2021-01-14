import { Faction } from './faction';

class Pile {
    cards = new Array<Faction>();

    constructor(liberal: number, fascist: number) {
        while (liberal + fascist > 0) {
            let pLiberal = liberal / (liberal + fascist);
            let pFascist = fascist / (liberal + fascist);

            let isLiberal = Math.random() < pLiberal;
            if (isLiberal) {
                this.cards.push(Faction.LIBERAL);
                liberal--;
            } else {
                this.cards.push(Faction.FASCIST);
                fascist--;
            }
        }
    }

    get size() { return this.cards.length; }

    add(f: Faction) {
        this.cards.push(f);
    }

    draw() {
        return this.cards.shift();
    }

    static combine(p1: Pile, p2: Pile) {
        let libs = p1.cards.filter(p => p == Faction.LIBERAL).length +
            p2.cards.filter(p => p == Faction.LIBERAL).length;

        return new Pile(libs, p1.size + p2.size - libs);
    }
}

export class CardPool {
    private drawPile = new Pile(6, 11);
    private discardPile = new Pile(0, 0);

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

    discard(...policies: Faction[]) {
        for (let policy of policies)
            this.discardPile.add(policy);
    }
}
