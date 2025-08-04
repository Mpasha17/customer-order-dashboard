from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import sqlite3
import csv
import os

app = Flask(__name__, static_folder='frontend/build')
CORS(app)

# Database setup
DATABASE_PATH = 'database.db'

def init_db():
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    
    # Create users table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS users (
        user_id INTEGER PRIMARY KEY,
        first_name TEXT,
        last_name TEXT,
        email TEXT,
        address TEXT,
        city TEXT,
        state TEXT,
        zip_code TEXT,
        phone TEXT,
        registration_date TEXT
    )
    ''')
    
    # Create orders table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS orders (
        order_id INTEGER PRIMARY KEY,
        user_id INTEGER,
        order_date TEXT,
        product_name TEXT,
        product_category TEXT,
        quantity INTEGER,
        price REAL,
        total_amount REAL,
        status TEXT,
        FOREIGN KEY (user_id) REFERENCES users (user_id)
    )
    ''')
    
    conn.commit()
    conn.close()

def load_data_from_csv():
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    
    # Check if data already exists
    cursor.execute('SELECT COUNT(*) FROM users')
    user_count = cursor.fetchone()[0]
    
    cursor.execute('SELECT COUNT(*) FROM orders')
    order_count = cursor.fetchone()[0]
    
    # Only load data if tables are empty
    if user_count == 0:
        with open('data/users.csv', 'r') as file:
            csv_reader = csv.reader(file)
            next(csv_reader)  # Skip header row
            for row in csv_reader:
                cursor.execute('''
                INSERT INTO users (user_id, first_name, last_name, email, address, city, state, zip_code, phone, registration_date)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', row)
    
    if order_count == 0:
        with open('data/orders.csv', 'r') as file:
            csv_reader = csv.reader(file)
            next(csv_reader)  # Skip header row
            for row in csv_reader:
                cursor.execute('''
                INSERT INTO orders (order_id, user_id, order_date, product_name, product_category, quantity, price, total_amount, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', row)
    
    conn.commit()
    conn.close()

# Initialize database and load data
init_db()
load_data_from_csv()

# API Routes
@app.route('/api/users', methods=['GET'])
def get_users():
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute('SELECT * FROM users')
    users = [dict(row) for row in cursor.fetchall()]
    
    conn.close()
    return jsonify(users)

@app.route('/api/orders', methods=['GET'])
def get_orders():
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute('SELECT * FROM orders')
    orders = [dict(row) for row in cursor.fetchall()]
    
    conn.close()
    return jsonify(orders)

@app.route('/api/users/<int:user_id>/orders', methods=['GET'])
def get_user_orders(user_id):
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute('SELECT * FROM orders WHERE user_id = ?', (user_id,))
    orders = [dict(row) for row in cursor.fetchall()]
    
    conn.close()
    return jsonify(orders)

# Serve React frontend in production
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(app.static_folder + '/' + path):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    app.run(debug=True)