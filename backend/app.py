# Nimbus\backend\app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os
from dotenv import load_dotenv

#==================================================================================================================

OPENWEATHERMAP_API_KEY = os.environ.get('OPENWEATHERMAP_API_KEY')
BASE_URL = "https://api.openweathermap.org/data/2.5/forecast"
GEO_URL = "http://api.openweathermap.org/geo/1.0/direct"
load_dotenv('.flaskenv')
load_dotenv('.flaskenv')

app = Flask(__name__)
CORS(app)

@app.route('/')
def home():
    return "Nimbus Flask Backend"

#==================================================================================================================

@app.route('/api/location-suggestions')
def get_location_suggestions():
    query = request.args.get('query')
    if not query:
        return jsonify({"error": "Query parameter is required"}), 400

    url = f"{GEO_URL}?q={query}&limit=5&appid={OPENWEATHERMAP_API_KEY}"
    response = requests.get(url)
    
    if response.status_code != 200:
        return jsonify({"error": "Failed to fetch location suggestions"}), 500

    suggestions = response.json()
    formatted_suggestions = [
        {
            "name": f"{loc['name']}, {loc.get('state', '')}, {loc['country']}",
            "lat": loc['lat'],
            "lon": loc['lon']
        }
        for loc in suggestions
    ]

    return jsonify(formatted_suggestions)

#==================================================================================================================

@app.route('/api/weather')
def get_weather():
    city = request.args.get('city')
    country = request.args.get('country')
    
    if not city or not country:
        return jsonify({"error": "Both city and country parameters are required"}), 400

    weather_url = f"{BASE_URL}?q={city},{country}&units=metric&appid={OPENWEATHERMAP_API_KEY}"
    weather_response = requests.get(weather_url)
    
    if weather_response.status_code != 200:
        return jsonify({"error": "Failed to fetch weather data"}), 500

    weather_data = weather_response.json()

    formatted_data = {
        "current": {
            "main": {
                "temp": weather_data['list'][0]['main']['temp'],
                "humidity": weather_data['list'][0]['main']['humidity']
            },
            "weather": weather_data['list'][0]['weather']
        },
        "forecast": {
            "list": weather_data['list'][:5]  # forecast next 5
        }
    }

    return jsonify(formatted_data)

#==================================================================================================================

if __name__ == '__main__':
    app.run(debug=True, port=5000)