from flask import Flask, render_template
import os

app = Flask(__name__, template_folder="../frontend/templates")


@app.route('/')
def index():
    template_name = "index.html"
    try:
        return render_template(template_name)
    except Exception as e:
        return f"Error rendering template: {e}"

if __name__ == '__main__':
    app.run(debug=True)
