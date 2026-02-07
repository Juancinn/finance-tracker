import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { fetchTransactions } from './api/transactions';
import { AccountAccordion } from './features/dashboard/AccountAccordion';
import { SpendingChart } from './features/dashboard/SpendingChart';
import { CategoryManager } from './features/categories/CategoryManager';
import { DateFilter } from './features/dashboard/DateFilter';
import { CategoryDetails } from './features/dashboard/CategoryDetails';
import './styles/elements.css';
import './features/dashboard/Dashboard.css';

const IconSettings = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1.29 1.29 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
);

function App() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showManager, setShowManager] = useState(false);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [activeFilter, setActiveFilter] = useState("all"); 
  const [showDateModal, setShowDateModal] = useState(false);
  const [toast, setToast] = useState(null);

  // --- DATA LOADING ---
  const loadData = useCallback(async (manualStart = null, manualEnd = null) => {
    const s = manualStart !== null ? manualStart : dateRange.start;
    const e = manualEnd !== null ? manualEnd : dateRange.end;
    
    const txnData = await fetchTransactions(s, e);
    setTransactions(txnData);
    
    try {
      const catRes = await fetch('http://127.0.0.1:5001/categories');
      setCategories(await catRes.json());
    } catch (e) { console.error(e); }
  }, [dateRange]); 

  useEffect(() => { loadData(); }, [loadData]);

  // --- STATS CALCULATION (STRICT MATH) ---
  const stats = useMemo(() => {
    let net = 0, income = 0, expense = 0;
    const typeMap = {};
    categories.forEach(c => typeMap[c.name] = c.type);

    transactions.forEach(t => {
      // 1. Exclude Savings Account
      if (t.account_type === 'Savings') return;

      // 2. Resolve Type
      const primaryTag = t.category ? t.category.split(', ')[0] : 'Uncategorized';
      const type = typeMap[primaryTag];

      // 3. Exclude Passthrough (e.g. "Payment" category)
      if (type === 'Passthrough') return;

      // 4. Calculate
      if (type === 'Income') {
        // Explicit Income (Paycheck, Cashback) always counts
        income += t.amount;
        net += t.amount;
      } 
      else {
        // Handle Expense & Uncategorized
        if (t.amount < 0) {
          // Money Leaving = Spending
          expense += Math.abs(t.amount);
          net += t.amount;
        } else {
          // Money Entering (Positive)
          if (t.account_type === 'Chequing') {
            // Positive in Chequing = Income (e.g. E-Transfer from friend)
            income += t.amount;
            net += t.amount;
          } else {
            // Positive in Visa = Refund/Return
            // This REDUCES your total spending, it is not "Income"
            expense -= t.amount; 
            net += t.amount;
          }
        }
      }
    });
    
    return { net, income, expense };
  }, [transactions, categories]);

  // --- ACTIONS ---
  const handleFilterClick = async (filterType) => {
    setActiveFilter(filterType);
    let newStart = "";
    let newEnd = "";

    // Helper: Returns YYYY-MM-DD in LOCAL time (prevents off-by-one errors)
    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    if (filterType === 'all') {
      newStart = "";
      newEnd = "";
      showNotification("Showing all history");
    } 
    else if (filterType === 'month') {
      const now = new Date();
      // Set to the 1st day of the current month
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      newStart = formatDate(firstDay);
      newEnd = ""; // Empty implies "Present"
    }
    else if (filterType === '30days') {
      const d = new Date();
      d.setDate(d.getDate() - 30);
      newStart = formatDate(d);
      newEnd = ""; 
    } 
    else if (filterType === 'paycheck') {
      // 1. Fetch ALL data to find the reference point
      const allTxns = await fetchTransactions(); 
      
      // 2. Strict Search: Look for explicit "Paycheck" category first
      let lastPaycheck = allTxns.find(t => t.category === "Paycheck");
      
      // 3. Fallback: Look for any "Income" type category if specific "Paycheck" tag isn't used
      if (!lastPaycheck) {
         const incomeCats = categories.filter(c => c.type === 'Income').map(c => c.name);
         lastPaycheck = allTxns.find(t => incomeCats.includes(t.category));
      }

      if (lastPaycheck) {
        newStart = lastPaycheck.date;
        newEnd = "";
        showNotification(`Since ${lastPaycheck.category}: ${newStart}`);
      } else {
        showNotification("No previous Paycheck found");
        return; // Exit without changing the view
      }
    } 
    else if (filterType === 'custom') {
      setShowDateModal(true);
      return; // Stop here, wait for modal input
    }

    setDateRange({ start: newStart, end: newEnd });
    loadData(newStart, newEnd);
  };

  const applyCustomDate = (start, end) => {
    setDateRange({ start, end });
    loadData(start, end);
    setShowDateModal(false);
    setActiveFilter('custom');
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
    showNotification("Transaction updated");
  };

  // NEW: HANDLE SPLIT TRANSACTION
  const handleSplitTransaction = async (id, amount) => {
    try {
      const res = await fetch(`http://127.0.0.1:5000/transactions/${id}/split`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount })
      });
      
      if (!res.ok) throw new Error("Split failed");
      
      showNotification("Transaction split successfully");
      loadData(); // Refresh UI to show the new split items
    } catch (e) {
      showNotification("Error splitting transaction");
    }
  };

  // NEW: CREATE TAG ON THE FLY
  const handleCreateCategory = async (name) => {
    try {
      const res = await fetch('http://127.0.0.1:5000/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name, type: 'Passthrough' })
      });
      
      if (!res.ok) throw new Error("Failed");

      const catRes = await fetch('http://127.0.0.1:5000/categories');
      setCategories(await catRes.json());
      
      showNotification(`Created tag: "${name}"`);
      return true; 
    } catch (e) {
      showNotification("Error: Tag might already exist");
      return false;
    }
  };

  const showNotification = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="container">
      <div className="flex-between app-header">
        <div>
          <h1>Finance Dashboard</h1>
          <div className="header-subtitle">Overview & Transactions</div>
        </div>
        <button className="btn btn-pill" onClick={() => setShowManager(true)}>
          <IconSettings />
          <span>Categories</span>
        </button>
      </div>

      <div className="summary-row">
        <div className="summary-card">
          <div className="summary-label">Net Cash Flow</div>
          <div className={`summary-value ${stats.net >= 0 ? 'text-green' : 'text-red'}`}>
            {stats.net >= 0 ? '+' : '-'}${Math.abs(stats.net).toFixed(2)}
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-label">Total Income</div>
          <div className="summary-value text-green">${stats.income.toFixed(2)}</div>
        </div>
        <div className="summary-card">
          <div className="summary-label">Total Spending</div>
          <div className="summary-value text-red">${stats.expense.toFixed(2)}</div>
        </div>
      </div>

      <DateFilter 
        activeFilter={activeFilter} 
        onFilterChange={handleFilterClick} 
        dateRange={dateRange}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '100%', marginBottom: '40px' }}>
        <SpendingChart transactions={transactions} categories={categories} />

        <CategoryDetails
            transactions={transactions} 
            categories={categories}
            onUpdate={handleUpdateTransaction}
            onCreate={handleCreateCategory}
            onSplit={handleSplitTransaction}
          />

      </div>


      <h3 style={{ marginBottom: '20px', color: 'var(--text-muted)' }}>Accounts</h3>

      <AccountAccordion 
        title="Chequing" 
        accountType="Chequing" 
        allTransactions={transactions} 
        categories={categories} 
        onUpdateTransaction={handleUpdateTransaction}
        onCreateCategory={handleCreateCategory} 
        onSplit={handleSplitTransaction}
      />
      <AccountAccordion 
        title="Savings" 
        accountType="Savings" 
        allTransactions={transactions} 
        categories={categories} 
        onUpdateTransaction={handleUpdateTransaction}
        onCreateCategory={handleCreateCategory} 
        onSplit={handleSplitTransaction}
      />
      <AccountAccordion 
        title="Visa Card" 
        accountType="Visa" 
        allTransactions={transactions} 
        categories={categories} 
        onUpdateTransaction={handleUpdateTransaction}
        onCreateCategory={handleCreateCategory} 
        onSplit={handleSplitTransaction}
      />

      {showManager && (
        <div className="modal-overlay" onClick={() => setShowManager(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="flex-between" style={{ marginBottom: '20px' }}>
              <h2 style={{margin:0}}>Categories</h2>
              <button className="btn btn-pill" onClick={() => setShowManager(false)}>Close</button>
            </div>
            <CategoryManager categories={categories} onRefresh={loadData} onNotify={showNotification} />
          </div>
        </div>
      )}

      {showDateModal && (
        <div className="modal-overlay" onClick={() => setShowDateModal(false)}>
          <div className="modal-content" style={{ width: '400px' }} onClick={e => e.stopPropagation()}>
            <h2 style={{marginTop: 0}}>Custom Range</h2>
            
            <div className="date-input-group">
              <label>From</label>
              <input type="date" id="custom-start" defaultValue={dateRange.start} />
            </div>
            
            <div className="date-input-group">
              <label>To</label>
              <input type="date" id="custom-end" defaultValue={dateRange.end} />
            </div>

            <div className="flex-between" style={{ marginTop: '20px' }}>
              <button className="btn btn-pill" onClick={() => setShowDateModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => {
                const s = document.getElementById('custom-start').value;
                const e = document.getElementById('custom-end').value;
                applyCustomDate(s, e);
              }}>Apply Filter</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

export default App;