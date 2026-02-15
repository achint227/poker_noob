import { Deck, Card } from './deck.js';

export class Calculator {
    constructor() {
        this.RANKS = '23456789TJQKA';
    }

    // Convert card string to Card object
    parseCard(cardStr) {
        if (!cardStr) return null;
        return new Card(cardStr[0], cardStr[1]);
    }

    // Evaluate the strength of a 5-7 card hand
    // Returns a score where higher is better.
    // Score format: [HandRank, TieBreaker1, TieBreaker2, ...]
    evaluateHand(cards) {
        if (cards.length < 5) return 0;

        // Sort cards by rank descending
        cards.sort((a, b) => b.value - a.value);

        const ranks = cards.map(c => c.value);
        const suits = cards.map(c => c.suit);

        // Check Flush
        const flushSuit = this.getFlushSuit(suits);
        const flushCards = flushSuit ? cards.filter(c => c.suit === flushSuit) : [];

        // Check Straight
        const straightHighRank = this.getStraightHighRank(ranks);

        // Check Straight Flush
        let straightFlushHighRank = -1;
        if (flushSuit) {
            const flushRanks = flushCards.map(c => c.value);
            straightFlushHighRank = this.getStraightHighRank(flushRanks);
        }

        // 8. Straight Flush
        if (straightFlushHighRank !== -1) {
            return 8000000 + straightFlushHighRank;
        }

        // 7. Four of a Kind
        const quads = this.getNOfAKind(ranks, 4);
        if (quads) {
            return 7000000 + (quads.rank * 100) + quads.kickers[0];
        }

        // 6. Full House
        const trips = this.getNOfAKind(ranks, 3);
        if (trips) {
            // Find pair in remaining
            const remaining = ranks.filter(r => r !== trips.rank);
            const pair = this.getNOfAKind(remaining, 2);
            if (pair) {
                return 6000000 + (trips.rank * 100) + pair.rank;
            }
        }

        // 5. Flush
        if (flushSuit) {
            // Top 5 cards of the flush
            let score = 5000000;
            for (let i = 0; i < 5; i++) {
                score += flushCards[i].value * Math.pow(15, 4 - i); // Base 15 weighting
            }
            return score;
        }

        // 4. Straight
        if (straightHighRank !== -1) {
            return 4000000 + straightHighRank;
        }

        // 3. Three of a Kind
        if (trips) {
            return 3000000 + (trips.rank * 1000) + trips.kickers[0] * 15 + trips.kickers[1];
        }

        // 2. Two Pair
        const pair1 = this.getNOfAKind(ranks, 2);
        if (pair1) {
            const remaining = ranks.filter(r => r !== pair1.rank);
            const pair2 = this.getNOfAKind(remaining, 2);
            if (pair2) {
                const kicker = remaining.filter(r => r !== pair2.rank)[0];
                return 2000000 + (pair1.rank * 1000) + (pair2.rank * 15) + kicker;
            }

            // 1. One Pair
            return 1000000 + (pair1.rank * 1000) + pair1.kickers[0] * 225 + pair1.kickers[1] * 15 + pair1.kickers[2];
        }

        // 0. High Card
        let score = 0;
        for (let i = 0; i < 5; i++) {
            score += ranks[i] * Math.pow(15, 4 - i);
        }
        return score;
    }

    getHandDetails(cards) {
        if (cards.length < 5) return null;

        // Sort cards by rank descending
        cards.sort((a, b) => b.value - a.value);

        const ranks = cards.map(c => c.value);
        const suits = cards.map(c => c.suit);
        const rankNames = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
        const fullRankNames = ['Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Jack', 'Queen', 'King', 'Ace'];

        const getRankName = (val) => fullRankNames[val];
        const getPluralRankName = (val) => {
            if (val === 4) return 'Sixes'; // Fix for Sixes
            return fullRankNames[val] + 's';
        }

        // Check Flush
        const flushSuit = this.getFlushSuit(suits);
        const flushCards = flushSuit ? cards.filter(c => c.suit === flushSuit) : [];

        // Check Straight
        const straightHighRank = this.getStraightHighRank(ranks);

        // Check Straight Flush
        let straightFlushHighRank = -1;
        if (flushSuit) {
            const flushRanks = flushCards.map(c => c.value);
            straightFlushHighRank = this.getStraightHighRank(flushRanks);
        }

        // 8. Straight Flush
        if (straightFlushHighRank !== -1) {
            return {
                score: 8000000 + straightFlushHighRank,
                type: 'Straight Flush',
                description: `Straight Flush, ${getRankName(straightFlushHighRank)} High`,
                rank: straightFlushHighRank,
                kickers: []
            };
        }

        // 7. Four of a Kind
        const quads = this.getNOfAKind(ranks, 4);
        if (quads) {
            return {
                score: 7000000 + (quads.rank * 100) + quads.kickers[0],
                type: 'Four of a Kind',
                description: `Four of a Kind, ${getPluralRankName(quads.rank)}`,
                rank: quads.rank,
                kickers: quads.kickers
            };
        }

        // 6. Full House
        const trips = this.getNOfAKind(ranks, 3);
        if (trips) {
            const remaining = ranks.filter(r => r !== trips.rank);
            const pair = this.getNOfAKind(remaining, 2);
            if (pair) {
                return {
                    score: 6000000 + (trips.rank * 100) + pair.rank,
                    type: 'Full House',
                    description: `Full House, ${getPluralRankName(trips.rank)} full of ${getPluralRankName(pair.rank)}`,
                    rank: trips.rank,
                    subRank: pair.rank,
                    kickers: []
                };
            }
        }

        // 5. Flush
        if (flushSuit) {
            let score = 5000000;
            for (let i = 0; i < 5; i++) {
                score += flushCards[i].value * Math.pow(15, 4 - i);
            }
            return {
                score: score,
                type: 'Flush',
                description: `Flush, ${getRankName(flushCards[0].value)} High`,
                rank: flushCards[0].value,
                kickers: flushCards.slice(1).map(c => c.value)
            };
        }

        // 4. Straight
        if (straightHighRank !== -1) {
            return {
                score: 4000000 + straightHighRank,
                type: 'Straight',
                description: `Straight, ${getRankName(straightHighRank)} High`,
                rank: straightHighRank,
                kickers: []
            };
        }

        // 3. Three of a Kind
        if (trips) {
            return {
                score: 3000000 + (trips.rank * 1000) + trips.kickers[0] * 15 + trips.kickers[1],
                type: 'Three of a Kind',
                description: `Three of a Kind, ${getPluralRankName(trips.rank)}`,
                rank: trips.rank,
                kickers: trips.kickers
            };
        }

        // 2. Two Pair
        const pair1 = this.getNOfAKind(ranks, 2);
        if (pair1) {
            const remaining = ranks.filter(r => r !== pair1.rank);
            const pair2 = this.getNOfAKind(remaining, 2);
            if (pair2) {
                const kicker = remaining.filter(r => r !== pair2.rank)[0];
                return {
                    score: 2000000 + (pair1.rank * 1000) + (pair2.rank * 15) + kicker,
                    type: 'Two Pair',
                    description: `Two Pair, ${getPluralRankName(pair1.rank)} and ${getPluralRankName(pair2.rank)}`,
                    rank: pair1.rank,
                    subRank: pair2.rank,
                    kickers: [kicker]
                };
            }

            // 1. One Pair
            return {
                score: 1000000 + (pair1.rank * 1000) + pair1.kickers[0] * 225 + pair1.kickers[1] * 15 + pair1.kickers[2],
                type: 'Pair',
                description: `Pair of ${getPluralRankName(pair1.rank)}`,
                rank: pair1.rank,
                kickers: pair1.kickers
            };
        }

        // 0. High Card
        let score = 0;
        for (let i = 0; i < 5; i++) {
            score += ranks[i] * Math.pow(15, 4 - i);
        }
        return {
            score: score,
            type: 'High Card',
            description: `High Card ${getRankName(ranks[0])}`,
            rank: ranks[0],
            kickers: ranks.slice(1)
        };
    }

    getFlushSuit(suits) {
        const counts = {};
        for (const s of suits) counts[s] = (counts[s] || 0) + 1;
        for (const s in counts) if (counts[s] >= 5) return s;
        return null;
    }

    getStraightHighRank(ranks) {
        // Unique ranks
        const unique = [...new Set(ranks)];

        // Check for 5 consecutive
        for (let i = 0; i <= unique.length - 5; i++) {
            if (unique[i] - unique[i + 4] === 4) return unique[i];
        }

        // Special case: Wheel (A-5) -> A, 5, 4, 3, 2. A is 12, 2 is 0.
        // Elements in unique are sorted descending.
        // Check if A(12), 5(3), 4(2), 3(1), 2(0) exist
        if (unique.includes(12) && unique.includes(3) && unique.includes(2) && unique.includes(1) && unique.includes(0)) {
            return 3; // High card is 5 (index 3)
        }

        return -1;
    }

    getNOfAKind(ranks, n) {
        const counts = {};
        for (const r of ranks) counts[r] = (counts[r] || 0) + 1;

        for (const r in counts) {
            if (counts[r] === n) {
                const rankVal = parseInt(r);
                const kickers = ranks.filter(x => x !== rankVal);
                return { rank: rankVal, kickers: kickers };
            }
        }
        // If searching for pair, we might have trips/quads that contain a pair, 
        // but this logic assumes strict search for N. 
        // Better: iterate ranks descending
        for (let r = 12; r >= 0; r--) {
            if (counts[r] >= n) {
                const kickers = ranks.filter(x => x !== r);
                return { rank: r, kickers };
            }
        }

        return null;
    }

    calculateEquity(heroCardsStr, villainsCardsStr, boardCardsStr, iterations = 1000) {
        const heroCards = heroCardsStr.map(c => this.parseCard(c));
        // villainsCardsStr is array of arrays of strings: [['As', 'Ks'], ['Qh', 'Jh']]
        // Turn into array of arrays of Cards
        const villainsCards = villainsCardsStr.map(hand => hand.map(c => this.parseCard(c)));
        const boardCards = boardCardsStr.filter(c => c).map(c => this.parseCard(c));

        let heroWins = 0;
        let heroTies = 0;

        // Initialize villain stats
        const villainsStats = villainsCards.map(() => ({ wins: 0, ties: 0 }));

        for (let i = 0; i < iterations; i++) {
            const deck = new Deck();
            const allVillainCardsFlattened = villainsCards.flat();
            const knownCards = [...heroCards, ...allVillainCardsFlattened, ...boardCards];
            deck.removeCards(knownCards);
            deck.shuffle();

            // Deal remaining board
            const currentBoard = [...boardCards];
            while (currentBoard.length < 5) {
                currentBoard.push(deck.deal());
            }

            const heroScore = this.evaluateHand([...heroCards, ...currentBoard]);

            // Eval all villains
            const villainScores = villainsCards.map(hand => this.evaluateHand([...hand, ...currentBoard]));

            // Determine winner
            let maxScore = heroScore;
            // Find absolute max score on table
            for (const score of villainScores) {
                if (score > maxScore) maxScore = score;
            }

            // Check who has maxScore
            const winners = [];
            if (heroScore === maxScore) winners.push('hero');
            villainScores.forEach((score, index) => {
                if (score === maxScore) winners.push(index);
            });

            // Update stats
            if (winners.length === 1) {
                if (winners[0] === 'hero') {
                    heroWins++;
                } else {
                    villainsStats[winners[0]].wins++;
                }
            } else {
                // Tie logic: everyone with maxScore ties
                if (winners.includes('hero')) heroTies++;
                villainScores.forEach((score, index) => {
                    if (score === maxScore) villainsStats[index].ties++;
                });
            }
        }

        const heroResults = {
            win: (heroWins / iterations) * 100,
            tie: (heroTies / iterations) * 100
        };

        const villainsResults = villainsStats.map(stat => ({
            win: (stat.wins / iterations) * 100,
            tie: (stat.ties / iterations) * 100
        }));

        return {
            hero: heroResults,
            villains: villainsResults
        };
    }

    calculateEquityAgainstRandom(heroCardsStr, boardCardsStr, numVillains, iterations = 1000) {
        const heroCards = heroCardsStr.map(c => this.parseCard(c));
        const boardCards = boardCardsStr.filter(c => c).map(c => this.parseCard(c));

        let heroWins = 0;
        let heroTies = 0;

        for (let i = 0; i < iterations; i++) {
            const deck = new Deck();
            const knownCards = [...heroCards, ...boardCards];
            deck.removeCards(knownCards);
            deck.shuffle();

            // Deal random hands to villains
            const villainHands = [];
            for (let v = 0; v < numVillains; v++) {
                villainHands.push([deck.deal(), deck.deal()]);
            }

            // Deal remaining board
            const currentBoard = [...boardCards];
            while (currentBoard.length < 5) {
                currentBoard.push(deck.deal());
            }

            const heroScore = this.evaluateHand([...heroCards, ...currentBoard]);

            // Eval all villains
            let maxScore = heroScore;
            const villainScores = villainHands.map(hand => {
                const s = this.evaluateHand([...hand, ...currentBoard]);
                if (s > maxScore) maxScore = s;
                return s;
            });

            // Check if hero wins or ties
            const winners = [];
            if (heroScore === maxScore) winners.push('hero');
            villainScores.forEach((score, index) => {
                if (score === maxScore) winners.push(index);
            });

            if (winners.length === 1 && winners[0] === 'hero') {
                heroWins++;
            } else if (winners.includes('hero')) {
                heroTies++;
            }
        }

        return {
            win: (heroWins / iterations) * 100,
            tie: (heroTies / iterations) * 100
        };
    }
}
