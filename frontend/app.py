from flask import Flask, redirect, url_for, render_template, request, jsonify
from random import random
import math

# Main flask init
app = Flask(__name__,
    static_folder="js",
    template_folder="client")


# Main page action
@app.route('/')
def mainpage():
    return render_template("index.html")

# COVID case data function (predictions and past data)
@app.route("/casedata", methods=['POST'])
def getCaseData():
    # Make sure no one is calling through their browser
    if request.method == 'POST':
        # Make a dict structure to hold fake data to pass to JS
        data = []

        # Data should have the following values:
        #   Longitude (x)
        #   Latitude (y)
        #   # of cases (value)
        #   Date 

        # Generate fake data for the time being
        for i in range(100):
            val = {
                "x" : random() * 100,
                "y" : random() * 100,
                "value" : math.floor(random() * 100)
            }

            data.append(val)


        return jsonify(data)
    else:
        return None

# To launch the flask app on runtime
if __name__ == '__main__':
    app.run(debug=True)

