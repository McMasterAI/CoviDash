import json

from flask import Flask, jsonify, render_template, request

# Main flask init
app = Flask(__name__, static_folder="js", template_folder="client")


# Main page action
@app.route("/")
def mainpage():
    return render_template("index.html")


# COVID case data function (predictions and past data)
@app.route("/casedata", methods=["POST", "GET"])
def getCaseData():
    # Make sure no one is calling through their browser
    with open("../prediction/temp/covidlocpreds.json") as fi:
        data = json.load(fi)

    if request.method == "POST":
        return jsonify(data)
    else:
        return jsonify(data)


# To launch the flask app on runtime
if __name__ == "__main__":
    app.run(debug=True)
