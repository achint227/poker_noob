export class Card {
    constructor(rank, suit) {
        this.rank = rank;
        this.suit = suit;
    }

    toString() {
        return this.rank + this.suit;
    }

    get value() {
        const ranks = '23456789TJQKA';
        return ranks.indexOf(this.rank);
    }
}

export class Deck {
    constructor() {
        this.cards = [];
        this.reset();
    }

    reset() {
        this.cards = [];
        const suits = ['s', 'h', 'd', 'c']; // spades, hearts, diamonds, clubs
        const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];

        for (const suit of suits) {
            for (const rank of ranks) {
                this.cards.push(new Card(rank, suit));
            }
        }
    }

    shuffle() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }

    deal() {
        return this.cards.pop();
    }

    // Remove specific cards from the deck (e.g. usage for calculating odds when some cards are known)
    removeCards(knownCards) {
        this.cards = this.cards.filter(card => {
            return !knownCards.some(known => known.toString() === card.toString());
        });
    }
}
