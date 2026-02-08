import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import './SpendingChart.css';

const COLORS = [
  '#3b82f6', // Blue
  '#10b981', // Emerald
  '#8b5cf6', // Violet
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#6366f1', // Indigo
  '#84cc16'  // Lime
];

const RADIAN = Math.PI / 180;

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.05) return null; 

  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text 
      x={x} 
      y={y} 
      fill="white" 
      textAnchor="middle"      
      dominantBaseline="central" 
      fontSize="12" 
      fontWeight="700"
      style={{ pointerEvents: 'none' }} 
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const CustomLegend = ({ data }) => {
  if (!data) return null;

  const top5 = data.slice(0, 5);
  const remainingCount = data.length - 5;

  return (
    <div className="custom-legend">
      {top5.map((entry, index) => (
        <div key={`item-${index}`} className="legend-item">
          <div 
            className="legend-dot" 
            style={{ backgroundColor: COLORS[index % COLORS.length] }} 
          />
          <span className="legend-text">{entry.name}</span>
        </div>
      ))}
      
      {remainingCount > 0 && (
        <div className="legend-item muted">
          <div className="legend-dot dot-gray" />
          <span className="legend-text">+{remainingCount} others</span>
        </div>
      )}
    </div>
  );
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="glass-tooltip">
        <span className="tooltip-label">{data.name}</span>
        <span className="tooltip-value" style={{ color: data.fill }}>
          ${data.value.toFixed(2)}
        </span>
      </div>
    );
  }
  return null;
};

export const SpendingChart = ({ transactions, categories }) => {
  const { chartData, totalSpending } = useMemo(() => {
    const typeMap = {};
    categories.forEach(c => typeMap[c.name] = c.type);

    const totals = {};
    let total = 0;

    transactions.forEach(t => {
      if (t.account_type === 'Savings') return;
      if (t.amount >= 0) return; 

      let rawCategory = "Uncategorized";
      if (Array.isArray(t.category)) {
        rawCategory = t.category[0] || "Uncategorized";
      } else if (typeof t.category === 'string') {
        rawCategory = t.category.split(',')[0] || "Uncategorized";
      }

      const cleanCategory = rawCategory.replace(' (Split)', '');
      const type = typeMap[cleanCategory];

      if (type === 'Passthrough' || type === 'Income') return;

      const amount = Math.abs(t.amount);
      totals[cleanCategory] = (totals[cleanCategory] || 0) + amount;
      total += amount;
    });

    const data = Object.entries(totals)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    return { chartData: data, totalSpending: total };
  }, [transactions, categories]);

  if (chartData.length === 0) {
    return (
      <div className="chart-card empty-chart">
        <p className="text-muted">No expenses to analyze.</p>
      </div>
    );
  }

  return (
    <div className="chart-card">
      <div className="chart-header">
        <h3 className="chart-title">Spending Breakdown</h3>
        <div className="total-badge">
          ${totalSpending.toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </div>
      </div>

      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60} 
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
              nameKey="name"
              labelLine={false}
              label={renderCustomizedLabel}
              stroke="none" 
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend data={chartData} />} verticalAlign="bottom" />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};