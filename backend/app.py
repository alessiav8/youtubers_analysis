from flask import Flask, jsonify, request
import os
from mds import create_scatter_plot
from flask_cors import CORS
import pandas as pd
import traceback


app = Flask(__name__, template_folder="../frontend/templates")
CORS(app, resources={r"/data": {"origins": ["http://127.0.0.1:8080", "http://localhost:8080"]}})

@app.route('/data', methods=['GET'])
def perform_mds():
    month = request.headers.get('month')
    followers = request.headers.get('followers')
    views = request.headers.get('views')
    comments = request.headers.get('comments')
    likes = request.headers.get('likes')

    try:
        script_directory = os.path.dirname(os.path.abspath(__file__))
        csv_path = os.path.join(script_directory, '..', 'datasets', f'{month}.xlsx')
        scatter_data = create_scatter_plot(csv_path,likes,comments,views,followers)
        return jsonify(scatter_data)


    except Exception as e:
        error_message = f"An error occurred: {e}\n"
        error_message += traceback.format_exc()  # Add the traceback information
        print(error_message)
        return f"Error: {error_message}"

if __name__ == '__main__':
    app.run(port=5000)