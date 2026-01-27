import React, { useState } from 'react';
import { ConfirmModal, PromptModal } from '../../components/CustomModals';

export const CategoryManager = ({ categories, onRefresh, onNotify }) => {
  const [newCat, setNewCat] = useState("");
  const [catType, setCatType] = useState("Expense");
  const [newRule, setNewRule] = useState("");
  const [ruleCat, setRuleCat] = useState("");

  const [confirmState, setConfirmState] = useState(null);
  const [promptState, setPromptState] = useState(null);   

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

  return (
    <div>      
      {/* ADD CATEGORY */}
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

      {/* ADD RULE */}
      <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', marginBottom: '20px' }}>
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

      <div className="stat-label" style={{ marginBottom: '10px' }}>Active Categories</div>
      
      <div className="table-wrapper" style={{ maxHeight: '400px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
        <table>
          <thead>
            <tr>
              <th style={{ paddingLeft: '20px' }}>Name</th>
              <th>Type</th>
              <th style={{ textAlign: 'right', paddingRight: '20px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map(c => (
              <tr key={c.name}>
                <td style={{ fontWeight: 500, paddingLeft: '20px' }}>{c.name}</td>
                <td>
                  <select 
                    value={c.type} 
                    onChange={(e) => handleTypeChange(c.name, e.target.value)}
                    style={{ padding: '4px 8px', fontSize: '0.85rem', width: 'auto' }}
                  >
                    <option value="Expense">Expense</option>
                    <option value="Income">Income</option>
                    <option value="Passthrough">Passthrough</option>
                  </select>
                </td>
                <td style={{ textAlign: "right", paddingRight: '20px' }}>
                  <button 
                    onClick={() => setPromptState({ item: c.name, value: c.name })} 
                    className="btn btn-secondary" 
                    style={{ marginRight: '8px', padding: '4px 10px', fontSize: '0.8rem' }}
                  >
                    Rename
                  </button>
                  <button 
                    onClick={() => setConfirmState({ item: c.name })} 
                    className="btn btn-secondary" 
                    style={{ color: 'var(--danger)', borderColor: '#fee2e2', padding: '4px 10px', fontSize: '0.8rem' }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {confirmState && (
        <ConfirmModal 
          title="Delete Category?" 
          message={`Are you sure you want to delete "${confirmState.item}"? This will revert all its transactions to Uncategorized.`}
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