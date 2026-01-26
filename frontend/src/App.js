import React, { useEffect, useState, useCallback } from 'react';
import { fetchTransactions } from './api/transactions';
import { AccountAccordion } from './features/dashboard/AccountAccordion';
import { SpendingChart } from './features/dashboard/SpendingChart';
import { CategoryManager } from './features/categories/CategoryManager';
import { RecurringBills } from './features/automation/RecurringBills';
import { DateFilter } from './features/dashboard/DateFilter';
import './App.css';

function App() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showManager, setShowManager] = useState(false);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  const loadData = useCallback(async (start = "", end = "") => {
    const s = start || dateRange.start;
    const e = end || dateRange.end;
    
    const txnData = await fetchTransactions(s, e);
    setTransactions(txnData);
    
    try {
      const catRes = await fetch('http://127.0.0.1:5000/categories');
      setCategories(await catRes.json());
    } catch (e) { console.error(e); }
  }, [dateRange.start, dateRange.end]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleDateChange = (type, value) => {
    const newRange = { ...dateRange, [type]: value };
    setDateRange(newRange);
    if ((newRange.start && newRange.end) || (!newRange.start && !newRange.end)) {
      loadData(newRange.start, newRange.end);
    }
  };

  const clearDates = () => {
    const empty = { start: "", end: "" };
    setDateRange(empty);
    loadData(empty.start, empty.end);
  };

  const handleUpdateTransaction = async (id, newCategory, newSubcategory) => {
    setTransactions(prev => prev.map(t => 
      t.id === id ? { ...t, category: newCategory, subcategory: newSubcategory } : t
    ));
    await fetch(`http://127.0.0.1:5000/transactions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category: newCategory, subcategory: newSubcategory })
    });
  };

  return (
    <div className="container">
      <div className="flex-between" style={{ marginBottom: '30px' }}>
        <h1>Finance Dashboard</h1>
        <button 
          className="btn btn-secondary"
          onClick={() => setShowManager(!showManager)}
        >
          {showManager ? "Close Settings" : "⚙️ Manage Categories"}
        </button>
      </div>

      {showManager && <CategoryManager categories={categories} onRefresh={() => loadData()} />}

      <DateFilter 
        startDate={dateRange.start} 
        endDate={dateRange.end} 
        onDateChange={handleDateChange}
        onClear={clearDates}
      />

      <RecurringBills />
      <SpendingChart transactions={transactions} categories={categories} />

      <AccountAccordion 
        title="Chequing Account" 
        accountType="Chequing" 
        allTransactions={transactions} 
        categories={categories}
        onUpdateTransaction={handleUpdateTransaction}
      />
      <AccountAccordion 
        title="Savings Goals" 
        accountType="Savings" 
        allTransactions={transactions}
        categories={categories}
        onUpdateTransaction={handleUpdateTransaction}
      />
      <AccountAccordion 
        title="Visa Card" 
        accountType="Visa" 
        allTransactions={transactions} 
        categories={categories}
        onUpdateTransaction={handleUpdateTransaction}
      />
    </div>
  );
}

export default App;