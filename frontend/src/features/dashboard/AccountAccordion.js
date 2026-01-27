import React, { useState } from 'react';
import { useAccountStats } from '../../hooks/useAccountStats';
import { TransactionTable } from '../../components/TransactionTable';

// Clean SVG Icons
const IconChevron = ({ isOpen }) => (
  <svg 
    className={`chevron ${isOpen ? 'open' : ''}`} 
    width="20" height="20" viewBox="0 0 24 24" 
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
  >
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

const IconWallet = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
);

export const AccountAccordion = ({ title, accountType, allTransactions, categories, onUpdateTransaction }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { transactions, totalIn, totalOut, netChange } = useAccountStats(allTransactions, accountType, categories);
  
  const isCredit = accountType === 'Visa';
  const isEditable = accountType !== 'Savings';

  return (
    <div className="account-card">
      <div className="account-header" onClick={() => setIsOpen(!isOpen)}>
        
        {/* Left Side: Icon + Title */}
        <div className="account-title-group">
          <div className="account-icon"><IconWallet /></div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '1rem' }}>{title}</div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{transactions.length} transactions</div>
          </div>
        </div>

        {/* Right Side: Stats + Chevron */}
        <div className="badge-group">
          <div className="mini-stat">
            <div className="mini-label">{isCredit ? "Paid" : "In"}</div>
            <div className="mini-val text-green">${totalIn.toFixed(0)}</div>
          </div>
          <div className="mini-stat">
            <div className="mini-label">{isCredit ? "Spent" : "Out"}</div>
            <div className="mini-val text-red">${totalOut.toFixed(0)}</div>
          </div>
          <div className="mini-stat" style={{ marginRight: '10px' }}>
            <div className="mini-label">Net</div>
            <div className={`mini-val ${netChange >= 0 ? 'text-green' : 'text-red'}`}>
              {netChange >= 0 ? '+' : '-'}${Math.abs(netChange).toFixed(0)}
            </div>
          </div>
          
          <IconChevron isOpen={isOpen} />
        </div>
      </div>

      {isOpen && (
        <div className="account-details">
          <TransactionTable 
            transactions={transactions} 
            categories={categories} 
            onUpdate={onUpdateTransaction}
            isEditable={isEditable} 
          />
        </div>
      )}
    </div>
  );
};