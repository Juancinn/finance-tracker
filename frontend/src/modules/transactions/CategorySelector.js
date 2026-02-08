import React, { useState, useRef, useEffect } from 'react';
import './CategorySelector.css';

export const CategorySelector = ({ transactionId, currentCategories, allCategories, onUpdate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const popoverRef = useRef(null);

  const safeCategories = Array.isArray(currentCategories) 
    ? currentCategories 
    : (typeof currentCategories === 'string' && currentCategories ? currentCategories.split(',') : []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = (categoryName) => {
    const newCategories = safeCategories.includes(categoryName)
      ? safeCategories.filter(c => c !== categoryName) // Remove
      : [...safeCategories, categoryName];             // Add
    
    onUpdate(transactionId, newCategories);
  };

  const handleCreate = () => {
    if (!searchTerm) return;
    handleToggle(searchTerm);
    setSearchTerm("");
  };

  const filtered = allCategories.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="category-selector" ref={popoverRef}>
      {/* 1. The Pills Display */}
      <div className="category-pills" onClick={() => setIsOpen(true)}>
        {safeCategories.length > 0 ? (
          safeCategories.map(cat => (
            <span key={cat} className={`cat-pill ${cat === 'Income' ? 'green' : 'gray'}`}>
              {cat}
            </span>
          ))
        ) : (
          <span className="cat-placeholder">Select...</span>
        )}
        <button className="btn-mini-add">+</button>
      </div>

      {/* 2. The Popover */}
      {isOpen && (
        <div className="cat-popover">
          <input 
            autoFocus
            type="text" 
            className="cat-search" 
            placeholder="Search..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          
          <div className="cat-list">
            {filtered.map(c => {
              const isSelected = safeCategories.includes(c.name);
              return (
                <div 
                  key={c.id} 
                  className={`cat-option ${isSelected ? 'active' : ''}`}
                  onClick={() => handleToggle(c.name)}
                >
                  <span>{c.name}</span>
                  {isSelected && <span>✓</span>}
                </div>
              );
            })}
            
            {searchTerm && !filtered.find(c => c.name === searchTerm) && (
              <div className="cat-create" onClick={handleCreate}>
                Create "{searchTerm}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};