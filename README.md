# Customer Order Dashboard

A web application for managing customer orders with a React frontend and Flask backend using SQLite database.

## Project Structure

- `/app.py` - Flask backend application
- `/data/` - Contains CSV files with customer and order data
- `/frontend/` - React frontend application
- `/database.db` - SQLite database (created when the app runs)
- `/.gitignore` - Specifies files to exclude from version control

## Setup Instructions

### Backend Setup

1. Install Python dependencies:
   ```
   pip install -r requirements.txt
   ```

2. Run the Flask backend:
   ```
   python app.py
   ```
   This will start the backend server on http://localhost:5000

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install Node.js dependencies:
   ```
   npm install
   ```

3. Start the React development server:
   ```
   npm start
   ```
   This will start the frontend on http://localhost:3000

## Features

- View a list of all customers
- Search customers by name, email, or city
- View detailed information for each customer
- View order history for each customer
- See order status and total spending per customer

## API Documentation

### Customer Endpoints

#### List Customers
```
GET /api/customers?page=1&per_page=10
```
Returns a paginated list of customers with their order counts.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `per_page` (optional): Number of customers per page (default: 10, max: 100)

**Response:**
```json
{
  "customers": [...],
  "pagination": {
    "total_customers": 100000,
    "total_pages": 10000,
    "current_page": 1,
    "per_page": 10,
    "has_next": true,
    "has_prev": false
  }
}
```

#### Get Customer Details
```
GET /api/customers/{customer_id}
```
Returns detailed information about a specific customer, including order statistics.

**Response:**
```json
{
  "id": 3,
  "first_name": "Clifford",
  "last_name": "Guzman",
  ...,
  "order_statistics": {
    "total_orders": 5,
    "completed_orders": 2,
    "shipped_orders": 1,
    "cancelled_orders": 0,
    "total_spent": 402.20
  }
}
```

#### Get Customer Orders
```
GET /api/customers/{customer_id}/orders?page=1&per_page=10
```
Returns a paginated list of orders for a specific customer, grouped by order_id with all items in each order.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `per_page` (optional): Number of orders per page (default: 10, max: 100)

**Response:**
```json
{
  "customer": {
    "id": 3,
    "first_name": "Clifford",
    "last_name": "Guzman",
    "email": "cliffordguzman@example.org"
  },
  "orders": [
    {
      "order_id": 4,
      "created_at": "2023-08-08 06:13:20+00:00",
      "status": "Processing",
      "items_count": 2,
      "order_total": 168.74,
      "items": [...]
    }
  ],
  "pagination": {
    "total_orders": 5,
    "total_pages": 1,
    "current_page": 1,
    "per_page": 10,
    "has_next": false,
    "has_prev": false
  }
}
```

If the customer has no orders, an empty orders array is returned with the customer information.

### Order Endpoints

#### List Orders
```
GET /api/orders?page=1&per_page=10
```
Returns a paginated list of all orders with customer information.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `per_page` (optional): Number of orders per page (default: 10, max: 100)

**Response:**
```json
{
  "orders": [...],
  "pagination": {
    "total_orders": 181759,
    "total_pages": 18176,
    "current_page": 1,
    "per_page": 10,
    "has_next": true,
    "has_prev": false
  }
}
```

#### Get Order Details
```
GET /api/orders/by-order-id/{order_id}
```
Returns detailed information about a specific order, including customer information and all items in the order.

**Response:**
```json
{
  "order": {
    "order_id": 4,
    "created_at": "2023-08-08 06:13:20+00:00",
    "status": "Processing",
    "items_count": 2,
    "order_total": 168.74
  },
  "customer": {
    "id": 3,
    "first_name": "Clifford",
    "last_name": "Guzman",
    "email": "cliffordguzman@example.org"
  },
  "items": [
    {
      "id": 5,
      "order_id": 4,
      "product_id": 1001,
      "sale_price": 89.99,
      "status": "Processing",
      "created_at": "2023-08-08 06:13:20+00:00",
      "product_name": "Ergonomic Wooden Chair",
      "product_category": "Furniture",
      "product_brand": "Ergonomic Home"
    },
    {
      "id": 6,
      "order_id": 4,
      "product_id": 1002,
      "sale_price": 78.75,
      "status": "Processing",
      "created_at": "2023-08-08 06:13:20+00:00",
      "product_name": "Sleek Metal Desk",
      "product_category": "Furniture",
      "product_brand": "Modern Office"
    }
  ]
}
```

If the order is not found, returns a 404 error with the message "Order not found".