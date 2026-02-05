/* frontend/src/components/TransactionTable.js */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import '../styles/elements.css';

// --- SUB-COMPONENT: Split Popover ---
const SplitPopover = ({ transaction, onClose, onConfirm }) => {
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");

  const handleSplit = () => {
    const val = parseFloat(amount);
    if (!val || val <= 0) { setError("Enter valid amount"); return; }
    if (val >= Math.abs(transaction.amount)) { setError("Too high"); return; }
    
    onConfirm(transaction.id, val);
  };

  return createPortal(
    <div className="modal-overlay z-top" onClick={onClose}>
      <div className="modal-content mini" onClick={e => e.stopPropagation()}>
        <h3>Split Transaction</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
          Original: <strong>${Math.abs(transaction.amount).toFixed(2)}</strong><br/>
          Separate a portion into a new transaction.
        </p>

        <div className="input-group" style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.8rem', fontWeight: 600 }}>Amount to Separate</label>
          <input 
            type="number" 
            autoFocus
            placeholder="0.00" 
            value={amount}
            onChange={e => setAmount(e.target.value)}
            style={{ fontSize: '1.2rem', padding: '12px' }}
          />
          {error && <div style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '4px' }}>{error}</div>}
        </div>

        <div className="flex-between">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSplit}>Confirm Split</button>
        </div>
      </div>
    </div>,
    document.body
  );
};


// --- SUB-COMPONENT: Tag Selector (Kept same as previous step, just condensed here) ---
const TagSelector = ({ currentCategory, categories, onSave, onCreate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const currentTags = currentCategory ? currentCategory.split(', ').filter(t => t && t !== 'Uncategorized') : [];
  const [selectedTags, setSelectedTags] = useState(currentTags);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const getTagClass = (tagName) => {
    const cat = categories.find(c => c.name === tagName);
    return cat ? cat.type.toLowerCase() : 'passthrough';
  };

  const toggleTag = (tagName) => {
    if (selectedTags.includes(tagName)) setSelectedTags(prev => prev.filter(t => t !== tagName));
    else setSelectedTags(prev => [...prev, tagName]);
  };

  const handleOpen = (e) => {
    e.stopPropagation();
    if (!isOpen) {
      const rect = containerRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + 5, left: rect.left });
      setSearch("");
      setSelectedTags(currentTags);
    }
    setIsOpen(!isOpen);
  };

  const handleSave = useCallback(() => {
    const finalString = selectedTags.length > 0 ? selectedTags.join(', ') : 'Uncategorized';
    onSave(finalString);
    setIsOpen(false);
  }, [selectedTags, onSave]);

  useEffect(() => {
    const close = (e) => {
      if (isOpen && !e.target.closest('.tag-popover') && !e.target.closest('.tag-cell-container')) handleSave();
    };
    if (isOpen) window.addEventListener('mousedown', close);
    return () => window.removeEventListener('mousedown', close);
  }, [isOpen, handleSave]);

  useEffect(() => { if (isOpen && inputRef.current) inputRef.current.focus(); }, [isOpen]);

  const filtered = categories.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      <div className="tag-cell-container" ref={containerRef} onClick={handleOpen}>
        {currentTags.length > 0 ? (
          currentTags.map(tag => <span key={tag} className={`tag-pill ${getTagClass(tag)}`}>{tag}</span>)
        ) : (
          <span className="tag-pill passthrough">Uncategorized</span>
        )}
        <button className="tag-add-mini">+</button>
      </div>
      {isOpen && createPortal(
        <div className="tag-popover" style={{ top: pos.top, left: pos.left }} onClick={e => e.stopPropagation()}>
          <input ref={inputRef} className="tag-search" placeholder="Search tags..." value={search} onChange={e => setSearch(e.target.value)} 
            onKeyDown={async (e) => {
              if (e.key === 'Enter' && search) {
                await onCreate(search); toggleTag(search); setSearch("");
              }
            }}
          />
          <div className="tag-list">
            {filtered.map(c => {
              const isActive = selectedTags.includes(c.name);
              return (
                <div key={c.name} className={`tag-option ${isActive ? 'active' : ''}`} onClick={() => toggleTag(c.name)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div className={`checkbox ${isActive ? 'checked' : ''}`}>{isActive && '✓'}</div>
                    <span>{c.name}</span>
                  </div>
                  <span className="sub">{c.type}</span>
                </div>
              );
            })}
            {search && !filtered.find(c => c.name.toLowerCase() === search.toLowerCase()) && (
              <button className="tag-create-btn" onClick={async () => { await onCreate(search); toggleTag(search); setSearch(""); }}>+ Create "{search}"</button>
            )}
          </div>
        </div>, document.body
      )}
    </>
  );
};


// --- MAIN COMPONENT ---
export const TransactionTable = ({ transactions, categories, onUpdate, isEditable = true, onCreateCategory, onSplit }) => { // Added onSplit prop
  const [splitTarget, setSplitTarget] = useState(null);

  if (transactions.length === 0) return <div style={{ textAlign: "center", color: "#999", padding: "20px" }}>No transactions found</div>;

  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Description</th>
            <th>Amount</th>
            <th>Tags</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t) => (
            <tr key={t.id} className="txn-row">
              <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{t.date}</td>
              <td style={{ maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {t.description}
              </td>
              <td style={{ fontWeight: 600, color: t.amount > 0 ? 'var(--success)' : 'var(--text-main)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>${Math.abs(t.amount).toFixed(2)}</span>
                  
                  {/* SPLIT BUTTON (Only for Expenses/Editable) */}
                  {isEditable && (
                    <button 
                      className="btn-icon-hover" 
                      title="Split Transaction"
                      onClick={() => setSplitTarget(t)}
                    >
                      ✂️
                    </button>
                  )}
                </div>
              </td>
              <td>
                {isEditable ? (
                  <TagSelector 
                    currentCategory={t.category} categories={categories} 
                    onSave={(newTags) => onUpdate(t.id, newTags, t.subcategory)} onCreate={onCreateCategory}
                  />
                ) : (
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {t.category.split(', ').map(tag => <span key={tag} className="tag-pill passthrough">{tag}</span>)}
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* RENDER SPLIT MODAL IF OPEN */}
      {splitTarget && (
        <SplitPopover 
          transaction={splitTarget} 
          onClose={() => setSplitTarget(null)}
          onConfirm={(id, amount) => {
            onSplit(id, amount);
            setSplitTarget(null);
          }}
        />
      )}
    </div>
  );
};