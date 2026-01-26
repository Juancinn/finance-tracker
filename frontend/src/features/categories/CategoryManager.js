import React, { useState } from 'react';

export const CategoryManager = ({ categories, onRefresh }) => {
  const [newCat, setNewCat] = useState("");
  const [catType, setCatType] = useState("Expense");
  const [newRule, setNewRule] = useState("");
  const [ruleCat, setRuleCat] = useState("");

  const handleAddCategory = async () => {
    if (!newCat) return;
    await fetch('http://127.0.0.1:5000/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newCat, type: catType })
    });
    setNewCat("");
    onRefresh();
  };

  const handleAddRule = async () => {
    if (!newRule || !ruleCat) return;
    await fetch('http://127.0.0.1:5000/rules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keyword: newRule, category: ruleCat, subcategory: "General" })
    });
    setNewRule("");
    alert("Rule added! Transactions updated.");
    onRefresh();
  };

  const handleTypeChange = async (catName, newType) => {
    await fetch(`http://127.0.0.1:5000/categories/${catName}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: newType })
    });
    onRefresh();
  };

  const handleRename = async (oldName) => {
    const newName = window.prompt(`Rename "${oldName}" to:`, oldName);
    if (!newName || newName === oldName) return;

    const res = await fetch(`http://127.0.0.1:5000/categories/${oldName}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ new_name: newName })
    });
    if (res.ok) onRefresh();
  };

  const handleDelete = async (catName) => {
    if (!window.confirm(`Delete "${catName}"?`)) return;
    await fetch(`http://127.0.0.1:5000/categories/${catName}`, { method: 'DELETE' });
    onRefresh();
  };

  return (
    <div className="card">
      <h3>⚙️ Category Manager</h3>
      
      <div className="grid-2">
        <div>
          <div className="stat-label" style={{ marginBottom: '8px' }}>New Category</div>
          <div className="flex-gap">
            <input placeholder="Name" value={newCat} onChange={e => setNewCat(e.target.value)} style={{ flex: 1 }} />
            <select value={catType} onChange={e => setCatType(e.target.value)}>
              <option value="Expense">Expense</option>
              <option value="Income">Income</option>
              <option value="Passthrough">Passthrough</option>
            </select>
            <button className="btn btn-primary" onClick={handleAddCategory}>Add</button>
          </div>
        </div>

        <div>
          <div className="stat-label" style={{ marginBottom: '8px' }}>New Rule</div>
          <div className="flex-gap">
            <input placeholder="Keyword" value={newRule} onChange={e => setNewRule(e.target.value)} style={{ flex: 1 }} />
            <span>→</span>
            <select value={ruleCat} onChange={e => setRuleCat(e.target.value)}>
              <option value="">Choose Category...</option>
              {categories.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
            </select>
            <button className="btn btn-primary" onClick={handleAddRule}>Save</button>
          </div>
        </div>
      </div>

      <hr style={{ margin: "20px 0", borderTop: "1px solid #eee" }}/>

      <div className="stat-label" style={{ marginBottom: '10px' }}>Existing Categories</div>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map(c => (
              <tr key={c.name}>
                <td style={{ fontWeight: 500 }}>{c.name}</td>
                <td>
                  <select value={c.type} onChange={(e) => handleTypeChange(c.name, e.target.value)}>
                    <option value="Expense">Expense</option>
                    <option value="Income">Income</option>
                    <option value="Passthrough">Passthrough</option>
                  </select>
                </td>
                <td style={{ textAlign: "right" }}>
                  <button onClick={() => handleRename(c.name)} className="btn btn-link" style={{ marginRight: '15px' }}>Rename</button>
                  <button onClick={() => handleDelete(c.name)} className="btn btn-danger">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};