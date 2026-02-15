import React from 'react';
import Card from './Card';

interface CardSlotProps {
    card: string | null;
    onClick?: () => void;
    onRemove?: () => void;
    selected?: boolean;
}

const CardSlot: React.FC<CardSlotProps> = ({ card, onClick, onRemove, selected }) => {
    // card is expected to be a string like "As" or null

    const rank = card ? card.slice(0, -1) : null;
    const suit = card ? card.slice(-1) : null;

    return (
        <div
            className={`card-slot ${card ? 'filled' : ''} ${selected ? 'selected' : ''}`}
            data-suit={suit || undefined}
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
