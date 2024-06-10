from flask import Flask, jsonify
import sqlite3

app = Flask(__name__)

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
