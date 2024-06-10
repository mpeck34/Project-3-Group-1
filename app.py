from flask import Flask, jsonify
import sqlite3
import csv

app = Flask(__name__)


# Import CSV into SQLite
# Function to import data from CSV into SQLite database
def import_csv_to_sqlite(csv_file, db_file):
    # Connect to SQLite database
    conn = sqlite3.connect(db_file)
    cursor = conn.cursor()

    # Create table if it doesn't exist
    cursor.execute('''CREATE TABLE IF NOT EXISTS my_table (
                        column1 TEXT,
                        column2 INTEGER,
                        column3 REAL
                    )''')

    # Read data from CSV and insert into the table
    with open(csv_file, 'r', newline='') as file:
        csv_reader = csv.reader(file)
        next(csv_reader)  # Skip header row if exists
        for row in csv_reader:
            cursor.execute("INSERT INTO my_table VALUES (?, ?, ?)", row)

    # Commit changes and close connection
    conn.commit()
    conn.close()

# Import data from CSV into SQLite database
import_csv_to_sqlite('data.csv', 'example.db')


# Create Flask server and JSONify
# Define a route to serve JSON data
@app.route('/api/data')
def get_data():
    # Connect to SQLite database
    conn = sqlite3.connect('example.db')
    cursor = conn.cursor()

    # Retrieve data from the table
    cursor.execute("SELECT * FROM my_table")
    rows = cursor.fetchall()

    # Convert data to JSON format
    data = [{'column1': row[0], 'column2': row[1], 'column3': row[2]} for row in rows]

    # Close connection
    conn.close()

    # Return JSON response
    return jsonify(data)

if __name__ == '__main__':
    app.run(debug=True)
