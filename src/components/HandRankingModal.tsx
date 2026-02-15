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
                <div className="modal-header" style={{ position: 'relative', justifyContent: 'center' }}>
                    <h3 style={{ margin: 0 }}>Hand Rankings</h3>
                    <button className="close-modal" onClick={onClose} style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)' }}>&times;</button>
                </div>

                <div className="hand-rankings-list">
                    {rankings.map((rank, index) => (
                        <div key={index} className="ranking-item" style={{
                            padding: '1rem 0',
                            borderBottom: index < rankings.length - 1 ? '1px solid var(--border-color)' : 'none',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: '1rem'
                        }}>
                            <div className="ranking-name-container">
                                <div style={{ fontWeight: 'bold', color: 'var(--primary)', fontSize: '1.1rem', display: 'flex', alignItems: 'center' }}>
                                    <span style={{ marginRight: '0.5rem', color: 'var(--text-secondary)' }}>{index + 1}.</span>
                                    {rank.name}
                                    <span style={{ fontSize: '0.8rem', marginLeft: '0.5rem', opacity: 0.7 }}>ⓘ</span>
                                </div>

                                <div className="ranking-description">
                                    {rank.desc}
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '4px', transform: 'scale(0.8)', transformOrigin: 'right center' }}>
                                {rank.sample.map((card, i) => (
                                    <div key={i} style={{ pointerEvents: 'none' }}>
                                        <CardSlot card={card} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="modal-footer" style={{ marginTop: '1rem' }}>
                    <button className="btn-secondary" onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    );
};

export default HandRankingModal;
