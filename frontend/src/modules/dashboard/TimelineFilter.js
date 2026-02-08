import React from 'react';
import './TimelineFilter.css';

export const TimelineFilter = ({ activeFilter, onFilterChange, onCustomClick }) => {
  const filters = [
    { id: 'month', label: 'This Month' },
    { id: '30days', label: 'Last 30 Days' },
    { id: 'all', label: 'All Time' },
    { id: 'paycheck', label: 'Paycheck' },
  ];

  return (
    <div className="timeline-container">
      <div className="filter-group">
        {filters.map((f) => (
          <button
            key={f.id}
            className={`filter-pill ${activeFilter === f.id ? 'active' : ''}`}
            onClick={() => onFilterChange(f.id)}
          >
            {f.label}
          </button>
        ))}
        
        <button
          className={`filter-pill ${activeFilter === 'custom' ? 'active' : ''}`}
          onClick={onCustomClick}
        >
          Custom
        </button>
      </div>
    </div>
  );
};