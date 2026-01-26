const API_URL = 'http://127.0.0.1:5000';

export const fetchTransactions = async (startDate, endDate) => {
  try {
    let url = `${API_URL}/transactions`;
    if (startDate && endDate) {
      url += `?start=${startDate}&end=${endDate}`;
    }

    const response = await fetch(url);
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  } catch (error) {
    console.error("API Error:", error);
    return [];
  }
};