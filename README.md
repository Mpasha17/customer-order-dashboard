# Customer Order Dashboard

A web application for managing customer orders with a React frontend and Flask backend using SQLite database.

## Project Structure

- `/app.py` - Flask backend application
- `/data/` - Contains CSV files with customer and order data
- `/frontend/` - React frontend application
- `/database.db` - SQLite database (created when the app runs)

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