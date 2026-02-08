import React, { useState } from 'react';
import { Ledger } from '../transactions/Ledger';
import './AccountGroup.css';

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
  <svg 
    width="20" height="20" viewBox="0 0 24 24" 
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
  >
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
    <line x1="1" y1="10" x2="23" y2="10"></line>
  </svg>
);

export const AccountGroup = ({ 
  title, 
  accountType, 
  data, 
  categories,
  onUpdate,
  onSplit
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { transactions, stats } = data;

  const isCredit = accountType === 'Visa' || accountType === 'Credit';
  const labelIn = isCredit ? "Paid" : "In";
  const labelOut = isCredit ? "Spent" : "Out";
  const isPositive = stats.netChange >= 0;
  const netClass = isPositive ? 'text-green' : 'text-black';

  return (
    <div className="account-group-container">
      <div className="account-header" onClick={() => setIsOpen(!isOpen)}>

        <div className="header-left">
          <div className="icon-wrapper"><IconWallet /></div>
          <div>
            <h2 className="account-title">{title}</h2>
            <span className="transaction-count">{transactions.length} transactions</span>
          </div>
        </div>
        
        <div className="header-right">
          <div className="mini-stat">
            <span className="mini-label">{labelIn}</span>
            <span className="mini-val text-green">${stats.totalIn.toFixed(2)}</span>
          </div>
          
          <div className="mini-stat">
            <span className="mini-label">{labelOut}</span>
            <span className="mini-val text-black">${stats.totalOut.toFixed(2)}</span>
          </div>
          
          <div className="net-stat">
            <span className={`net-val-large ${netClass}`}>
              {isPositive ? '+' : ''}{stats.netChange.toFixed(2)}
            </span>
          </div>
          
          <div className="chevron-wrapper">
            <IconChevron isOpen={isOpen} />
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="account-body">
          {transactions.length > 0 ? (
            <Ledger 
              transactions={transactions} 
              categories={categories}
              onUpdate={onUpdate}
              onSplit={onSplit}
            />
          ) : (
            <div className="empty-state">No transactions found.</div>
          )}
        </div>
      )}
    </div>
  );
};