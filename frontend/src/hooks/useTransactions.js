import { useState, useCallback } from 'react';
import { financeService } from '../api/financeService';

export const useTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadTransactions = useCallback(async (start = "", end = "") => {
    setLoading(true);
    try {
      const data = await financeService.fetchTransactions(start, end);
      setTransactions(data);
    } catch (err) {
      console.error("Error loading transactions:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateCategory = async (id, category, subcategory) => {
    const success = await financeService.updateTransaction(id, { category, subcategory });
    if (success) {
      setTransactions(prev => prev.map(t => 
        t.id === id ? { ...t, category, subcategory } : t
      ));
    }
    return success;
  };

  const splitTransaction = async (id, amount) => {
    try {
      await financeService.splitTransaction(id, amount);
      await loadTransactions(); 
      return true;
    } catch (err) {
      alert(err.message);
      return false;
    }
  };

  return { transactions, loading, loadTransactions, updateCategory, splitTransaction };
};