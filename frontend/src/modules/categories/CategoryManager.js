import React, { useState } from 'react';
import { financeService } from '../../api/financeService';
import './CategoryManager.css';

const IconTrash = () => (
  <svg 
    width="20" 
    height="20" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>
);

export const CategoryManager = ({ isOpen, onClose, categories, onRefresh }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState('Expense');
  const [editingName, setEditingName] = useState(null); 
  const [txCount, setTxCount] = useState(0); 
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handlePillClick = (category) => {
    setEditingName(category.name);
    setName(category.name);
    setType(category.type);
    setTxCount(category.count || 0); 
  };

  const handleCancelEdit = () => {
    setEditingName(null);
    setName('');
    setType('Expense');
    setTxCount(0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      if (editingName) {
        const updates = {};
        if (name !== editingName) updates.new_name = name;
        if (type) updates.type = type;

        await financeService.updateCategory(editingName, updates);
      } else {
        await financeService.createCategory(name, type);
      }
      await onRefresh();
      handleCancelEdit();
    } catch (err) {
      console.error(err);
      alert("Action failed. Check console.");
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!editingName) return;
    if (!window.confirm(`Delete "${editingName}"?\n\nIt is used in ${txCount} transactions.`)) return;

    setLoading(true);
    try {
      await financeService.deleteCategory(editingName);
      await onRefresh();
      handleCancelEdit();
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
    setLoading(false);
  };

  const incomeCats = categories.filter(c => c.type === 'Income');
  const expenseCats = categories.filter(c => c.type === 'Expense');
  const passthroughCats = categories.filter(c => c.type === 'Passthrough');

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content category-modal" onClick={e => e.stopPropagation()}>
        
        <div className="modal-header">
          <h2>Manage Categories</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className={`action-zone ${editingName ? 'edit-mode' : ''}`}>
          <div className="zone-header">
            <span className="zone-label">
              {editingName ? `Editing: ${editingName}` : 'Add New Category'}
            </span>
            {editingName && (
              <span className="tx-count-pill">Used in {txCount} txns</span>
            )}
          </div>

          <form onSubmit={handleSubmit} className="action-form">
            <div className="input-row">
              <input 
                type="text" 
                placeholder="Category Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="snappy-input"
                autoFocus={!!editingName}
              />
              <select 
                value={type} 
                onChange={(e) => setType(e.target.value)}
                className="snappy-select"
              >
                <option value="Expense">Expense</option>
                <option value="Income">Income</option>
                <option value="Passthrough">Passthrough</option>
              </select>

              {editingName ? (
                <div className="btn-group">
                  <button 
                    type="button" 
                    className="btn-icon-danger" 
                    onClick={handleDelete}
                    title="Delete Category"
                    disabled={loading}
                  >
                    <IconTrash />
                  </button>
                  <button type="submit" className="btn-primary" disabled={loading}>
                    Save
                  </button>
                  <button type="button" className="btn-text" onClick={handleCancelEdit}>
                    Cancel
                  </button>
                </div>
              ) : (
                <button type="submit" className="btn-primary" disabled={loading || !name}>
                  {loading ? '...' : 'Add'}
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="library-zone">
          <Section 
            title="Income Sources" 
            items={incomeCats} 
            colorVar="--color-success" 
            lightColorVar="--color-success-light"
            onSelect={handlePillClick} 
            selectedName={editingName} 
          />
          <Section 
            title="Expenses" 
            items={expenseCats} 
            colorVar="--color-danger" 
            lightColorVar="--color-danger-light"
            onSelect={handlePillClick} 
            selectedName={editingName} 
          />
          <Section 
            title="Passthrough" 
            items={passthroughCats} 
            colorVar="--color-passthrough"      
            lightColorVar="--color-passthrough-light"
            onSelect={handlePillClick} 
            selectedName={editingName} 
          />
        </div>

      </div>
    </div>
  );
};

const Section = ({ title, items, colorVar, lightColorVar, onSelect, selectedName }) => (
  <div className="library-section">
    <h4 className="section-title">{title}</h4>
    <div className="tag-grid">
      {items.map(c => (
        <button
          key={c.name} 
          type="button"
          onClick={() => onSelect(c)}
          className={`tag-pill ${selectedName === c.name ? 'active' : ''}`}
          style={{ 
            '--pill-color': `var(${colorVar})`, 
            '--pill-color-light': `var(${lightColorVar})` 
          }}
        >
          {c.name}
        </button>
      ))}
      {items.length === 0 && <span className="empty-msg">No categories.</span>}
    </div>
  </div>
);