import { useState, useEffect, useMemo, useRef } from 'react'
import { Calculator, HandDetails, PlayerEquity } from './utils/calculator'
import Hand, { HandResult } from './components/Hand'
import Board from './components/Board'
import CardSelectorModal from './components/CardSelectorModal'
import { Deck } from './utils/deck'
import NumericStepper from './components/NumericStepper'
import HandRankingModal from './components/HandRankingModal'
import './index.css'

// Instantiate calculator once
const calculator = new Calculator();

function App() {

  const [players, setPlayers] = useState<(string | null)[][]>([[null, null], [null, null]]); // Start with 2 players
  const [board, setBoard] = useState<(string | null)[]>([null, null, null, null, null]);
  const [gameStage, setGameStage] = useState<string>('idle'); // idle, preflop, flop, turn, river
  const [dealingMode, setDealingMode] = useState<boolean>(false);

  const deckRef = useRef<Deck>(new Deck());

  const [results, setResults] = useState<(PlayerEquity | null)[] | null>(null);
  const [handResults, setHandResults] = useState<(HandResult | null)[]>([]);
  const [nuts, setNuts] = useState<HandDetails | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isRankingModalOpen, setIsRankingModalOpen] = useState<boolean>(false);
  const [editingSlot, setEditingSlot] = useState<{ type: 'player' | 'board', index: number, subIndex?: number } | null>(null);
  // editingSlot: { type: 'player'|'board', index: number, subIndex?: number }


  // Calculation Logic
  useEffect(() => {
    const timer = setTimeout(() => {
      calculateOdds();
      calculateNuts();
    }, 500);
    return () => clearTimeout(timer);
  }, [players, board, dealingMode]);

  const calculateOdds = () => {
    // Valid players must have 2 cards
    const validPlayers: { cards: string[]; index: number }[] = [];

    players.forEach((hand, idx) => {
      const cards = hand.filter(c => c) as string[];
      if (cards.length === 2) {
        validPlayers.push({ cards, index: idx });
      }
    });

    // If dealing mode, we need at least 2 players to calculate
    // If manual mode, we just need Hero (player 0)
    if (dealingMode) {
      if (validPlayers.length < 2) {
        setResults(null);
        return;
      }
    } else {
      // Manual mode: Need Hero to have cards
      const heroCards = players[0].filter(c => c) as string[];
      if (heroCards.length !== 2) {
        setResults(null);
        return;
      }
    }

    // Check duplicates common to both modes
    const allPlayerCards = dealingMode ? validPlayers.flatMap(p => p.cards) : (players[0].filter(c => c) as string[]);
    const allCards = [...allPlayerCards, ...board.filter(c => c) as string[]];
    const unique = new Set(allCards);
    if (unique.size !== allCards.length) {
      setResults(null);
      return;
    }

    try {
      if (dealingMode) {
        // ... (Existing Logic for Dealing Mode)
        const heroConfig = validPlayers[0];
        const villainConfigs = validPlayers.slice(1);

        const heroCards = heroConfig.cards;
        const villainHands = villainConfigs.map(v => v.cards);

        const boardCards = board.filter(c => c) as string[];

        const res = calculator.calculateEquity(heroCards, villainHands, boardCards, 5000);

        const newResults: (PlayerEquity | null)[] = Array(players.length).fill(null);
        newResults[heroConfig.index] = res.hero;
        res.villains.forEach((r, i) => {
          const originalIdx = villainConfigs[i].index;
          newResults[originalIdx] = r;
        });

        setResults(newResults);
      } else {
        // Manual "Hero vs Random" Mode
        const heroCards = players[0].filter(c => c) as string[];
        const boardCards = board.filter(c => c) as string[];
        const numOpponents = players.length - 1;

        if (numOpponents < 1) {
          setResults(null);
          return;
        }

        const res = calculator.calculateEquityAgainstRandom(heroCards, boardCards, numOpponents, 5000);

        // Results array: [HeroWin]
        // We only show result for Player 0
        const newResults: (PlayerEquity | null)[] = Array(players.length).fill(null);
        newResults[0] = res;
        setResults(newResults);
      }

    } catch (e) {
      console.error(e);
      setResults(null);
    }
  };

  const calculateNuts = () => {
    if (!dealingMode) {
      const boardCards = board.filter(c => c) as string[];
      if (boardCards.length === 5) {
        // Pass Hero cards to getNuts to calculate accurate nuts considering blocked cards
        const heroCards = players.length > 0 ? (players[0].filter(c => c) as string[]) : undefined;
        // We need to pass hero cards only if they are valid (2 cards)? getNuts handles partial.
        const n = calculator.getNuts(boardCards, heroCards);
        setNuts(n);
      } else {
        setNuts(null);
      }
    } else {
      setNuts(null);
    }
  };

  // Dealer Logic
  const toggleDealingMode = () => {
    setDealingMode(prev => !prev);
  };

  const handleDeal = () => {
    const deck = deckRef.current;

    // If starting a new hand (from idle or after river)
    if (gameStage === 'idle' || gameStage === 'river') {
      setGameStage('preflop');

      deck.reset();
      deck.shuffle();

      // Reset Board and Results
      setBoard([null, null, null, null, null]);
      setResults(null);
      setHandResults([]);

      // Deal to players (2 cards each)
      const newPlayers = players.map(() => {
        const c1 = deck.deal();
        const c2 = deck.deal();
        return [c1 ? c1.toString() : null, c2 ? c2.toString() : null] as (string | null)[];
      });
      setPlayers(newPlayers);
    }
    else if (gameStage === 'preflop') {
      // Deal Flop (3 cards)
      setGameStage('flop');
      const newBoard = [...board];
      const c1 = deck.deal();
      const c2 = deck.deal();
      const c3 = deck.deal();
      if (c1) newBoard[0] = c1.toString();
      if (c2) newBoard[1] = c2.toString();
      if (c3) newBoard[2] = c3.toString();
      setBoard(newBoard);
    }
    else if (gameStage === 'flop') {
      // Deal Turn (1 card)
      setGameStage('turn');
      const newBoard = [...board];
      const c = deck.deal();
      if (c) newBoard[3] = c.toString();
      setBoard(newBoard);
    }
    else if (gameStage === 'turn') {
      // Deal River (1 card)
      setGameStage('river');
      const newBoard = [...board];
      const c = deck.deal();
      if (c) newBoard[4] = c.toString();
      setBoard(newBoard);
    }
  };

  // Actions
  const handleSlotClick = (type: 'player' | 'board', index: number, subIndex = 0) => {
    if (dealingMode) return; // Disable manual edits
    setEditingSlot({ type, index, subIndex });
    setIsModalOpen(true);
  };

  const handleSelectCard = (card: string, closeModal: boolean = true) => {
    if (!editingSlot) return;
    const { type, index, subIndex } = editingSlot;

    if (type === 'board') {
      const newBoard = [...board];
      newBoard[index] = card;
      setBoard(newBoard);
    } else if (type === 'player') {
      const newPlayers = [...players];
      newPlayers[index] = [...newPlayers[index]];
      if (subIndex !== undefined) {
        newPlayers[index][subIndex] = card;
      }
      setPlayers(newPlayers);
    }
    if (closeModal) {
      setIsModalOpen(false);
    }
  };

  const handleRemoveCard = (type: 'player' | 'board', index: number, subIndex?: number) => {
    if (dealingMode) return;
    if (type === 'board') {
      const newBoard = [...board];
      newBoard[index] = null;
      setBoard(newBoard);
    } else if (type === 'player' && subIndex !== undefined) {
      const newPlayers = [...players];
      newPlayers[index][subIndex] = null;
      setPlayers(newPlayers);
    }
  }

  // Calculate final hand details for display
  useEffect(() => {
    const boardCards = board.filter(c => c) as string[];

    if (!dealingMode) {
      const heroCards = players.length > 0 ? (players[0].filter(c => c) as string[]) : [];
      if (heroCards.length === 2 && boardCards.length >= 3) {
        const validCards = heroCards.map(c => calculator.parseCard(c)).filter(c => c !== null) as unknown as import('./utils/deck').Card[];
        const validBoard = boardCards.map(c => calculator.parseCard(c)).filter(c => c !== null) as unknown as import('./utils/deck').Card[];

        const fullHand = [...validCards, ...validBoard];
        const det = calculator.getHandDetails(fullHand);

        if (det) {
          const res: (HandResult | null)[] = Array(players.length).fill(null);
          res[0] = {
            ...det,
            description: det.description,
            isWinner: false,
            isSplit: false
          };
          setHandResults(res);
          return;
        }
      }
      setHandResults([]);
      return;
    }

    // Trigger if we are effectively at the "River" (5 board cards)
    if (boardCards.length === 5) {
      const currentBoard = boardCards.map(c => calculator.parseCard(c)).filter(c => c !== null);

      // Calculate details for each player
      const details = players.map(hand => {
        const cards = hand.filter(c => c).map(c => calculator.parseCard(c)).filter(c => c !== null);
        if (cards.length !== 2) return null;

        // Ensure types align - parseCard returns Card | null. Filters remove nulls.
        // We need to cast or ensure TypeScript knows they are Cards.
        // Since we logic-filter above, we can assume non-null.

        // Actually calculator.parseCard can return null.
        // Let's refine the map.
        const validCards = cards as unknown as import('./utils/deck').Card[];
        const validBoard = currentBoard as unknown as import('./utils/deck').Card[];

        const fullHand = [...validCards, ...validBoard];
        const det = calculator.getHandDetails(fullHand);
        return det;
      });

      // Determine winner(s)
      let maxScore = -1;
      details.forEach(d => {
        if (d && d.score > maxScore) maxScore = d.score;
      });

      // const winnersCount = details.filter(d => d && d.score === maxScore).length;
      const winnersCount = details.filter(d => d && d.score === maxScore).length;
      const isSplit = winnersCount > 1;

      const fullRankNames = ['Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Jack', 'Queen', 'King', 'Ace'];

      const finalResults = details.map(d => {
        if (!d) return null;

        let description = d.description;
        const isWinner = d.score === maxScore;

        if (isWinner && !isSplit) {
          // Find the runner-up (best loser)
          let runnerUpScore = -1;
          let bestLoser: HandDetails | null = null;

          for (const other of details) {
            if (other && other.score < maxScore) {
              if (other.score > runnerUpScore) {
                runnerUpScore = other.score;
                bestLoser = other;
              }
            }
          }

          if (bestLoser) {
            // Check if runner-up has same hand type/ranks
            const sameType = bestLoser.type === d.type &&
              bestLoser.rank === d.rank &&
              bestLoser.subRank === d.subRank;

            if (sameType && d.kickers && d.kickers.length > 0) {
              // Compare kickers to find the first differentiator
              for (let i = 0; i < d.kickers.length; i++) {
                const myKicker = d.kickers[i];
                // safely access loser kicker (default to -1 if missing, causing myKicker to win)
                const loserKickers = bestLoser.kickers;
                const theirKicker = (loserKickers && loserKickers[i] !== undefined) ? loserKickers[i] : -1;

                if (myKicker > theirKicker) {
                  const kName = fullRankNames[myKicker];
                  description += `, ${kName} Kicker`;
                  break;
                }
              }
            }
          }
        }

        return {
          ...d,
          description: description,
          isWinner: isWinner,
          isSplit: isSplit && isWinner
        } as HandResult;
      });

      setHandResults(finalResults);
    } else {
      setHandResults([]);
    }
  }, [players, board, dealingMode]);

  const handleAddPlayer = () => {
    // Enabled in dealing mode per user request
    if (players.length < 10 && gameStage === 'idle') {
      setPlayers([...players, [null, null]]);
    }
  };

  const handleRemovePlayer = (index: number) => {
    // Enabled in dealing mode per user request
    if (players.length > 2) {
      const newPlayers = players.filter((_, i) => i !== index);
      setPlayers(newPlayers);
    }
  };

  const handleTotalPlayersChange = (newTotal: number) => {
    setPlayers(prev => {
      if (newTotal > prev.length) {
        const added = Array.from({ length: newTotal - prev.length }, () => [null, null] as (string | null)[]);
        return [...prev, ...added];
      } else if (newTotal < prev.length) {
        return prev.slice(0, newTotal);
      }
      return prev;
    });
  };

  const handleReset = () => {
    setPlayers(prev => prev.map(() => [null, null]));
    setBoard([null, null, null, null, null]);
    setResults(null);
    setGameStage('idle');
    setHandResults([]);
  };

  // Computed for Modal
  const takenCards = useMemo(() => {
    const t: string[] = [];
    players.flat().forEach(c => c && t.push(c));
    board.forEach(c => c && t.push(c));
    return t;
  }, [players, board]);

  // Handle tie percent extraction safely
  // The structure of 'results' is (PlayerEquity | null)[]
  // We want to find a tie percentage if available.
  // In manual mode, results[0] is the hero.
  // In dealing mode, we might just grab the first valid result's tie (since ties are equal for all involved usually, but here 'tie' means probability of tie).
  // Actually, 'tie' is the same for everyone in manual mode (hero ties vs random).
  // In dealing mode, tie probability might differ? No, usually not for the shared pot, but equity tie % is specific to the player tying with others.
  // The 'tiePercent' prop in Board expects a single number.
  // Let's take the first non-null result's tie.
  const tiePct = results && results.find(r => r)?.tie;

  return (
    <div className={`app-container ${dealingMode ? 'dealing-mode' : ''}`}>
      <div className="top-pannel"></div>
      <header style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <h1>Poker Odds Calculator</h1>
          <div
            title="Hand Rankings"
            onClick={() => setIsRankingModalOpen(true)}
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              border: '2px solid var(--text-secondary)',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.2s',
              userSelect: 'none'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent-color)';
              e.currentTarget.style.color = 'var(--accent-color)';
              e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--text-secondary)';
              e.currentTarget.style.color = 'var(--text-secondary)';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            ?
          </div>
        </div>
        <p>Calculate your equity instantly</p>
      </header>

      <main>
        {/* Board */}
        <div style={{ marginBottom: '2rem' }}>
          <Board
            cards={board}
            onCardClick={(i) => handleSlotClick('board', i)}
            onRemove={dealingMode ? undefined : (i) => handleRemoveCard('board', i)}
            tiePercent={tiePct}
            dealingMode={dealingMode}
            onToggleMode={toggleDealingMode}
            onDeal={handleDeal}
            onReset={handleReset}
            gameStage={gameStage}
          />
          {nuts && !dealingMode && (
            <div style={{
              textAlign: 'center',
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '8px',
              display: 'inline-block',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <span style={{ color: 'var(--text-secondary)', marginRight: '0.5rem' }}>Nuts:</span>
              <span style={{ fontWeight: 'bold', color: '#fbbf24' }}>{nuts.description}</span>
            </div>
          )}
        </div>

        {/* Players Grid */}
        <section className="players-section">
          {!dealingMode && (
            <div className="total-players-control" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
              <NumericStepper
                value={players.length}
                min={2}
                max={10}
                onChange={handleTotalPlayersChange}
                label="Total Players:"
              />
            </div>
          )}

          <div className="players-grid" style={!dealingMode ? { display: 'flex', justifyContent: 'center' } : {}}>
            {dealingMode ? (
              players.map((hand, i) => (
                <Hand
                  key={i}
                  label={`Player ${i + 1}`}
                  cards={hand}
                  winPercent={results && results[i] ? results[i]!.win : null}
                  handResult={handResults[i]}
                  onCardClick={(cardIdx) => handleSlotClick('player', i, cardIdx)}
                  onRemove={undefined}
                  onRemoveVillain={players.length > 2 ? () => handleRemovePlayer(i) : undefined}
                  isHero={false} // Removed "hero" distinction for styling
                  compact={false} // Always use full size for consistency
                />
              ))
            ) : (
              // Manual Mode: Only show Player 1 (Hero)
              <Hand
                key={0}
                label="Me"
                cards={players[0]}
                winPercent={results && results[0] ? results[0]!.win : null}
                handResult={handResults[0]}
                onCardClick={(cardIdx) => handleSlotClick('player', 0, cardIdx)}
                onRemove={(cardIdx) => handleRemoveCard('player', 0, cardIdx)}
                onRemoveVillain={undefined}
                isHero={true}
                compact={false}
              />
            )}
          </div>

          {dealingMode && (
            <button
              className="btn-secondary add-player-btn"
              onClick={handleAddPlayer}
              disabled={gameStage !== 'idle' || players.length >= 10}
              style={{
                opacity: (gameStage !== 'idle' || players.length >= 10) ? 0.5 : 1,
                cursor: (gameStage !== 'idle' || players.length >= 10) ? 'not-allowed' : 'pointer'
              }}
            >
              + Add Player
            </button>
          )}
        </section>
      </main>

      <CardSelectorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectCard={handleSelectCard}
        takenCards={takenCards}
      />

      <HandRankingModal
        isOpen={isRankingModalOpen}
        onClose={() => setIsRankingModalOpen(false)}
      />
    </div>
  )
}

export default App
