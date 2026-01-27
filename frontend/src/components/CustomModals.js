import React, { useState } from 'react';
import '../styles/elements.css';

export const ConfirmModal = ({ title, message, onConfirm, onCancel }) => {
  return (
    <div className="modal-overlay z-top" onClick={onCancel}>
      <div className="modal-content mini" onClick={e => e.stopPropagation()}>
        <h3 style={{ marginTop: 0 }}>{title}</h3>
        <p style={{ color: 'var(--text-muted)', lineHeight: '1.5' }}>{message}</p>
        
        <div className="flex-between" style={{ marginTop: '24px' }}>
          <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
          <button className="btn btn-danger" 
            style={{ background: '#fee2e2', border: '1px solid #fecaca' }} 
            onClick={onConfirm}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export const PromptModal = ({ title, defaultValue, onSubmit, onCancel }) => {
  const [value, setValue] = useState(defaultValue);

  return (
    <div className="modal-overlay z-top" onClick={onCancel}>
      <div className="modal-content mini" onClick={e => e.stopPropagation()}>
        <h3 style={{ marginTop: 0 }}>{title}</h3>
        
        <div style={{ marginTop: '16px', marginBottom: '24px' }}>
          <input 
            autoFocus
            value={value} 
            onChange={(e) => setValue(e.target.value)} 
            onKeyDown={(e) => e.key === 'Enter' && onSubmit(value)}
          />
        </div>

        <div className="flex-between">
          <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
          <button className="btn btn-primary" onClick={() => onSubmit(value)}>Save</button>
        </div>
      </div>
    </div>
  );
};