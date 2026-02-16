import React from 'react';
import CardSlot from './CardSlot';

interface HandRankingModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const HandRankingModal: React.FC<HandRankingModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    const rankings = [
        {
            name: "Royal Flush",
            desc: "A, K, Q, J, 10, all the same suit.",
            sample: ["As", "Ks", "Qs", "Js", "Ts"]
        },
        {
            name: "Straight Flush",
            desc: "Five cards in a sequence, all in the same suit.",
            sample: ["9h", "8h", "7h", "6h", "5h"]
        },
        {
            name: "Four of a Kind",
            desc: "All four cards of the same rank.",
            sample: ["5c", "5d", "5h", "5s", "2d"]
        },
        {
            name: "Full House",
            desc: "Three of a kind with a pair.",
            sample: ["Ks", "Kc", "Kd", "7h", "7d"]
        },
        {
            name: "Flush",
            desc: "Any five cards of the same suit, but not in a sequence.",
            sample: ["Ad", "Jd", "8d", "4d", "2d"]
        },
        {
            name: "Straight",
            desc: "Five cards in a sequence, but not of the same suit.",
            sample: ["9c", "8d", "7h", "6s", "5c"]
        },
        {
            name: "Three of a Kind",
            desc: "Three cards of the same rank.",
            sample: ["Qs", "Qc", "Qh", "9d", "2s"]
        },
        {
            name: "Two Pair",
            desc: "Two different pairs.",
            sample: ["Js", "Jc", "4d", "4h", "9s"]
        },
        {
            name: "One Pair",
            desc: "Two cards of the same rank.",
            sample: ["Ts", "Th", "8c", "5d", "2h"]
        },
        {
            name: "High Card",
            desc: "When you haven't made any of the hands above, the highest card plays.",
            sample: ["Kd", "Qs", "7c", "4h", "2d"]
        },
    ];

    return (
        <div className="modal" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="modal-content" style={{ maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header" style={{ position: 'relative', justifyContent: 'center', flexDirection: 'column', alignItems: 'center', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
                    <h2 style={{ margin: 0, background: 'linear-gradient(to right, #60a5fa, #a78bfa)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Poker Hand Rankings</h2>
                    <button className="close-modal" onClick={onClose} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)' }}>&times;</button>
                </div>

                <div className="hand-rankings-list" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        {rankings.slice(0, 5).map((rank, index) => (
                            <div key={index} className="ranking-item" style={{
                                padding: '0.75rem',
                                borderBottom: index < 4 ? '1px solid var(--border-color)' : 'none',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                textAlign: 'center',
                                gap: '0.5rem'
                            }}>
                                <div className="ranking-name-container" style={{ width: '100%' }}>
                                    <div style={{ fontWeight: 'bold', color: 'var(--primary)', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', backgroundColor: 'var(--primary)', color: 'white', borderRadius: '50%', fontSize: '0.9rem', fontWeight: 'bold' }}>{index + 1}</span>
                                        {rank.name}
                                    </div>

                                    <div className="ranking-description" style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                                        {rank.desc}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '4px', transform: 'scale(0.8)' }}>
                                    {rank.sample.map((card, i) => (
                                        <div key={i} style={{ pointerEvents: 'none' }}>
                                            <CardSlot card={card} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        {rankings.slice(5).map((rank, index) => (
                            <div key={index + 5} className="ranking-item" style={{
                                padding: '0.75rem',
                                borderBottom: index < 4 ? '1px solid var(--border-color)' : 'none',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                textAlign: 'center',
                                gap: '0.5rem'
                            }}>
                                <div className="ranking-name-container" style={{ width: '100%' }}>
                                    <div style={{ fontWeight: 'bold', color: 'var(--primary)', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', backgroundColor: 'var(--primary)', color: 'white', borderRadius: '50%', fontSize: '0.9rem', fontWeight: 'bold' }}>{index + 6}</span>
                                        {rank.name}
                                    </div>

                                    <div className="ranking-description" style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                                        {rank.desc}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '4px', transform: 'scale(0.8)' }}>
                                    {rank.sample.map((card, i) => (
                                        <div key={i} style={{ pointerEvents: 'none' }}>
                                            <CardSlot card={card} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="modal-footer" style={{ marginTop: '1rem' }}>
                    <button className="btn-secondary" onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    );
};

export default HandRankingModal;
