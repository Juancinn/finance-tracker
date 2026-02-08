import { useEffect, useState } from 'react';
import { useTransactions } from './hooks/useTransactions';
import { useCategories } from './hooks/useCategories';
import { useAccountData } from './hooks/useAccountData';
import { useGlobalStats } from './hooks/useGlobalStats';
import { financeService } from './api/financeService'; 
import { AccountGroup } from './modules/dashboard/AccountGroup';
import { StatsSummary } from './modules/dashboard/StatsSummary';
import { TimelineFilter } from './modules/dashboard/TimelineFilter';
import { SpendingChart } from './modules/dashboard/SpendingChart';
import { SplitModal } from './modules/transactions/SplitModal';
import { CategoryManager } from './modules/categories/CategoryManager';
import './styles/theme.css';
import './modules/dashboard/Dashboard.css';

function App() {
  const { transactions, loadTransactions, updateCategory, splitTransaction } = useTransactions();
  const { categories, loadCategories, addCategory } = useCategories();
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [activeFilter, setActiveFilter] = useState("all");
  const [splitTarget, setSplitTarget] = useState(null); 
  const [toast, setToast] = useState(null);
  const [showManager, setShowManager] = useState(false);

  useEffect(() => {
    loadCategories();
    loadTransactions(); 
  }, [loadCategories, loadTransactions]);

  const globalStats = useGlobalStats(transactions, categories);
  const chequingData = useAccountData(transactions, 'Chequing', categories);
  const savingsData = useAccountData(transactions, 'Savings', categories);
  const visaData = useAccountData(transactions, 'Visa', categories);

  const handleFilterChange = async (filterType) => {
    setActiveFilter(filterType);
    let newStart = "";
    
    const formatDate = (date) => {
      return date.toISOString().split('T')[0];
    };

    if (filterType === 'month') {
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      newStart = formatDate(firstDay);
      showNotification("Showing this month");
    } 
    else if (filterType === '30days') {
      const d = new Date();
      d.setDate(d.getDate() - 30);
      newStart = formatDate(d);
      showNotification("Showing last 30 days");
    }
    else if (filterType === 'paycheck') {
      try {
        const allTxns = await financeService.fetchTransactions();
        
        let lastPaycheck = allTxns.find(t => {
           const cats = Array.isArray(t.category) ? t.category : [];
           return cats.includes("Paycheck");
        });
        
        if (!lastPaycheck) {
          const incomeTypes = categories
            .filter(c => c.type === 'Income')
            .map(c => c.name);
            
          lastPaycheck = allTxns.find(t => {
            const cats = Array.isArray(t.category) ? t.category : [];
            return cats.some(tag => incomeTypes.includes(tag));
          });
        }

        if (lastPaycheck) {
          newStart = lastPaycheck.date;
          const displayCat = Array.isArray(lastPaycheck.category) 
            ? lastPaycheck.category[0] 
            : "Paycheck";
            
          showNotification(`Since ${displayCat}: ${newStart}`);
        } else {
          showNotification("No paycheck found in history");
          return; 
        }
      } catch (err) {
        console.error(err);
        showNotification("Error finding paycheck");
        return;
      }
    }
    else {
      newStart = "";
      showNotification("Showing all history");
    }

    setDateRange({ start: newStart, end: "" });
    loadTransactions(newStart, "");
  };

  const handleSplitConfirm = async (id, amount) => {
    const success = await splitTransaction(id, amount);
    if (success) {
      setSplitTarget(null);
      showNotification("Transaction split successfully");
    }
  };

  const handleUpdate = async (id, category, subcategory) => {
    const success = await updateCategory(id, category, subcategory);
    if (success) showNotification("Category updated");
  };

  const handleAddCategory = async (name, type) => {
    const success = await addCategory(name, type); 
    if (success) showNotification(`Created tag: ${name}`);
    return success;
  };

  const showNotification = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const targetTransaction = splitTarget 
    ? transactions.find(t => t.id === splitTarget) 
    : null;

  return (
    <div className="app-container">
      <header className="app-header">
        <div>
          <h1>Finance Tracker</h1>
          <div className="header-subtitle">Overview & Transactions</div>
        </div>

        <button className="btn-pill-outline" onClick={() => setShowManager(true)}>
          Manage Tags
        </button>
      </header>

      <TimelineFilter 
        activeFilter={activeFilter} 
        onFilterChange={handleFilterChange}
        onCustomClick={() => showNotification("Custom Range coming in Phase 3")} 
      />

      <StatsSummary 
        net={globalStats.net} 
        income={globalStats.income} 
        expense={globalStats.expense} 
      />

      <div className="dashboard-grid">
        <div className="accounts-column">
          <AccountGroup 
            title="Chequing" 
            accountType="Chequing" 
            data={chequingData} 
            categories={categories}
            onUpdate={handleUpdate}
            onSplit={setSplitTarget}
          />
          
          <AccountGroup 
            title="Savings" 
            accountType="Savings" 
            data={savingsData} 
            categories={categories}
            onUpdate={handleUpdate}
            onSplit={setSplitTarget}
          />
          
          <AccountGroup 
            title="Visa Card" 
            accountType="Visa" 
            data={visaData} 
            categories={categories}
            onUpdate={handleUpdate}
            onSplit={setSplitTarget}
          />
        </div>

        <div className="charts-column">
          <SpendingChart 
            transactions={transactions} 
            categories={categories} 
          />
        </div>
      </div>

      {splitTarget && (
        <SplitModal 
          transaction={targetTransaction} 
          onClose={() => setSplitTarget(null)} 
          onConfirm={handleSplitConfirm} 
        />
      )}

      <CategoryManager 
        isOpen={showManager}
        onClose={() => setShowManager(false)}
        categories={categories}
        onAdd={handleAddCategory}
      />

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

export default App;