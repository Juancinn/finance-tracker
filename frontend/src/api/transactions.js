const API_URL = 'http://127.0.0.1:5001';

export const fetchTransactions = async (startDate, endDate) => {
  try {
    let url = `${API_URL}/transactions`;
    
    const params = new URLSearchParams();
    if (startDate) params.append('start', startDate);
    if (endDate) params.append('end', endDate);
    
    const queryString = params.toString();
    if (queryString) {
      url += `?${queryString}`;
    }

    const response = await fetch(url);
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  } catch (error) {
    console.error("API Error:", error);
    return [];
  }
};