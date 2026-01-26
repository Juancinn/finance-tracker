import React from 'react';

export const DateFilter = ({ startDate, endDate, onDateChange, onClear }) => {
  return (
    <div className="card flex-gap" style={{ padding: '10px 15px', width: 'fit-content', marginBottom: '20px' }}>
      <span className="stat-label">Filter:</span>
      <input type="date" value={startDate} onChange={(e) => onDateChange('start', e.target.value)} />
      <span style={{ color: "#999" }}>to</span>
      <input type="date" value={endDate} onChange={(e) => onDateChange('end', e.target.value)} />
      
      {(startDate || endDate) && (
        <button onClick={onClear} className="btn btn-danger" style={{ fontSize: '0.9rem', marginLeft: '10px' }}>
          Clear
        </button>
      )}
    </div>
  );
};