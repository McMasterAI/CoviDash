import csv
import math
import os
from random import random

import numpy as np

from flask import Flask, jsonify, redirect, render_template, request, url_for

# Main flask init
app = Flask(__name__, static_folder="js", template_folder="client")


# Main page action
@app.route("/")
def mainpage():
    return render_template("index.html")


# COVID case data function (predictions and past data)
@app.route("/casedata", methods=["POST"])
def getCaseData():
    # Make sure no one is calling through their browser
    if request.method == "POST":
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
                "x": random() * 100,
                "y": random() * 100,
                "value": math.floor(random() * 100),
            }

            data.append(val)

        return jsonify(process_csv(save_location))
        #return jsonify(data)
    else:
        return None


# Save location for csv file
save_location = os.path.join(os.getcwd(), "conposcovidloc.csv")


def process_csv(save_location):
    cr = csv.reader(open(save_location, "r"))
    next(cr)
    # Pull relevant data from the CSV in tuple form
    formatted = []
    for i, v in enumerate(cr):
        formatted.append((v[2], v[15], v[16]))

    # Create empty numpy array and fill with tuples from previous step
    np_arr = np.empty((len(formatted),), dtype=object)
    for i, v in enumerate(formatted):
        np_arr[i] = v

    # Create array of unique tuples and their counts
    unique_elements, counts_elements = np.unique(np_arr, return_counts=True)

    # Convert to dict containing dates and list of tuples containing location and case counts
    complete_arr = {}

    for i, v in enumerate(unique_elements):
        # Make an obj to store in the dict
        val = {
            "x": float(v[2]),
            "y": float(v[1]),
            "value": int(counts_elements[i]),
        }

        if v[0] in complete_arr:
            complete_arr[v[0]].append(val)
        else:
            complete_arr[v[0]] = [val]

    return complete_arr


# To launch the flask app on runtime
if __name__ == "__main__":
    app.run(debug=True)
