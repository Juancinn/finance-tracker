import React, { useEffect, useState } from 'react';

export const RecurringBills = () => {
  const [bills, setBills] = useState([]);

  useEffect(() => {
    fetch('http://127.0.0.1:5000/automation/recurring')
      .then(res => res.json())
      .then(data => setBills(data))
      .catch(err => console.error(err));
  }, []);

  if (bills.length === 0) return null;

  return (
    <div className="card" style={{ background: "#fff5f5", borderColor: "#ffd6d6" }}>
      <h3 style={{ color: "#c0392b" }}>🔄 Detected Subscriptions</h3>
      <div className="auto-grid">
        {bills.map((bill, idx) => (
          <div key={idx} className="auto-card">
            <div style={{ fontWeight: 600 }}>{bill.name}</div>
            <div style={{ color: "#7f8c8d", fontSize: "0.85rem" }}>~${bill.avg_amount} / month</div>
          </div>
        ))}
      </div>
    </div>
  );
};