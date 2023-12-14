from flask import Flask, jsonify, request
import os
from mds import create_scatter_plot
from flask_cors import CORS


app = Flask(__name__, template_folder="../frontend/templates")
CORS(app, resources={r"/data": {"origins": "http://127.0.0.1:8080"}})

@app.route('/data', methods=['GET'])
def perform_mds():
    month = request.headers.get('Variable1')

    try:
        script_directory = os.path.dirname(os.path.abspath(__file__))
        csv_path = os.path.join(script_directory, '..', 'datasets', 'june.xlsx')
        scatter_data = create_scatter_plot(csv_path)
        return jsonify(scatter_data)


    except Exception as e:
        error_message = f"An error occurred: {e}\n"
        error_message += traceback.format_exc()  # Add the traceback information
        return f"Error: {error_message}"
    

@app.route('/user', methods=['GET'])
def get_data():
    try:
        script_directory = os.path.dirname(os.path.abspath(__file__))
        csv_path = os.path.join(script_directory, '..', 'datasets', 'june.xlsx')
        scatter_data = create_scatter_plot(csv_path)
        return jsonify(scatter_data)


    except Exception as e:
        error_message = f"An error occurred: {e}\n"
        error_message += traceback.format_exc()  # Add the traceback information
        return f"Error: {error_message}"


if __name__ == '__main__':
    app.run(port=5000)