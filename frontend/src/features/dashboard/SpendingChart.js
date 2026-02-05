import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Extended "Modern Finance" Color Palette (Cyclical)
const COLORS = [
  '#3b82f6', // Blue
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#f97316', // Orange
  '#6366f1', // Indigo
  '#84cc16'  // Lime
];

// Custom Legend: Accepts 'data' directly to ensure accuracy
const CustomLegend = ({ data }) => {
  if (!data) return null;

  const top5 = data.slice(0, 5);
  const remaining = data.length > 5 ? data.slice(5).reduce((acc, curr) => acc + curr.value, 0) : 0;
  const remainingCount = data.length - 5;

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '16px', marginTop: '20px' }}>
      {top5.map((entry, index) => (
        <div key={`item-${index}`} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {/* Match the color logic from the Pie */}
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: COLORS[index % COLORS.length] }} />
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            {entry.name}
          </span>
        </div>
      ))}
      
      {remaining > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#cbd5e1' }} />
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
            +{remainingCount} others
          </span>
        </div>
      )}
    </div>
  );
};

export const SpendingChart = ({ transactions, categories }) => {
  const categoryTypes = {};
  categories.forEach(c => { categoryTypes[c.name] = c.type; });

  const dataMap = {};
  let totalTracked = 0;
  
  transactions.forEach(t => {
    // Split tags and use the first one for grouping
    const primaryCat = t.category.split(', ')[0] || 'Uncategorized';
    const catType = categoryTypes[primaryCat];
    const amount = parseFloat(t.amount); 

    // Filter: Expenses Only (exclude Passthrough/Income)
    if (amount < 0 && catType !== 'Passthrough' && catType !== 'Income') {
      if (!dataMap[primaryCat]) dataMap[primaryCat] = 0;
      dataMap[primaryCat] += Math.abs(amount);
      totalTracked += Math.abs(amount);
    }
  });

  // Sort: Highest spending first
  const sortedData = Object.keys(dataMap)
    .map(key => ({ name: key, value: dataMap[key] }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className="chart-card">
      <div className="flex-between" style={{ marginBottom: '10px' }}>
        <h3>Spending Breakdown</h3>
        {totalTracked > 0 && (
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, background: '#f1f5f9', padding: '4px 10px', borderRadius: '20px' }}>
            ${totalTracked.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </span>
        )}
      </div>
      
      {sortedData.length > 0 ? (
        <ResponsiveContainer width="100%" height="90%">
          <PieChart>
            <Pie
              data={sortedData}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={110}
              paddingAngle={2}
              dataKey="value"
              nameKey="name" // Explicitly tell Recharts to use 'name' as the key
              stroke="none"
            >
              {sortedData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]} 
                />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value) => `$${value.toFixed(2)}`}
              contentStyle={{ 
                borderRadius: '12px', 
                border: '1px solid var(--border-color)', 
                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                padding: '10px 16px'
              }}
              itemStyle={{ color: 'var(--text-main)', fontWeight: 600 }}
            />
            {/* PASS DATA EXPLICITLY TO LEGEND */}
            <Legend content={<CustomLegend data={sortedData} />} verticalAlign="bottom" />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '16px', opacity: 0.5 }}>
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
            <line x1="12" y1="22.08" x2="12" y2="12"></line>
          </svg>
          <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>No expenses in this period</div>
        </div>
      )}
    </div>
  );
};