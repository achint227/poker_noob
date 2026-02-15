export type Suit = 's' | 'h' | 'd' | 'c';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'T' | 'J' | 'Q' | 'K' | 'A';

export class Card {
    rank: Rank;
    suit: Suit;

    constructor(rank: Rank | string, suit: Suit | string) {
        this.rank = rank as Rank;
        this.suit = suit as Suit;
    }

    toString(): string {
        return this.rank + this.suit;
    }

    get value(): number {
        const ranks = '23456789TJQKA';
        return ranks.indexOf(this.rank);
    }
}

export class Deck {
    cards: Card[];

    constructor() {
        this.cards = [];
        this.reset();
    }

    reset(): void {
        this.cards = [];
        const suits: Suit[] = ['s', 'h', 'd', 'c']; // spades, hearts, diamonds, clubs
        const ranks: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];

        for (const suit of suits) {
            for (const rank of ranks) {
                this.cards.push(new Card(rank, suit));
            }
        }
    }

    shuffle(): void {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }

    deal(): Card | undefined {
        return this.cards.pop();
    }

    // Remove specific cards from the deck (e.g. usage for calculating odds when some cards are known)
    removeCards(knownCards: (Card | null)[]): void {
        this.cards = this.cards.filter(card => {
            return !knownCards.some(known => known && known.toString() === card.toString());
        });
    }
}
