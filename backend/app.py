from flask import Flask, render_template
import os
from mds import create_scatter_plot

app = Flask(__name__, template_folder="../frontend/templates")


@app.route('/')
def index():
    template_name = "index.html"
    
    try:
        script_directory = os.path.dirname(os.path.abspath(__file__))
        csv_path = os.path.join(script_directory, 'june2022.xlsx')
        
        # Call the function to get the data
        scatter_data = create_scatter_plot(csv_path)
        print(scatter_data)
        # Pass the data to the template
        return render_template(template_name, scatter_data=scatter_data)

    except Exception as e:
        print(f"An error occurred: {e}")
        return "Error: Failed "

if __name__ == '__main__':
    app.run(debug=True, threaded=False)
