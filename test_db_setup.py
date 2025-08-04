import sqlite3
import os

def test_database_setup():
    # Check if database file exists
    if not os.path.exists('database.db'):
        print("Database file does not exist. Running app.py will create it.")
        return
    
    # Connect to the database
    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()
    
    # Check if tables exist
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()
    table_names = [table[0] for table in tables]
    
    print("\nDatabase Tables:")
    for table in table_names:
        print(f"- {table}")
    
    # Check user data
    if 'users' in table_names:
        cursor.execute("SELECT COUNT(*) FROM users")
        user_count = cursor.fetchone()[0]
        print(f"\nUsers table contains {user_count} records")
        
        if user_count > 0:
            print("\nSample user data:")
            cursor.execute("SELECT * FROM users LIMIT 3")
            users = cursor.fetchall()
            for user in users:
                print(user)
    
    # Check order data
    if 'orders' in table_names:
        cursor.execute("SELECT COUNT(*) FROM orders")
        order_count = cursor.fetchone()[0]
        print(f"\nOrders table contains {order_count} records")
        
        if order_count > 0:
            print("\nSample order data:")
            cursor.execute("SELECT * FROM orders LIMIT 3")
            orders = cursor.fetchall()
            for order in orders:
                print(order)
    
    conn.close()
    print("\nDatabase setup test completed.")

if __name__ == "__main__":
    test_database_setup()