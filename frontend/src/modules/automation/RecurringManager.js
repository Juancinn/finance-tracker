import React, { useMemo } from 'react';
import './Automation.css';

export const RecurringManager = ({ transactions }) => {
  const subscriptions = useMemo(() => {
    const groups = {};
    
    transactions.forEach(t => {
      if (t.amount >= 0) return;
      if (t.category === 'Passthrough') return;

      const key = t.description.toLowerCase().trim();
      if (!groups[key]) groups[key] = [];
      groups[key].push(t);
    });

    const detected = [];
    
    Object.entries(groups).forEach(([name, txns]) => {
      if (txns.length < 2) return;

      const amounts = txns.map(t => Math.abs(t.amount));
      const firstAmount = amounts[0];
      const isConsistent = amounts.every(a => Math.abs(a - firstAmount) < 0.05);

      if (isConsistent) {
        txns.sort((a, b) => new Date(b.date) - new Date(a.date));
        const lastDate = new Date(txns[0].date);
        
        detected.push({
          id: name,
          name: txns[0].description, 
          amount: firstAmount,
          frequency: 'Monthly', 
          lastDate: lastDate.toISOString().split('T')[0],
          category: txns[0].category
        });
      }
    });

    return detected.sort((a, b) => b.amount - a.amount);
  }, [transactions]);

  return (
    <div className="automation-container">
      <h3 className="section-title">Active Subscriptions (Detected)</h3>
      
      <div className="sub-grid">
        {subscriptions.map(sub => (
          <div key={sub.id} className="sub-card">
            <div className="sub-header">
              <span className="sub-name">{sub.name}</span>
              <span className="sub-amount">${sub.amount.toFixed(2)}</span>
            </div>
            <div className="sub-footer">
              <span className="tag-pill tag-gray">{sub.category}</span>
              <span className="sub-date">Last: {sub.lastDate}</span>
            </div>
          </div>
        ))}
        
        {subscriptions.length === 0 && (
          <div className="empty-state">
            No recurring subscriptions detected yet.
          </div>
        )}
      </div>
    </div>
  );
};