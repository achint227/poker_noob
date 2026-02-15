import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { Calculator } from './utils/calculator'
import Hand from './components/Hand'
import Board from './components/Board'
import CardSelectorModal from './components/CardSelectorModal'
import { Deck } from './utils/deck'
import './index.css'

// Instantiate calculator once
const calculator = new Calculator();

function App() {
  // State
  const [players, setPlayers] = useState([[null, null], [null, null]]); // Start with 2 players
  const [board, setBoard] = useState([null, null, null, null, null]);
  const [gameStage, setGameStage] = useState('idle'); // idle, preflop, flop, turn, river
  const [dealingMode, setDealingMode] = useState(false);

  const deckRef = useRef(new Deck());

  const [results, setResults] = useState(null);
  const [handResults, setHandResults] = useState([]); // Array of { score, type, description, isWinner }

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  // editingSlot: { type: 'player'|'board', index: number, subIndex?: number }

  // Calculation Logic
  useEffect(() => {
    const timer = setTimeout(() => {
      calculateOdds();
    }, 500);
    return () => clearTimeout(timer);
  }, [players, board]);

  const calculateOdds = () => {
    // Valid players must have 2 cards
    const validPlayers = []; // array of { cards, index }

    players.forEach((hand, idx) => {
      const cards = hand.filter(c => c);
      if (cards.length === 2) {
        validPlayers.push({ cards, index: idx });
      }
    });

    // Need at least 2 players to calculate
    if (validPlayers.length < 2) {
      setResults(null);
      return;
    }

    // Check duplicates
    const allPlayerCards = validPlayers.flatMap(p => p.cards);
    const allCards = [...allPlayerCards, ...board.filter(c => c)];
    const unique = new Set(allCards);
    if (unique.size !== allCards.length) {
      setResults(null);
      return;
    }

    try {
      // Calculator expects: heroCards, villainsCards (array of arrays)
      // We will treat the first valid player as "hero" for the calculator's sake, 
      // but in reality we just want equity for everyone.
      // Actually, my calculator logic returns equity for hero and villains.
      // So let's just pass validPlayers[0] as hero, and rest as villains.

      const heroConfig = validPlayers[0];
      const villainConfigs = validPlayers.slice(1);

      const heroCards = heroConfig.cards;
      const villainHands = villainConfigs.map(v => v.cards);

      // Board
      const boardCards = board.filter(c => c);

      const res = calculator.calculateEquity(heroCards, villainHands, boardCards, 5000);

      // Map results back to original indices
      // res.hero corresponds to heroConfig.index
      // res.villains[i] corresponds to villainConfigs[i].index

      const newResults = Array(players.length).fill(null);

      newResults[heroConfig.index] = res.hero;

      res.villains.forEach((r, i) => {
        const originalIdx = villainConfigs[i].index;
        newResults[originalIdx] = r;
      });

      setResults(newResults);

    } catch (e) {
      console.error(e);
      setResults(null);
    }
  };

  // Dealer Logic
  const toggleDealingMode = () => {
    setDealingMode(prev => {
      const nextMode = !prev;
      if (!nextMode) {
        // Turning OFF dealing mode: reset stage, keep cards? or reset all?
        // Let's reset the stage to idle but keep the cards for analysis. 
        setGameStage('idle');
      } else {
        // Turning ON: Reset everything to start fresh
        handleReset();
      }
      return nextMode;
    });
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
      const newPlayers = players.map(() => [deck.deal().toString(), deck.deal().toString()]);
      setPlayers(newPlayers);
    }
    else if (gameStage === 'preflop') {
      // Deal Flop (3 cards)
      setGameStage('flop');
      const newBoard = [...board];
      newBoard[0] = deck.deal().toString();
      newBoard[1] = deck.deal().toString();
      newBoard[2] = deck.deal().toString();
      setBoard(newBoard);
    }
    else if (gameStage === 'flop') {
      // Deal Turn (1 card)
      setGameStage('turn');
      const newBoard = [...board];
      newBoard[3] = deck.deal().toString();
      setBoard(newBoard);
    }
    else if (gameStage === 'turn') {
      // Deal River (1 card)
      setGameStage('river');
      const newBoard = [...board];
      newBoard[4] = deck.deal().toString();
      setBoard(newBoard);
    }
  };

  // Actions
  const handleSlotClick = (type, index, subIndex = 0) => {
    if (dealingMode) return; // Disable manual edits
    setEditingSlot({ type, index, subIndex });
    setIsModalOpen(true);
  };

  const handleSelectCard = (card) => {
    if (!editingSlot) return;
    const { type, index, subIndex } = editingSlot;

    if (type === 'board') {
      const newBoard = [...board];
      newBoard[index] = card;
      setBoard(newBoard);
    } else if (type === 'player') {
      const newPlayers = [...players];
      newPlayers[index] = [...newPlayers[index]];
      newPlayers[index][subIndex] = card;
      setPlayers(newPlayers);
    }
    setIsModalOpen(false);
  };

  const handleRemoveCard = (type, index, subIndex) => {
    if (dealingMode) return;
    if (type === 'board') {
      const newBoard = [...board];
      newBoard[index] = null;
      setBoard(newBoard);
    } else if (type === 'player') {
      const newPlayers = [...players];
      newPlayers[index][subIndex] = null;
      setPlayers(newPlayers);
    }
  }

  // Calculate final hand details for display (only on River or when 5 cards are on board)
  useEffect(() => {
    const boardCards = board.filter(c => c);

    // Trigger if we are effectively at the "River" (5 board cards)
    if (boardCards.length === 5) {
      const currentBoard = boardCards.map(c => calculator.parseCard(c));

      // Calculate details for each player
      const details = players.map(hand => {
        const cards = hand.filter(c => c).map(c => calculator.parseCard(c));
        if (cards.length !== 2) return null;

        const fullHand = [...cards, ...currentBoard];
        const det = calculator.getHandDetails(fullHand);
        return det;
      });

      // Determine winner(s)
      let maxScore = -1;
      details.forEach(d => {
        if (d && d.score > maxScore) maxScore = d.score;
      });

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
          let bestLoser = null;

          details.forEach(other => {
            if (other && other.score < maxScore) {
              if (other.score > runnerUpScore) {
                runnerUpScore = other.score;
                bestLoser = other;
              }
            }
          });

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
                const theirKicker = (bestLoser.kickers && bestLoser.kickers[i] !== undefined) ? bestLoser.kickers[i] : -1;

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
        };
      });

      setHandResults(finalResults);
    } else {
      setHandResults([]);
    }
  }, [players, board]);

  const handleAddPlayer = () => {
    // Enabled in dealing mode per user request
    if (players.length < 9) {
      setPlayers([...players, [null, null]]);
    }
  };

  const handleRemovePlayer = (index) => {
    // Enabled in dealing mode per user request
    if (players.length > 2) {
      const newPlayers = players.filter((_, i) => i !== index);
      setPlayers(newPlayers);
    }
  };

  const handleReset = () => {
    setPlayers([[null, null], [null, null]]);
    setBoard([null, null, null, null, null]);
    setResults(null);
    setGameStage('idle');
    setHandResults([]);
  };

  // Computed for Modal
  const takenCards = useMemo(() => {
    const t = [];
    players.flat().forEach(c => c && t.push(c));
    board.forEach(c => c && t.push(c));
    return t;
  }, [players, board]);

  const tiePct = results && results.find(r => r)?.tie;

  return (
    <div className={`app-container ${dealingMode ? 'dealing-mode' : ''}`}>
      <div className="top-pannel"></div>
      <header>
        <h1>Poker Odds Calculator</h1>
        <p>Calculate your equity instantly</p>
      </header>

      <main>
        {/* Board */}
        <div style={{ marginBottom: '2rem' }}>
          <Board
            cards={board}
            onCardClick={(i) => handleSlotClick('board', i)}
            onRemove={(i) => handleRemoveCard('board', i)}
            tiePercent={tiePct}
            dealingMode={dealingMode}
            onToggleMode={toggleDealingMode}
            onDeal={handleDeal}
            onReset={handleReset}
            gameStage={gameStage}
          />
        </div>

        {/* Players Grid */}
        <section className="players-section">
          <div className="players-grid">
            {players.map((hand, i) => (
              <Hand
                key={i}
                label={`Player ${i + 1}`}
                cards={hand}
                winPercent={results && results[i] ? results[i].win : null}
                handResult={handResults[i]}
                onCardClick={(cardIdx) => handleSlotClick('player', i, cardIdx)}
                onRemove={(cardIdx) => handleRemoveCard('player', i, cardIdx)}
                onRemoveVillain={players.length > 2 ? () => handleRemovePlayer(i) : null}
                isHero={false} // Removed "hero" distinction for styling
                compact={false} // Always use full size for consistency
              />
            ))}
          </div>

          <button className="btn-secondary add-player-btn" onClick={handleAddPlayer}>
            + Add Player
          </button>
        </section>
      </main>

      <CardSelectorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectCard={handleSelectCard}
        takenCards={takenCards}
      />
    </div>
  )
}

export default App
