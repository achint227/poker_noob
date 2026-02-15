import React, { useState, useEffect } from 'react';
import Card from './Card';

const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
const SUITS = ['s', 'h', 'd', 'c'];

interface CardSelectorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectCard: (card: string) => void;
    takenCards?: string[];
}

const CardSelectorModal: React.FC<CardSelectorModalProps> = ({ isOpen, onClose, onSelectCard, takenCards = [] }) => {
    const [rankIndex, setRankIndex] = useState(12); // Default 'A'
    const [suitIndex, setSuitIndex] = useState(0); // Default 's'

    // Reset or defaults when opening
    useEffect(() => {
        if (isOpen) {
            // Logic to find a default available card...
            // Note: The logic in the JS file seemed incomplete/broken in the loop (it defined variables but didn't use them correctly to set state, or I misread).
            // Actually, checking the JS:
            /*
            for (let sOffset = 0; sOffset < 4; sOffset++) {
                // ...
                for (let rIdx = 12; rIdx >= 0; rIdx--) {
                   // ...
                   if (!takenCards.includes(code)) {
                        setRankIndex(rIdx);
                        setSuitIndex(sIdx);
                        found = true;
                        break;
                   }
                }
                if (found) break;
            }
            */
            // I will implement this logic.

            let found = false;
            // Start search from current selection if we can, but simpler to just search all.
            // Or use the logic to pick a default.

            for (let sOffset = 0; sOffset < 4; sOffset++) {
                const sIdx = (suitIndex + sOffset) % 4;
                const suitStr = SUITS[sIdx];

                for (let rIdx = 12; rIdx >= 0; rIdx--) {
                    const rankStr = RANKS[rIdx];
                    const code = rankStr + suitStr;
                    if (!takenCards.includes(code)) {
                        setRankIndex(rIdx);
                        setSuitIndex(sIdx);
                        found = true;
                        break;
                    }
                }
                if (found) break;
            }
        }
    }, [isOpen, takenCards]);

    if (!isOpen) return null;

    const currentRank = RANKS[rankIndex];
    const currentSuit = SUITS[suitIndex];
    const cardCode = currentRank + currentSuit;
    const isTaken = takenCards.includes(cardCode);

    const handleCycleSuit = () => {
        setSuitIndex((prev) => (prev + 1) % 4);
    };

    const handleChangeRank = (delta: number) => {
        setRankIndex((prev) => {
            let newIndex = prev + delta;
            if (newIndex < 0) newIndex = RANKS.length - 1;
            if (newIndex >= RANKS.length) newIndex = 0;
            return newIndex;
        });
    };

    const handleConfirm = () => {
        if (!isTaken) {
            onSelectCard(cardCode);
        }
    };

    return (
        <div className="modal" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="modal-content">
                <div className="modal-header">
                    <h3>Customize Card</h3>
                    <button className="close-modal" onClick={onClose}>&times;</button>
                </div>

                <div className="interactive-card-container">
                    <button className="control-btn" onClick={() => handleChangeRank(1)}>▲</button>

                    <div
                        className="big-card"
                        data-suit={currentSuit}
                        onClick={handleCycleSuit}
                        style={{ opacity: isTaken ? 0.5 : 1 }}
                    >
                        <Card rank={currentRank} suit={currentSuit} isBig={true} />
                    </div>

                    <button className="control-btn" onClick={() => handleChangeRank(-1)}>▼</button>
                </div>

                <div className="controls-guide">
                    <p>Click <strong>Suit</strong> to change</p>
                    <p>Use <strong>Arrows</strong> to change rank</p>
                </div>

                <div className="modal-footer">
                    <button
                        className="btn-primary"
                        disabled={isTaken}
                        onClick={handleConfirm}
                    >
                        {isTaken ? "Card Taken" : "Select Card"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CardSelectorModal;
