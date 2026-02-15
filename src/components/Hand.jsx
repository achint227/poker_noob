import React from 'react';
import CardSlot from './CardSlot';

const Hand = ({
    cards,
    label,
    winPercent,
    handResult,
    onCardClick,
    onRemove,
    onRemoveVillain,
    isHero = false,
    compact = false
}) => {
    // cards is array [card1, card2]
    const isWinner = handResult?.isWinner;
    const isSplit = handResult?.isSplit;

    return (
        <div className={`player-card ${isHero ? 'hero' : 'villain'} ${compact ? 'compact' : ''} ${isWinner ? 'winner' : ''}`}>
            <div className={isHero ? '' : 'villain-header'}>
                <h2>{label}</h2>
                {!isHero && onRemoveVillain && (
                    <button className="remove-villain-btn" onClick={onRemoveVillain}>×</button>
                )}
            </div>

            <div className="cards-container">
                {cards.map((card, index) => (
                    <CardSlot
                        key={index}
                        card={card}
                        onClick={() => onCardClick(index)}
                        onRemove={onRemove ? () => onRemove(index) : null}
                    />
                ))}
            </div>

            <div className="stats">
                {handResult ? (
                    <div className="hand-result">
                        <span className="hand-description">{handResult.description}</span>
                        {isWinner && <span className="winner-badge">{isSplit ? 'SPLIT' : 'WINNER'}</span>}
                    </div>
                ) : (
                    <div className="equity-value">
                        {winPercent !== null ? `${winPercent.toFixed(2)}` : null}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Hand;
