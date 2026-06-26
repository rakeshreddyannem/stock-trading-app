// API Client for SB Stocks Virtual Trading Simulation

async function request(path, options = {}, token = null) {
  const headers = {
    "Content-Type": "application/json",
  };
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(path, {
      headers,
      ...options,
    });
  } catch (err) {
    throw new Error("Network error: Could not reach the backend. Please verify that the backend server is running.");
  }

  const contentType = response.headers.get("content-type");
  let data = null;

  if (contentType && contentType.includes("application/json")) {
    try {
      data = await response.json();
    } catch (e) {
      throw new Error("Invalid response format received from server.");
    }
  } else {
    const text = await response.text();
    throw new Error(text || `Server error: Status code ${response.status}`);
  }

  if (!response.ok) {
    throw new Error(data?.message || "Something went wrong");
  }

  return data;
}

// Authentication
export function registerUser(username, email, password) {
  return request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ username, email, password, userType: "user" }),
  });
}

export function loginUser(email, password) {
  return request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

// Portfolios
export function getPortfolios(userId, token) {
  return request(`/api/auth/portfolios/${userId}`, {
    method: "GET",
  }, token);
}

export function createPortfolio(portfolioName, token) {
  return request("/api/auth/portfolios", {
    method: "POST",
    body: JSON.stringify({ portfolioName }),
  }, token);
}

// Stocks
export function getStocks() {
  return request("/api/stocks", {
    method: "GET",
  });
}

export function getStockByTicker(ticker) {
  return request(`/api/stocks/${ticker}`, {
    method: "GET",
  });
}

// Trading & Orders
export function placeOrder(orderData, token) {
  // orderData: { portfolioId, ticker, companyName, price, count, stockType, orderType }
  return request("/api/trade/order", {
    method: "POST",
    body: JSON.stringify(orderData),
  }, token);
}

export function getOrders(token) {
  return request("/api/trade/order", {
    method: "GET",
  }, token);
}

// Transactions
export function getTransactions(token) {
  return request("/api/transactions", {
    method: "GET",
  }, token);
}
