import { useMemo } from 'react';

export const useAccountData = (allTransactions, accountType, categories = []) => {
  return useMemo(() => {
    const typeMap = {};
    categories.forEach(c => {
      typeMap[c.name] = c.type;
    });

    const accountTxns = allTransactions
      .filter(t => t.account_type === accountType)
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    let totalIn = 0;
    let totalOut = 0;
    
    const netChange = accountTxns.reduce((acc, t) => acc + t.amount, 0);

    accountTxns.forEach(t => {
      let primaryTag = "Uncategorized";
      if (Array.isArray(t.category)) {
        primaryTag = t.category[0] || "Uncategorized";
      } else if (typeof t.category === 'string') {
        primaryTag = t.category.split(',')[0] || "Uncategorized";
      }

      const type = typeMap[primaryTag];
      
      if (accountType === 'Savings') {
        if (t.amount > 0) totalIn += t.amount;
        else totalOut += Math.abs(t.amount);
      } 
      else if (accountType === 'Visa') {
        if (t.amount < 0) {
          totalOut += Math.abs(t.amount);
        } else {
          totalIn += t.amount;
        }
      } 
      else {
        if (type === 'Passthrough') return;

        if (t.amount > 0) totalIn += t.amount;
        else totalOut += Math.abs(t.amount);
      }
    });

    return {
      transactions: accountTxns,
      stats: {
        totalIn,
        totalOut,
        netChange
      }
    };
  }, [allTransactions, accountType, categories]);
};