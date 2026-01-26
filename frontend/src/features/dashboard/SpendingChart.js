import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1919'];

export const SpendingChart = ({ transactions, categories }) => {
  const categoryTypes = {};
  categories.forEach(c => { categoryTypes[c.name] = c.type; });

  const dataMap = {};
  
  transactions.forEach(t => {
    const catName = t.category;
    const catType = categoryTypes[catName];

    if (t.amount < 0 && catName !== 'Transfer' && catType !== 'Passthrough' && catType !== 'Income') {
      if (!dataMap[catName]) dataMap[catName] = 0;
      dataMap[catName] += Math.abs(t.amount);
    }
  });

  const data = Object.keys(dataMap).map(key => ({
    name: key,
    value: dataMap[key]
  }));

  if (data.length === 0) {
    return (
      <div className="card" style={{ textAlign: "center", color: "#999" }}>
        No spending data to visualize for this period.
      </div>
    );
  }

  return (
    <div className="card" style={{ height: "350px" }}>
      <h3 style={{ textAlign: "center" }}>Spending Breakdown</h3>
      <ResponsiveContainer width="100%" height="90%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};