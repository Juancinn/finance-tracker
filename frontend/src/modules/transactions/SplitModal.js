import React, { useState } from 'react';
import './SplitModal.css'; 

export const SplitModal = ({ transaction, onClose, onConfirm }) => {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const val = parseFloat(amount);
    
    if (isNaN(val) || val <= 0 || val >= Math.abs(transaction.amount)) {
      setError(`Please enter a value between 0 and ${Math.abs(transaction.amount).toFixed(2)}`);
      return;
    }

    onConfirm(transaction.id, val);
    onClose();
  };

  if (!transaction) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Split Transaction</h3>
        <p className="modal-subtitle">{transaction.description}</p>
        
        <div className="original-amount">
          Original: <strong>${Math.abs(transaction.amount).toFixed(2)}</strong>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Amount to split off:</label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              autoFocus
            />
            {error && <span className="error-text">{error}</span>}
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Confirm Split
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};