const BASE_URL = 'http://127.0.0.1:5001';

export const financeService = {
  async fetchTransactions(start = "", end = "") {
    const params = new URLSearchParams();
    if (start) params.append('start', start);
    if (end) params.append('end', end);
    
    const response = await fetch(`${BASE_URL}/transactions?${params.toString()}`);
    if (!response.ok) throw new Error('Failed to fetch transactions');
    const data = await response.json();
    
    return data.map(t => ({
      ...t,
      id: parseInt(t.id, 10),
      amount: parseFloat(t.amount)
    }));
  },

  async updateTransaction(id, updates) {
    const response = await fetch(`${BASE_URL}/transactions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return response.ok;
  },

  async splitTransaction(id, amount) {
    const response = await fetch(`${BASE_URL}/transactions/${id}/split`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: parseFloat(amount) }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Split failed');
    }
    return response.json();
  },

  async fetchCategories() {
    const response = await fetch(`${BASE_URL}/categories`);
    if (!response.ok) throw new Error('Failed to fetch categories');
    return response.json();
  },

  async createCategory(name, type = 'Passthrough') {
    const response = await fetch(`${BASE_URL}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, type }),
    });
    if (!response.ok) throw new Error('Category already exists or invalid');
    return response.json();
  },

  async uploadCsv(file) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${BASE_URL}/import`, {
      method: 'POST',
      body: formData, 
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Upload failed');
    }
    return response.json();
  }
};