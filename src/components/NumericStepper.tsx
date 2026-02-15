import React from 'react';
import './NumericStepper.css';

interface NumericStepperProps {
    value: number;
    min: number;
    max: number;
    onChange: (value: number) => void;
    label?: string;
}

const NumericStepper: React.FC<NumericStepperProps> = ({ value, min, max, onChange, label }) => {
    const handleDecrement = () => {
        if (value > min) {
            onChange(value - 1);
        }
    };

    const handleIncrement = () => {
        if (value < max) {
            onChange(value + 1);
        }
    };

    return (
        <div className="numeric-stepper-container" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {label && <span className="stepper-label" style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{label}</span>}
            <div className="numeric-stepper">
                <button
                    className="stepper-btn"
                    onClick={handleDecrement}
                    disabled={value <= min}
                >
                    -
                </button>
                <span className="stepper-value">{value}</span>
                <button
                    className="stepper-btn"
                    onClick={handleIncrement}
                    disabled={value >= max}
                >
                    +
                </button>
            </div>
        </div>
    );
};

export default NumericStepper;
