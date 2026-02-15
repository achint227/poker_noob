import React from 'react';

const SUIT_ICONS = { 's': '♠', 'h': '♥', 'd': '♦', 'c': '♣' };

const Card = ({ rank, suit, isBig = false }) => {
    const icon = SUIT_ICONS[suit] || '?';

    if (isBig) {
        return (
            <div className="big-card" data-suit={suit}>
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
