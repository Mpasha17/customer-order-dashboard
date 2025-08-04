from flask import Flask, jsonify, request, send_from_directory, abort
from flask_cors import CORS
import sqlite3
import csv
import os
from datetime import datetime

app = Flask(__name__, static_folder='frontend/build')
CORS(app)

# Database setup
DATABASE_PATH = 'database.db'

def init_db():
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    
    # Drop existing tables if they exist
    cursor.execute('DROP TABLE IF EXISTS orders')
    cursor.execute('DROP TABLE IF EXISTS users')
    
    # Create users table based on new CSV structure
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY,
        first_name TEXT,
        last_name TEXT,
        email TEXT,
        age INTEGER,
        gender TEXT,
        state TEXT,
        street_address TEXT,
        postal_code TEXT,
        city TEXT,
        country TEXT,
        latitude REAL,
        longitude REAL,
        traffic_source TEXT,
        created_at TEXT
    )
    ''')
    
    # Create order_items table based on new CSV structure
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY,
        order_id INTEGER,
        user_id INTEGER,
        product_id INTEGER,
        inventory_item_id INTEGER,
        status TEXT,
        created_at TEXT,
        shipped_at TEXT,
        delivered_at TEXT,
        returned_at TEXT,
        sale_price REAL,
        FOREIGN KEY (user_id) REFERENCES users (id)
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
    
    cursor.execute('SELECT COUNT(*) FROM order_items')
    order_count = cursor.fetchone()[0]
    
    # Only load data if tables are empty
    if user_count == 0:
        with open('data/users.csv', 'r') as file:
            csv_reader = csv.DictReader(file)
            for row in csv_reader:
                cursor.execute('''
                INSERT INTO users (id, first_name, last_name, email, age, gender, state, 
                                 street_address, postal_code, city, country, latitude, 
                                 longitude, traffic_source, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    row['id'], row['first_name'], row['last_name'], row['email'],
                    row['age'], row['gender'], row['state'], row['street_address'],
                    row['postal_code'], row['city'], row['country'], row['latitude'],
                    row['longitude'], row['traffic_source'], row['created_at']
                ))
                
                # Commit every 1000 rows to avoid large transactions
                if csv_reader.line_num % 1000 == 0:
                    conn.commit()
    
    if order_count == 0:
        with open('data/order_items.csv', 'r') as file:
            csv_reader = csv.DictReader(file)
            for row in csv_reader:
                cursor.execute('''
                INSERT INTO order_items (id, order_id, user_id, product_id, inventory_item_id, 
                                       status, created_at, shipped_at, delivered_at, 
                                       returned_at, sale_price)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    row['id'], row['order_id'], row['user_id'], row['product_id'],
                    row['inventory_item_id'], row['status'], row['created_at'],
                    row['shipped_at'] if row['shipped_at'] else None,
                    row['delivered_at'] if row['delivered_at'] else None,
                    row['returned_at'] if row['returned_at'] else None,
                    row['sale_price']
                ))
                
                # Commit every 1000 rows to avoid large transactions
                if csv_reader.line_num % 1000 == 0:
                    conn.commit()
    
    conn.commit()
    conn.close()

# Initialize database and load data
init_db()
load_data_from_csv()

# Helper function to get database connection
def get_db_connection():
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn

# API Routes
@app.route('/api/customers', methods=['GET'])
def get_customers():
    try:
        # Get pagination parameters
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        
        # Validate pagination parameters
        if page < 1 or per_page < 1 or per_page > 100:
            return jsonify({
                'error': 'Invalid pagination parameters. Page must be >= 1 and per_page must be between 1 and 100'
            }), 400
        
        # Calculate offset
        offset = (page - 1) * per_page
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get total count for pagination metadata
        cursor.execute('SELECT COUNT(*) FROM users')
        total_customers = cursor.fetchone()[0]
        
        # Get customers with pagination
        cursor.execute('''
            SELECT u.*, COUNT(o.id) as order_count 
            FROM users u 
            LEFT JOIN order_items o ON u.id = o.user_id 
            GROUP BY u.id 
            ORDER BY u.id 
            LIMIT ? OFFSET ?
        ''', (per_page, offset))
        
        customers = [dict(row) for row in cursor.fetchall()]
        
        # Calculate pagination metadata
        total_pages = (total_customers + per_page - 1) // per_page  # Ceiling division
        
        conn.close()
        
        return jsonify({
            'customers': customers,
            'pagination': {
                'total_customers': total_customers,
                'total_pages': total_pages,
                'current_page': page,
                'per_page': per_page,
                'has_next': page < total_pages,
                'has_prev': page > 1
            }
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/orders', methods=['GET'])
def get_orders():
    try:
        # Get pagination parameters
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        
        # Validate pagination parameters
        if page < 1 or per_page < 1 or per_page > 100:
            return jsonify({
                'error': 'Invalid pagination parameters. Page must be >= 1 and per_page must be between 1 and 100'
            }), 400
        
        # Calculate offset
        offset = (page - 1) * per_page
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get total count for pagination metadata
        cursor.execute('SELECT COUNT(*) FROM order_items')
        total_orders = cursor.fetchone()[0]
        
        # Get orders with pagination
        cursor.execute('''
            SELECT o.*, u.first_name, u.last_name, u.email 
            FROM order_items o 
            JOIN users u ON o.user_id = u.id 
            ORDER BY o.id 
            LIMIT ? OFFSET ?
        ''', (per_page, offset))
        
        orders = [dict(row) for row in cursor.fetchall()]
        
        # Calculate pagination metadata
        total_pages = (total_orders + per_page - 1) // per_page  # Ceiling division
        
        conn.close()
        
        return jsonify({
            'orders': orders,
            'pagination': {
                'total_orders': total_orders,
                'total_pages': total_pages,
                'current_page': page,
                'per_page': per_page,
                'has_next': page < total_pages,
                'has_prev': page > 1
            }
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/customers/<int:customer_id>', methods=['GET'])
def get_customer_details(customer_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get customer details
        cursor.execute('SELECT * FROM users WHERE id = ?', (customer_id,))
        customer = cursor.fetchone()
        
        if not customer:
            conn.close()
            return jsonify({'error': 'Customer not found'}), 404
        
        customer_dict = dict(customer)
        
        # Get order statistics
        cursor.execute('''
            SELECT 
                COUNT(*) as total_orders,
                SUM(CASE WHEN status = 'Complete' THEN 1 ELSE 0 END) as completed_orders,
                SUM(CASE WHEN status = 'Shipped' THEN 1 ELSE 0 END) as shipped_orders,
                SUM(CASE WHEN status = 'Cancelled' THEN 1 ELSE 0 END) as cancelled_orders,
                SUM(sale_price) as total_spent
            FROM order_items 
            WHERE user_id = ?
        ''', (customer_id,))
        
        order_stats = cursor.fetchone()
        
        if order_stats:
            customer_dict['order_statistics'] = {
                'total_orders': order_stats['total_orders'],
                'completed_orders': order_stats['completed_orders'],
                'shipped_orders': order_stats['shipped_orders'],
                'cancelled_orders': order_stats['cancelled_orders'],
                'total_spent': order_stats['total_spent'] or 0
            }
        else:
            customer_dict['order_statistics'] = {
                'total_orders': 0,
                'completed_orders': 0,
                'shipped_orders': 0,
                'cancelled_orders': 0,
                'total_spent': 0
            }
        
        conn.close()
        return jsonify(customer_dict)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/customers/<int:customer_id>/orders', methods=['GET'])
def get_customer_orders(customer_id):
    try:
        # Get pagination parameters
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        
        # Validate pagination parameters
        if page < 1 or per_page < 1 or per_page > 100:
            return jsonify({
                'error': 'Invalid pagination parameters. Page must be >= 1 and per_page must be between 1 and 100'
            }), 400
        
        # Calculate offset
        offset = (page - 1) * per_page
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if customer exists
        cursor.execute('SELECT id FROM users WHERE id = ?', (customer_id,))
        customer = cursor.fetchone()
        
        if not customer:
            conn.close()
            return jsonify({'error': 'Customer not found'}), 404
        
        # Get total count for pagination metadata
        cursor.execute('SELECT COUNT(*) FROM order_items WHERE user_id = ?', (customer_id,))
        total_orders = cursor.fetchone()[0]
        
        # Get customer orders with pagination
        cursor.execute('''
            SELECT o.* 
            FROM order_items o 
            WHERE o.user_id = ? 
            ORDER BY o.created_at DESC 
            LIMIT ? OFFSET ?
        ''', (customer_id, per_page, offset))
        
        orders = [dict(row) for row in cursor.fetchall()]
        
        # Calculate pagination metadata
        total_pages = (total_orders + per_page - 1) // per_page if total_orders > 0 else 1
        
        conn.close()
        
        return jsonify({
            'orders': orders,
            'pagination': {
                'total_orders': total_orders,
                'total_pages': total_pages,
                'current_page': page,
                'per_page': per_page,
                'has_next': page < total_pages,
                'has_prev': page > 1
            }
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

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