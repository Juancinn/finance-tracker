import React from 'react';
import './StatsSummary.css';

export const StatsSummary = ({ net, income, expense }) => {
  const netClass = net >= 0 ? 'text-green' : 'text-black';

  return (
    <div className="netflow-container">
      <div className="summary-card">
        <span className="label">Net Cash Flow</span>
        <span className={`value ${netClass}`}>
          {net >= 0 ? '+' : ''}{net.toFixed(2)}
        </span>
      </div>
      
      <div className="summary-card">
        <span className="label">Total Income</span>
        <span className="value text-green">
          +${income.toFixed(2)}
        </span>
      </div>
      
      <div className="summary-card">
        <span className="label">Total Spending</span>
        <span className="value text-black">
          -${expense.toFixed(2)}
        </span>
      </div>
    </div>
  );
};