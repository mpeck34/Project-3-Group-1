from flask import Flask, jsonify
import requests
import pandas as pd

# Initialise app to be called by script.js
app = Flask(__name__)

# Get the local data
# Define the API endpoint
api_url = "http://127.0.0.1:5000/api/data"

# Call the API
try:
    response = requests.get(api_url, timeout=10)

    # Check if the response is successful
    if response.status_code == 200:
        data = response.json()
        bike_df = pd.DataFrame(data)
        print("Header of the table:")
        print(bike_df.head())
    else:
        print(f"Failed to retrieve data. Status code: {response.status_code}")
except requests.exceptions.RequestException as e:
    print(f"Error occurred: {e}")

# Process the data to find the most common routes
route_counts = bike_df.groupby(['Start_station', 'End_station']).size().reset_index(name='count')
most_common_routes = route_counts.loc[route_counts.groupby('Start_station')['count'].idxmax()]

print(most_common_routes.head())