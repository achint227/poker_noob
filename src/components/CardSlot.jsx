import React from 'react';
import Card from './Card';

const CardSlot = ({ card, onClick, onRemove, selected }) => {
    // card is expected to be a string like "As" or null

    const rank = card ? card.slice(0, -1) : null;
    const suit = card ? card.slice(-1) : null;

    return (
        <div
            className={`card-slot ${card ? 'filled' : ''} ${selected ? 'selected' : ''}`} // Added 'selected' class support if we add it to CSS later
            data-suit={suit}
            onClick={onClick}
            style={selected ? { borderColor: 'var(--accent-color)', backgroundColor: 'rgba(59, 130, 246, 0.1)' } : {}}
        >
            {card ? <Card rank={rank} suit={suit} /> : null}

            {card && onRemove && (
                <div
                    className="remove-card-x"
                    onClick={(e) => {
                        e.stopPropagation();
                        onRemove();
                    }}
                >
                    ×
                </div>
            )}
        </div>
    );
};

export default CardSlot;
