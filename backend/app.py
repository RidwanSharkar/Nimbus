from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os
from dotenv import load_dotenv

OPENWEATHERMAP_API_KEY = os.environ.get('OPENWEATHERMAP_API_KEY')
BASE_URL = "https://api.openweathermap.org/data/2.5/forecast"
load_dotenv('.flaskenv')

app = Flask(__name__)
CORS(app) 





@app.route('/')
def home():
    return "Welcome to the Nimbus Flask Backend!"

@app.route('/api/weather')
def get_weather():
    city = request.args.get('city')
    if not city:
        return jsonify({"error": "City parameter is required"}), 400

    weather_url = f"{BASE_URL}?q={city}&units=metric&appid={OPENWEATHERMAP_API_KEY}"
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
            "list": weather_data['list'][:5]  # Get forecast for the next 5 periods
        }
    }

    return jsonify(formatted_data)

if __name__ == '__main__':
    app.run(debug=True, port=5000)