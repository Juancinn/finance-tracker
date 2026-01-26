import { useMemo } from 'react';

export const useAccountStats = (transactions, accountType, categories = []) => {
  return useMemo(() => {
    // 1. Create a quick lookup for Category Types
    // Result: { "Rent": "Passthrough", "Groceries": "Expense" }
    const categoryTypes = {};
    categories.forEach(c => {
      categoryTypes[c.name] = c.type;
    });

    // 2. Filter transactions for this account
    const accountTxns = transactions.filter(t => t.account_type === accountType);

    let totalIn = 0;
    let totalOut = 0;

    accountTxns.forEach(t => {
      const type = categoryTypes[t.category];

      if (type === 'Passthrough') {
        return; 
      }

      if (t.amount > 0) totalIn += t.amount;
      if (t.amount < 0) totalOut += Math.abs(t.amount);
    });

    return {
      transactions: accountTxns,
      totalIn,
      totalOut,
      netChange: totalIn - totalOut
    };
  }, [transactions, accountType, categories]);
};