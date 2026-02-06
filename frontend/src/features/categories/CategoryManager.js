import React, { useState, useMemo } from 'react';
import { ConfirmModal, PromptModal } from '../../components/CustomModals';

// --- SUB-COMPONENT: Reusable Table Section ---
const CategorySection = ({ title, data, themeColor, onTypeChange, onRename, onDelete }) => {
  if (!data || data.length === 0) return null;

  return (
    <div className="category-section">
      <div className="cat-section-header" style={{ borderLeft: `4px solid ${themeColor}` }}>
        <h4 style={{ margin: 0, color: '#334155' }}>{title}</h4>
        <span className="cat-count-badge">{data.length} tags</span>
      </div>
      
      <div className="table-wrapper" style={{ maxHeight: 'none', border: 'none' }}>
        <table className="clean-table">
          <tbody>
            {data.map(c => (
              <tr key={c.name}>
                <td style={{ paddingLeft: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{c.name}</span>
                    {/* TRANSACTION COUNT BADGE */}
                    <span className="tx-count-pill" title={`${c.count} transactions use this tag`}>
                      {c.count} instances
                    </span>
                  </div>
                </td>
                <td style={{ width: '140px' }}>
                  <select 
                    value={c.type} 
                    onChange={(e) => onTypeChange(c.name, e.target.value)}
                    className="mini-select"
                  >
                    <option value="Expense">Expense</option>
                    <option value="Income">Income</option>
                    <option value="Passthrough">Passthrough</option>
                  </select>
                </td>
                <td style={{ textAlign: "right", paddingRight: '16px', whiteSpace: 'nowrap' }}>
                  <button onClick={() => onRename(c.name)} className="btn-text">Rename</button>
                  <button onClick={() => onDelete(c.name)} className="btn-text danger">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---
export const CategoryManager = ({ categories, onRefresh, onNotify }) => {
  // ... (Your Existing State - UNTOUCHED) ...
  const [newCat, setNewCat] = useState("");
  const [catType, setCatType] = useState("Expense");
  const [newRule, setNewRule] = useState("");
  const [ruleCat, setRuleCat] = useState("");
  const [confirmState, setConfirmState] = useState(null);
  const [promptState, setPromptState] = useState(null);   

  // ... (Your Existing Handlers - UNTOUCHED) ...
  const handleAddCategory = async () => {
    if (!newCat) return;
    try {
      const res = await fetch('http://127.0.0.1:5000/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCat, type: catType })
      });
      if (!res.ok) throw new Error("Exists");
      setNewCat("");
      onRefresh();
      onNotify("Category added successfully");
    } catch (e) { onNotify("Error: Category might already exist"); }
  };

  const handleAddRule = async () => {
    if (!newRule || !ruleCat) return;
    await fetch('http://127.0.0.1:5000/rules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keyword: newRule, category: ruleCat })
    });
    setNewRule("");
    onRefresh();
    onNotify("Rule saved");
  };

  const executeDelete = async () => {
    const { item } = confirmState;
    await fetch(`http://127.0.0.1:5000/categories/${item}`, { method: 'DELETE' });
    onRefresh();
    onNotify("Category deleted");
    setConfirmState(null);
  };

  const executeRename = async (newName) => {
    const oldName = promptState.item;
    if (!newName || newName === oldName) {
      setPromptState(null);
      return;
    }
    const res = await fetch(`http://127.0.0.1:5000/categories/${oldName}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ new_name: newName })
    });
    if (res.ok) {
      onRefresh();
      onNotify("Category renamed");
    }
    setPromptState(null);
  };

  const handleTypeChange = async (catName, newType) => {
    await fetch(`http://127.0.0.1:5000/categories/${catName}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: newType })
    });
    onRefresh();
    onNotify(`Updated type to ${newType}`);
  };

  // --- NEW: Group Categories ---
  const grouped = useMemo(() => {
    return {
      Income: categories.filter(c => c.type === 'Income'),
      Expense: categories.filter(c => c.type === 'Expense'),
      Passthrough: categories.filter(c => c.type === 'Passthrough'),
    };
  }, [categories]);

  return (
    <div style={{ paddingBottom: '20px' }}>      
      
      {/* --- TOP FORMS (UNTOUCHED as requested) --- */}
      <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', marginBottom: '20px' }}>
        <div className="stat-label" style={{ marginBottom: '12px' }}>New Category</div>
        <div className="flex-gap">
          <input 
            placeholder="Category Name" 
            value={newCat} 
            onChange={e => setNewCat(e.target.value)} 
            style={{ flex: 2 }}
          />
          <select 
            value={catType} 
            onChange={e => setCatType(e.target.value)}
            style={{ flex: 1 }}
          >
            <option value="Expense">Expense</option>
            <option value="Income">Income</option>
            <option value="Passthrough">Passthrough</option>
          </select>
          <button className="btn btn-primary" onClick={handleAddCategory}>Add</button>
        </div>
      </div>

      <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', marginBottom: '30px' }}>
        <div className="stat-label" style={{ marginBottom: '12px' }}>New Automation Rule</div>
        <div className="flex-gap">
          <div style={{ flex: 2, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ color: '#64748b', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>If desc contains:</span>
            <input 
              placeholder="e.g. 'Spotify'" 
              value={newRule} 
              onChange={e => setNewRule(e.target.value)} 
              style={{ width: '100%' }}
            />
          </div>
          <div style={{ color: '#cbd5e1' }}>→</div>
          <div style={{ flex: 2, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ color: '#64748b', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>Set category to:</span>
            <select 
              value={ruleCat} 
              onChange={e => setRuleCat(e.target.value)}
              style={{ width: '100%' }}
            >
              <option value="">Select...</option>
              {categories.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          <button className="btn btn-primary" onClick={handleAddRule}>Save</button>
        </div>
      </div>
      {/* --- END OF UNTOUCHED FORMS --- */}

      <h3 style={{ marginBottom: '16px', color: 'var(--text-muted)' }}>Manage Categories</h3>

      {/* 1. INCOME */}
      <CategorySection 
        title="Income Sources" 
        data={grouped.Income} 
        themeColor="#10b981" // Green
        onTypeChange={handleTypeChange}
        onRename={(name) => setPromptState({ item: name, value: name })}
        onDelete={(name) => setConfirmState({ item: name })}
      />

      {/* 2. EXPENSES */}
      <CategorySection 
        title="Expenses" 
        data={grouped.Expense} 
        themeColor="#ef4444" // Red
        onTypeChange={handleTypeChange}
        onRename={(name) => setPromptState({ item: name, value: name })}
        onDelete={(name) => setConfirmState({ item: name })}
      />

      {/* 3. PASSTHROUGH */}
      <CategorySection 
        title="Passthrough / Transfers" 
        data={grouped.Passthrough} 
        themeColor="#94a3b8" // Grey
        onTypeChange={handleTypeChange}
        onRename={(name) => setPromptState({ item: name, value: name })}
        onDelete={(name) => setConfirmState({ item: name })}
      />

      {/* Modals */}
      {confirmState && (
        <ConfirmModal 
          title="Delete Category?" 
          // Show the count in the warning!
          message={`Are you sure you want to delete "${confirmState.item}"? It is currently used in ${categories.find(c => c.name === confirmState.item)?.count || 0} transactions.`}
          onConfirm={executeDelete} 
          onCancel={() => setConfirmState(null)} 
        />
      )}

      {promptState && (
        <PromptModal 
          title={`Rename "${promptState.item}"`}
          defaultValue={promptState.value}
          onSubmit={executeRename}
          onCancel={() => setPromptState(null)}
        />
      )}
    </div>
  );
};