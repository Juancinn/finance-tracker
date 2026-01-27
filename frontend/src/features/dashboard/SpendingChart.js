import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1919'];

export const SpendingChart = ({ transactions, categories }) => {
  const categoryTypes = {};
  categories.forEach(c => { categoryTypes[c.name] = c.type; });

  const dataMap = {};
  let totalTracked = 0;
  
  transactions.forEach(t => {
    const catName = t.category;
    const catType = categoryTypes[catName];
    const amount = parseFloat(t.amount); 

    if (amount < 0 && catType !== 'Passthrough' && catType !== 'Income') {
      if (!dataMap[catName]) dataMap[catName] = 0;
      dataMap[catName] += Math.abs(amount);
      totalTracked += Math.abs(amount);
    }
  });

  const data = Object.keys(dataMap)
    .map(key => ({ name: key, value: dataMap[key] }))
    .sort((a, b) => b.value - a.value); 

  return (
    <div className="chart-card">
      <div className="flex-between" style={{ marginBottom: '20px' }}>
        <h3>Spending Breakdown</h3>
        {totalTracked > 0 && (
          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            ${totalTracked.toFixed(0)} tracked
          </span>
        )}
      </div>
      
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height="90%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value) => `$${value.toFixed(2)}`}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            />
            <Legend verticalAlign="bottom" height={36} iconType="circle" />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '2rem', marginBottom: '10px' }}>💤</div>
          <div>
            {transactions.length > 0 
              ? "All transactions are Hidden (Income or Passthrough)" 
              : "No transactions found for this period"}
          </div>
        </div>
      )}
    </div>
  );
};