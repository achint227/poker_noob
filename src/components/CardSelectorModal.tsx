import React, { useState, useEffect } from 'react';

const RANKS = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];
const SUITS = ['s', 'h', 'd', 'c'];
const SUIT_SYMBOLS: Record<string, string> = { s: '♠', h: '♥', d: '♦', c: '♣' };

interface CardSelectorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectCard: (card: string) => void;
    takenCards?: string[];
}

const CardSelectorModal: React.FC<CardSelectorModalProps> = ({ isOpen, onClose, onSelectCard, takenCards = [] }) => {
    const [selectedSuit, setSelectedSuit] = useState('s');

    useEffect(() => {
        if (isOpen) {
            // Find a suit that has available cards if possible
            for (let suit of SUITS) {
                const availableRanks = RANKS.filter(r => !takenCards.includes(r + suit));
                if (availableRanks.length > 0) {
                    setSelectedSuit(suit);
                    break;
                }
            }
        }
    }, [isOpen, takenCards]);

    if (!isOpen) return null;

    return (
        <div className="modal" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="modal-content card-selector-modal">
                <div className="modal-header">
                    <h3>Select Card</h3>
                    <button className="close-modal" onClick={onClose}>&times;</button>
                </div>

                <div className="card-selector-body">
                    <div className="suit-selector">
                        {SUITS.map(suit => (
                            <button
                                key={suit}
                                className={`suit-btn ${suit} ${selectedSuit === suit ? 'active' : ''}`}
                                onClick={() => setSelectedSuit(suit)}
                            >
                                {SUIT_SYMBOLS[suit]}
                            </button>
                        ))}
                    </div>

                    <div className="rank-selector">
                        {RANKS.map(rank => {
                            const cardCode = rank + selectedSuit;
                            const isTaken = takenCards.includes(cardCode);
                            return (
                                <button
                                    key={rank}
                                    className={`rank-btn ${selectedSuit} ${isTaken ? 'taken' : ''}`}
                                    disabled={isTaken}
                                    onClick={() => onSelectCard(cardCode)}
                                >
                                    {rank}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CardSelectorModal;
