import React, { useState } from 'react';
import { useAccountStats } from '../../hooks/useAccountStats';
import { TransactionTable } from '../../components/TransactionTable';

export const AccountAccordion = ({ title, accountType, allTransactions, categories, onUpdateTransaction }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const { transactions, totalIn, totalOut, netChange } = useAccountStats(allTransactions, accountType, categories);

  const isCredit = accountType === 'Visa';
  const isEditable = accountType !== 'Savings';

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <div className="flex-between" onClick={() => setIsOpen(!isOpen)} style={{ padding: '20px', cursor: 'pointer' }}>
        <div className="flex-gap">
          <span>{isOpen ? "▼" : "▶"}</span>
          <h3 style={{ margin: 0 }}>{title}</h3>
        </div>

        <div className="flex-gap" style={{ gap: '20px' }}>
          <StatBadge label="Net (Real)" value={netChange} isNet={true} />
          <StatBadge label={isCredit ? "Paid Off" : "In"} value={totalIn} color="green" />
          <StatBadge label={isCredit ? "Spent" : "Out"} value={totalOut} color="red" />
        </div>
      </div>

      {isOpen && (
        <div style={{ borderTop: "1px solid #eee", padding: "20px", background: "#fcfcfc" }}>

          <TransactionTable 
            transactions={transactions} 
            categories={categories} 
            onUpdate={onUpdateTransaction}
            isEditable={isEditable} 
          />
          {!isEditable && (
            <div style={{ marginTop: "10px", fontSize: "12px", color: "#888" }}>
              * Savings transactions are read-only. Categorize transfers in the source account.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const StatBadge = ({ label, value, color, isNet }) => {
  const displayColor = isNet ? (value >= 0 ? "text-green" : "text-red") : (color === "green" ? "text-green" : "text-red");
  const prefix = isNet ? (value >= 0 ? "+" : "-") : (color === "red" ? "-" : "+");
  
  return (
    <div className="stat-badge">
      <div className="stat-label">{label}</div>
      <div className={`stat-val ${displayColor}`}>
        {prefix}${Math.abs(value).toFixed(2)}
      </div>
    </div>
  );
};