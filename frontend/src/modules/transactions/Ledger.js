import { useState } from 'react';
import './Ledger.css';
import { CategorySelector } from './CategorySelector';

const IconScissors = () => (
  <svg 
    width="16" height="16" viewBox="0 0 24 24" 
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
  >
    <circle cx="6" cy="6" r="3"></circle>
    <circle cx="6" cy="18" r="3"></circle>
    <line x1="20" y1="4" x2="8.12" y2="15.88"></line>
    <line x1="14.47" y1="14.48" x2="20" y2="20"></line>
    <line x1="8.12" y1="8.12" x2="12" y2="12"></line>
  </svg>
);

export const Ledger = ({ transactions, categories, onUpdate, onSplit }) => {
  const [expandedId, setExpandedId] = useState(null);

  const toggleExpand = (id) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  return (
    <div className="ledger-container">
      <table className="ledger-table">
        <thead>
          <tr>
            <th className="col-date">Date</th>
            <th className="col-desc">Description</th>
            <th className="col-cat">Category</th>
            <th className="col-amount text-right">Amount</th>
            <th className="col-action text-center">Split</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t) => (
            <tr key={t.id} className="ledger-row">
              <td className="date-cell">{t.date}</td>
              
              <td 
                className="desc-cell" 
                title={t.description} 
                onClick={() => toggleExpand(t.id)}
              >
                <div className={`truncate-wrapper ${expandedId === t.id ? 'expanded' : ''}`}>
                  {t.description}
                </div>
              </td>
              
              <td className="cat-cell">
                <CategorySelector 
                  transactionId={t.id}
                  currentCategories={t.category} 
                  allCategories={categories}
                  onUpdate={(id, newCategories) => onUpdate(id, newCategories, "")} 
                />
              </td>
              
              <td className={`amount-cell text-right ${t.amount >= 0 ? 'text-green' : 'text-black'}`}>
                {t.amount >= 0 ? '+' : ''}{t.amount.toFixed(2)}
              </td>
              
              <td className="action-cell text-center">
                <button 
                  className="btn-icon" 
                  onClick={(e) => {
                    e.stopPropagation(); 
                    onSplit(t.id);
                  }}
                  title="Split Transaction"
                >
                  <IconScissors />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};