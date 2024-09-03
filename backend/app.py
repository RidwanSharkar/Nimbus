from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os
from dotenv import load_dotenv


load_dotenv('.flaskenv')
OPENWEATHERMAP_API_KEY = os.environ.get('OPENWEATHERMAP_API_KEY')
BASE_URL = "https://api.openweathermap.org/data/2.5/forecast"
GEO_URL = "http://api.openweathermap.org/geo/1.0/direct"

app = Flask(__name__)
CORS(app)

@app.route('/')
def home():
    return "Nimbus Flask Backend"


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
            "name": loc['name'],
            "lat": loc['lat'],
            "lon": loc['lon'],
            "country": loc['country'],
            "state": loc.get('state', ''),
            "city": loc['name']
        }
        for loc in suggestions
    ]

    return jsonify(formatted_suggestions)


@app.route('/api/weather')
def get_weather():
    lat = request.args.get('lat')
    lon = request.args.get('lon')
    city = request.args.get('city')
    country = request.args.get('country')

    if not lat or not lon or not city or not country:
        return jsonify({"error": "Latitude, longitude, city, and country parameters are required"}), 400

    weather_url = f"{BASE_URL}?lat={lat}&lon={lon}&units=imperial&appid={OPENWEATHERMAP_API_KEY}"
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
            "list": [
                {
                    "dt_txt": forecast['dt_txt'],
                    "main": {
                        "temp": forecast['main']['temp']
                    },
                    "weather": forecast['weather']
                }
                for forecast in weather_data['list'][:5]
            ]
        }
    }

    return jsonify(formatted_data)


if __name__ == '__main__':
    app.run(debug=True, port=5000)
