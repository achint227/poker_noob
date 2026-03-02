export type Suit = 's' | 'h' | 'd' | 'c';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'T' | 'J' | 'Q' | 'K' | 'A';

const SUITS: Suit[] = ['s', 'h', 'd', 'c'];
const RANKS: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
const RANK_STR = '23456789TJQKA';

export class Card {
    readonly rank: Rank;
    readonly suit: Suit;
    readonly value: number;
    readonly id: number; // Unique ID for faster comparisons

    constructor(rank: Rank | string, suit: Suit | string) {
        this.rank = rank as Rank;
        this.suit = suit as Suit;
        this.value = RANK_STR.indexOf(this.rank);
        this.id = this.value * 4 + SUITS.indexOf(this.suit);
    }

    toString(): string {
        return this.rank + this.suit;
    }
}

// Pre-create all possible cards
const ALL_CARDS: Card[] = [];
for (const suit of SUITS) {
    for (const rank of RANKS) {
        ALL_CARDS.push(new Card(rank, suit));
    }
}

export class Deck {
    private cards: Card[];
    private initialCards: Card[];
    private pointer: number = 0;

    constructor() {
        this.initialCards = [...ALL_CARDS];
        this.cards = [...this.initialCards];
        this.pointer = this.cards.length;
    }

    reset(): void {
        this.cards = [...this.initialCards];
        this.pointer = this.cards.length;
    }

    shuffle(): void {
        // Reset pointer to the end of the current deck
        const n = this.cards.length;
        for (let i = n - 1; i > 0; i--) {
            const j = (Math.random() * (i + 1)) | 0;
            const temp = this.cards[i];
            this.cards[i] = this.cards[j];
            this.cards[j] = temp;
        }
        this.pointer = n;
    }

    deal(): Card | undefined {
        if (this.pointer <= 0) return undefined;
        return this.cards[--this.pointer];
    }

    // Remove specific cards from the deck (e.g. usage for calculating odds when some cards are known)
    removeCards(knownCards: (Card | null)[]): void {
        const knownIds = new Set(knownCards.filter(c => c !== null).map(c => c!.id));
        this.cards = this.initialCards.filter(card => !knownIds.has(card.id));
        this.pointer = this.cards.length;
    }

    // Prepare for simulation by locking in the available cards
    prepareForSimulation(knownCards: (Card | null)[]): void {
        this.removeCards(knownCards);
        this.initialCards = [...this.cards]; // Snapshot for simulation
    }

    // In this optimized version, resetForSimulation doesn't need to do anything
    // because shuffle always works on the full set of available cards.
    resetForSimulation(): void {
        // No-op for performance, shuffle handles it
    }
}
