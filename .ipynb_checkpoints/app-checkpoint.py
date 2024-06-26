from flask import Flask, jsonify
import sqlite3
import csv
import zipfile
import os

app = Flask(__name__)

# Function to import data from CSV into SQLite database
def import_csv_to_sqlite(csv_file, db_file):
    try:
        # Connect to SQLite database
        conn = sqlite3.connect(db_file)
        cursor = conn.cursor()

        # Create table if it doesn't exist
        cursor.execute('''CREATE TABLE IF NOT EXISTS bike_share_table (
                            Number INTEGER,
                            Start_date DATE,
                            Start_station_number INTEGER,
                            Start_station VARCHAR(255),
                            End_date DATE,
                            End_station_number INTEGER,
                            End_station VARCHAR(255),
                            Bike_number INTEGER,
                            Bike_model VARCHAR(255),
                            Total_duration VARCHAR(255),
                            Total_duration_ms INTEGER
                        )''')

        # Read data from CSV and insert into the table
        with open(csv_file, 'r', newline='') as file:
            csv_reader = csv.reader(file)
            next(csv_reader)  # Skip header row if exists
            for row in csv_reader:
                cursor.execute("INSERT INTO bike_share_table VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", row)

        # Commit changes and close connection
        conn.commit()
    except Exception as e:
        print(f"Error occurred: {e}")
    finally:
        conn.close()

# Function to extract CSV from ZIP and import into SQLite
def extract_csv_from_zip_and_import(zip_file_path, csv_file_name_inside_zip, db_file):
    try:
        # Open the ZIP file for reading
        with zipfile.ZipFile(zip_file_path, 'r') as zip_file:
            # Check if the CSV file exists in the ZIP archive
            if csv_file_name_inside_zip in zip_file.namelist():
                # Extract the CSV file from the ZIP archive to a temporary location
                with zip_file.open(csv_file_name_inside_zip, 'r') as csv_file:
                    # Save the CSV file to a temporary location
                    temp_csv_file_path = 'temp.csv'
                    with open(temp_csv_file_path, 'wb') as temp_file:
                        temp_file.write(csv_file.read())

                # Import data from the extracted CSV into SQLite
                import_csv_to_sqlite(temp_csv_file_path, db_file)

                # Delete the temporary CSV file after successful import
                if os.path.exists(temp_csv_file_path):
                    os.remove(temp_csv_file_path)
                    print(f"Temporary file deleted: {temp_csv_file_path}")
            else:
                print(f"CSV file '{csv_file_name_inside_zip}' not found in the ZIP archive.")
    except Exception as e:
        print(f"Error occurred: {e}")

# Import CSV from ZIP into SQLite
zip_file_path = './static/data/LondonBikeJourneyAug2023.csv.zip'
csv_file_name_inside_zip = 'LondonBikeJourneyAug2023.csv'
db_file = 'LondonBikeJourneyAug2023.db'
extract_csv_from_zip_and_import(zip_file_path, csv_file_name_inside_zip, db_file)

# Define a route to serve JSON data
@app.route('/')
def home():
    return "Hello, Flask is running!"

@app.route('/api/data')
def get_data():
    try:
        # Connect to SQLite database
        conn = sqlite3.connect(db_file)
        cursor = conn.cursor()

        # Retrieve data from the table
        cursor.execute("SELECT * FROM bike_share_table")
        rows = cursor.fetchall()

        # Get column names
        column_names = [description[0] for description in cursor.description]

        # Convert data to JSON format
        data = [dict(zip(column_names, row)) for row in rows]

    except Exception as e:
        return jsonify({"error": str(e)})
    finally:
        conn.close()

    # Return JSON response
    return jsonify(data)

if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=5000)
