/* frontend/src/features/dashboard/CategoryDetails.js */
import React, { useState, useMemo } from 'react';
import { TransactionTable } from '../../components/TransactionTable';

export const CategoryDetails = ({ 
  transactions, 
  categories, 
  onUpdate, 
  onCreate, 
  onSplit 
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState(null);
  const [isFocused, setIsFocused] = useState(false);

  // 1. Get unique tags for the dropdown
  const filteredTags = categories
    .filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .map(c => c);

  // 2. Filter logic: Check if tag exists in the comma-separated list
  const relevantTransactions = useMemo(() => {
    if (!selectedTag) return [];
    return transactions.filter(t => {
      const tags = t.category ? t.category.split(', ') : [];
      return tags.includes(selectedTag.name);
    });
  }, [selectedTag, transactions]);

  // 3. Stats logic
  const stats = useMemo(() => {
    return relevantTransactions.reduce((acc, t) => {
      acc.total += t.amount;
      acc.count += 1;
      return acc;
    }, { total: 0, count: 0 });
  }, [relevantTransactions]);

  const handleSelect = (category) => {
    setSelectedTag(category);
    setSearchTerm(""); 
    setIsFocused(false);
  };

  const clearSelection = () => {
    setSelectedTag(null);
    setSearchTerm("");
  };

  return (
    <div className="summary-card" style={{ marginTop: '24px', minHeight: '180px', transition: 'all 0.3s ease' }}>
      <div className="flex-between" style={{ marginBottom: '20px' }}>
        <h3>Category Details</h3> 
        {selectedTag && (
          <button className="btn btn-secondary" onClick={clearSelection}>
            ✕ Clear Filter
          </button>
        )}
      </div>

      {/* SEARCH STATE */}
      {!selectedTag && (
        <div style={{ position: 'relative', maxWidth: '500px' }}>
          <div className="input-icon-wrapper" style={{ position: 'relative' }}>
             <svg style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input 
              type="text" 
              placeholder="Search for a category..." 
              value={searchTerm}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 200)} 
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '12px', border: '1px solid var(--border-color)' }}
            />
          </div>

          {isFocused && (
            <div className="tag-popover" style={{ position: 'absolute', top: '105%', left: 0, width: '100%', marginTop: '0', zIndex: 10 }}>
              <div className="tag-list" style={{ maxHeight: '200px' }}>
                {filteredTags.map(cat => (
                  <div key={cat.name} className="tag-option" onClick={() => handleSelect(cat)}>
                    <span>{cat.name}</span>
                    <span className="sub">{cat.type}</span>
                  </div>
                ))}
                {filteredTags.length === 0 && (
                  <div style={{ padding: '12px', color: '#94a3b8', textAlign: 'center' }}>No categories found</div>
                )}
              </div>
            </div>
          )}
          
          <div style={{ marginTop: '16px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Select a category to view spending history and totals.
          </div>
        </div>
      )}

      {/* RESULT STATE */}
      {selectedTag && (
        <div className="fade-in">
          {/* HEADER STATS */}
          <div style={{ 
            background: 'rgba(255,255,255,0.6)', 
            padding: '24px', 
            borderRadius: '16px', 
            border: '1px solid var(--border-color)',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '32px',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Category</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '4px' }}>
                {selectedTag.name}
                <span className={`tag-pill ${selectedTag.type.toLowerCase()}`} style={{ marginLeft: '12px', fontSize: '0.8rem', verticalAlign: 'middle' }}>
                  {selectedTag.type}
                </span>
              </div>
            </div>
            
            <div style={{ width: '1px', height: '50px', background: 'var(--border-color)' }}></div>
            
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Net Total</div>
              <div style={{ 
                fontSize: '1.75rem', 
                fontWeight: 800, 
                color: stats.total >= 0 ? 'var(--success)' : 'var(--danger)',
                marginTop: '4px'
              }}>
                {stats.total >= 0 ? '+' : '-'}${Math.abs(stats.total).toFixed(2)}
              </div>
            </div>

            <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)' }}>{stats.count}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Transactions</div>
            </div>
          </div>

          <h4 style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>Transaction History</h4>
          <TransactionTable 
            transactions={relevantTransactions} 
            categories={categories} 
            onUpdate={onUpdate}
            onCreateCategory={onCreate}
            onSplit={onSplit}
            isEditable={true} 
          />
        </div>
      )}
    </div>
  );
};