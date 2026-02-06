import { useMemo } from 'react';

export const useAccountStats = (allTransactions, accountType, categories = []) => {
  return useMemo(() => {
    // 1. Create Lookup
    const categoryTypes = {};
    categories.forEach(c => {
      categoryTypes[c.name] = c.type;
    });

    // 2. Filter & Sort
    const accountTxns = allTransactions
      .filter(t => t.account_type === accountType)
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    let totalIn = 0;
    let totalOut = 0;
    let netChange = 0;

    accountTxns.forEach(t => {
      // A. Net Change always tracks real balance
      netChange += t.amount;

      // B. Resolve Type
      const primaryTag = t.category ? t.category.split(', ')[0] : 'Uncategorized';
      const type = categoryTypes[primaryTag];

      // --- LOGIC PER ACCOUNT TYPE ---

      if (accountType === 'Visa') {
        // === VISA ===
        // Hide Passthrough SPENDING (if any), but show Passthrough PAYMENTS
        if (t.amount < 0) {
           // Negative = Spending
           // (Optional: You could exclude Passthrough here if you transfer balance out, 
           // but usually negative Visa is always spending)
           totalOut += Math.abs(t.amount);
        } else {
           // Positive = Money Entering Visa
           if (type === 'Income' || type === 'Passthrough') {
             // Cashback (Income) OR Payment (Passthrough) -> "Paid"
             totalIn += t.amount;
           } else {
             // Refunds -> Reduce Spending
             totalOut -= t.amount; 
           }
        }
      }
      else if (accountType === 'Savings') {
        // === SAVINGS ===
        // Show EVERYTHING. 
        // A "Transfer" (Passthrough) is valid movement for Savings.
        if (t.amount > 0) totalIn += t.amount;
        else totalOut += Math.abs(t.amount);
      }
      else {
        // === CHEQUING (Default) ===
        // Exclude Passthrough. 
        // We don't want "Transfer to Savings" to look like "Spending".
        if (type === 'Passthrough') return;

        if (t.amount > 0) totalIn += t.amount;
        else totalOut += Math.abs(t.amount);
      }
    });

    return {
      transactions: accountTxns,
      totalIn,
      totalOut,
      netChange
    };
  }, [allTransactions, accountType, categories]);
};