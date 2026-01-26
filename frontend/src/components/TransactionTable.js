import React from 'react';

export const TransactionTable = ({ transactions, categories, onUpdate, isEditable = true }) => {
  const handleCategoryChange = (txnId, newCategory) => {
    onUpdate(txnId, newCategory, "General"); 
  };

  if (transactions.length === 0) return <div style={{ textAlign: "center", color: "#999", padding: "20px" }}>No transactions found</div>;

  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Description</th>
            <th>Category</th>
            <th style={{ textAlign: "right" }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map(t => (
            <tr key={t.id}>
              <td style={{ width: "90px", color: "#7f8c8d" }}>{t.date}</td>
              <td>{t.description}</td>
              <td style={{ width: "160px" }}>
                {isEditable ? (
                  <select 
                    value={t.category || "Uncategorized"} 
                    onChange={(e) => handleCategoryChange(t.id, e.target.value)}
                    style={{ width: '100%' }}
                  >
                    {categories.map(c => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                ) : (
                  <span style={{ fontSize: '0.9rem', color: '#555' }}>{t.category}</span>
                )}
              </td>
              <td style={{ textAlign: "right", fontWeight: 500 }} className={t.amount < 0 ? "text-red" : "text-green"}>
                ${Math.abs(t.amount).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};