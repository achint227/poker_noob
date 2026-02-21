import React, { useState, useEffect } from 'react';

const RANKS = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];
const SUITS = ['s', 'h', 'd', 'c'];
const SUIT_SYMBOLS: Record<string, string> = { s: '♠', h: '♥', d: '♦', c: '♣' };

interface CardSelectorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectCard: (card: string, closeModal?: boolean) => void;
    takenCards?: string[];
}

const CardSelectorModal: React.FC<CardSelectorModalProps> = ({ isOpen, onClose, onSelectCard, takenCards = [] }) => {
    const [selectedSuit, setSelectedSuit] = useState('s');
    const [selectedRank, setSelectedRank] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            setSelectedRank(null);
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

    const handleRandomCard = () => {
        const availableCards: string[] = [];
        for (let suit of SUITS) {
            for (let rank of RANKS) {
                const card = rank + suit;
                if (!takenCards.includes(card)) {
                    availableCards.push(card);
                }
            }
        }

        if (availableCards.length > 0) {
            const randomIndex = Math.floor(Math.random() * availableCards.length);
            const randomCard = availableCards[randomIndex];
            setSelectedSuit(randomCard.charAt(1)); // Highlight the suit of the randomly selected card
            setSelectedRank(randomCard.charAt(0)); // Highlight the rank of the randomly selected card
        }
    };

    const handleConfirm = () => {
        if (selectedRank && selectedSuit) {
            const cardCode = selectedRank + selectedSuit;
            if (!takenCards.includes(cardCode)) {
                onSelectCard(cardCode, true);
            }
        }
    };

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
                            const isActive = selectedRank === rank;
                            return (
                                <button
                                    key={rank}
                                    className={`rank-btn ${selectedSuit} ${isTaken ? 'taken' : ''} ${isActive ? 'active' : ''}`}
                                    disabled={isTaken}
                                    onClick={() => setSelectedRank(rank)}
                                >
                                    {rank}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="modal-footer" style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                    <button
                        className="random-card-btn"
                        onClick={handleRandomCard}
                        style={{ flex: 1, padding: '0.5rem', fontSize: '1.5rem', margin: 0 }}
                        title="Random Card"
                    >
                        🎲
                    </button>
                    <button
                        className="btn-primary"
                        onClick={handleConfirm}
                        disabled={!selectedRank}
                        style={{ flex: 1, padding: '0.5rem', fontSize: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        title="Confirm Selection"
                    >
                        ✓
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CardSelectorModal;
