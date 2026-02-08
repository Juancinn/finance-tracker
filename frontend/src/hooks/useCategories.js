import { useState, useCallback } from 'react';
import { financeService } from '../api/financeService';

export const useCategories = () => {
  const [categories, setCategories] = useState([]);

  const loadCategories = useCallback(async () => {
    try {
      const data = await financeService.fetchCategories();
      setCategories(data);
    } catch (err) {
      console.error("Error loading categories:", err);
    }
  }, []);

  const addCategory = async (name, type = 'Passthrough') => {
    try {
      await financeService.createCategory(name, type);
      await loadCategories(); 
      return true;
    } catch (err) {
      console.error("Add category failed:", err);
      return false;
    }
  };

  return { categories, loadCategories, addCategory };
};