const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

function getHeaders(): HeadersInit {
  const token = typeof window !== 'undefined'
      ? localStorage.getItem('token')
      : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: `HTTP ${res.status}` }));
    throw new Error(error.message || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function createSale(data: any) {
  try {
    const res = await fetch(`${API_URL}/api/billing/sales`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<any>(res);
  } catch {
    console.warn('Backend not reachable — mock sale');
    return {
      sale_id: Math.floor(Math.random() * 9000) + 1000,
      invoice_number: data.invoice_number,
    };
  }
}

export async function processPayment(data: any) {
  try {
    const res = await fetch(`${API_URL}/api/billing/sales/payment`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<any>(res);
  } catch {
    console.warn('Backend not reachable — mock payment');
    return { success: true };
  }
}

export async function getAllSales() {
  try {
    const res = await fetch(`${API_URL}/api/billing/sales`, {
      headers: getHeaders(),
    });
    return handleResponse<any[]>(res);
  } catch {
    console.warn('Backend not reachable — mock data');
    return [];
  }
}

export async function getSaleById(id: number) {
  const res = await fetch(`${API_URL}/api/billing/sales/${id}`, {
    headers: getHeaders(),
  });
  return handleResponse<any>(res);
}

export async function cancelSale(id: number) {
  const res = await fetch(`${API_URL}/api/billing/sales/${id}/cancel`, {
    method: 'PATCH',
    headers: getHeaders(),
  });
  return handleResponse<any>(res);
}

export async function processReturn(data: any) {
  try {
    const res = await fetch(`${API_URL}/api/returns`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<any>(res);
  } catch {
    console.warn('Backend not reachable — mock return');
    return { success: true };
  }
}

export async function getAllReturns() {
  const res = await fetch(`${API_URL}/api/returns`, {
    headers: getHeaders(),
  });
  return handleResponse<any[]>(res);
}

export async function getReturnById(id: number) {
  const res = await fetch(`${API_URL}/api/returns/${id}`, {
    headers: getHeaders(),
  });
  return handleResponse<any>(res);
}

export async function searchProducts(query: string) {
  const res = await fetch(
      `${API_URL}/api/products/search?q=${encodeURIComponent(query)}`,
      { headers: getHeaders() }
  );
  return handleResponse<any[]>(res);
}

export async function getProductByBarcode(barcode: string) {
  const res = await fetch(
      `${API_URL}/api/products/barcode/${barcode}`,
      { headers: getHeaders() }
  );
  return handleResponse<any>(res);
}