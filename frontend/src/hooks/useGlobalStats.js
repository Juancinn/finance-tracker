import { useMemo } from 'react';

export const useGlobalStats = (transactions, categories) => {
  return useMemo(() => {
    let income = 0;
    let expense = 0;

    const categoryTypes = {};
    categories.forEach(c => categoryTypes[c.name] = c.type);

    transactions.forEach(t => {
      let primaryCat = "Uncategorized";
      if (Array.isArray(t.category)) {
        primaryCat = t.category[0] || "Uncategorized";
      } else if (typeof t.category === 'string') {
        primaryCat = t.category.split(',')[0] || "Uncategorized";
      }

      const type = categoryTypes[primaryCat];

      const val = parseFloat(t.amount);
      if (type === 'Income') {
        income += val; 
      } else if (type === 'Expense') {
        expense += Math.abs(val); 
      } else if (!type && val < 0) {
        expense += Math.abs(val);
      } else if (!type && val > 0) {
        income += val;
      }
    });

    return {
      income,
      expense,
      net: income - expense
    };
  }, [transactions, categories]);
};