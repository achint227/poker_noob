import React from 'react';

const SUIT_ICONS: Record<string, string> = { 's': '♠', 'h': '♥', 'd': '♦', 'c': '♣' };

interface CardProps {
    rank: string | null;
    suit: string | null;
    isBig?: boolean;
}

const Card: React.FC<CardProps> = ({ rank, suit, isBig = false }) => {
    const icon = (suit && SUIT_ICONS[suit]) ? SUIT_ICONS[suit] : '?';

    // The current implementation of Card.js seemed to have a logic for `isBig` but return earlier.
    // However, looking at the logic: if (isBig) { ... } return ...; 
    // And then a default return.
    // The previous file had:
    /*
    if (isBig) {
        return (
            <div className="big-card" data-suit={suit}>
                ...
            </div>
        );
    }
    return (
        <React.Fragment>
            {rank}{icon}
        </React.Fragment>
    );
    */
    // I will preserve that logic.

    if (isBig) {
        return (
            <div className="big-card" data-suit={suit || undefined}>
                <div className="card-top-left">
                    <span className="big-rank">{rank}</span>
                    <span className="big-suit">{icon}</span>
                </div>
                <div className="card-center-suit">{icon}</div>
                <div className="card-bottom-right">
                    <span className="big-rank">{rank}</span>
                    <span className="big-suit">{icon}</span>
                </div>
            </div>
        );
    }

    return (
        <React.Fragment>
            {rank}{icon}
        </React.Fragment>
    );
};

export default Card;
