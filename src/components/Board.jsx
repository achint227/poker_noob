import React from 'react';
import CardSlot from './CardSlot';

const Board = ({ cards, onCardClick, onRemove, tiePercent, dealingMode, onToggleMode, onDeal, onReset, gameStage }) => {
    // get 5 slots, fill with cards or null
    const slots = Array(5).fill(null).map((_, i) => cards[i] || null);

    return (
        <section className="board-section" style={{ position: 'relative' }}>
            <div className="board-header" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '1rem', position: 'relative', height: '40px' }}>
                <h2 style={{ margin: 0 }}>Community Cards</h2>
                <button
                    className="btn-secondary"
                    onClick={onReset}
                    style={{
                        position: 'absolute',
                        right: 0,
                        padding: '0.25rem 0.75rem',
                        fontSize: '0.8rem',
                        height: '32px'
                    }}
                >
                    Reset
                </button>
            </div>

            <div className="cards-container" id="board-container">
                {slots.map((card, index) => (
                    <CardSlot
                        key={index}
                        card={card}
                        onClick={() => onCardClick(index)}
                        onRemove={onRemove ? () => onRemove(index) : null}
                    />
                ))}
            </div>

            <div className="board-footer" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '1.5rem',
                padding: '0 0.5rem',
                minHeight: '48px' // Consistent height
            }}>
                {/* Left: Mode Toggle */}
                <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-start' }}>
                    <div className="mode-toggle-compact" onClick={onToggleMode} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                        <div className={`toggle-switch ${dealingMode ? 'on' : ''}`}>
                            <div className="toggle-knob"></div>
                        </div>
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Dealing Mode</span>
                    </div>
                </div>

                {/* Center: Tie Percentage */}
                <div className="tie-display" style={{
                    flex: 1,
                    display: 'flex',
                    justifyContent: 'center',
                    color: 'var(--text-secondary)',
                    textAlign: 'center'
                }}>
                    {dealingMode && tiePercent !== undefined && tiePercent !== null && (
                        <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                            Split:
                            <strong style={{
                                color: 'var(--text-primary)',
                                width: '4.5rem', /* Fixed width to accommodate "100.0%" */
                                display: 'inline-block',
                                textAlign: 'left',
                                paddingLeft: '0.25rem',
                                fontVariantNumeric: 'tabular-nums'
                            }}>
                                {tiePercent.toFixed(1)}%
                            </strong>
                        </span>
                    )}
                </div>

                {/* Right: Action Button */}
                <div className="action-button" style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
                    {dealingMode && (
                        <button className="btn-primary" onClick={onDeal} style={{ minWidth: '100px' }}>
                            {gameStage === 'idle' || gameStage === 'river' ? 'Deal Hand' :
                                gameStage === 'preflop' ? 'Deal Flop' :
                                    gameStage === 'flop' ? 'Deal Turn' : 'Deal River'}
                        </button>
                    )}
                </div>
            </div>
        </section>
    );
};

export default Board;
