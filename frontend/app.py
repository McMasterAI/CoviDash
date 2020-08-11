from flask import Flask, redirect, url_for, render_template, request, jsonify
app = Flask(__name__,
    static_folder="js",
    template_folder="client")



@app.route('/')
def mainpage():
    return render_template("index.html")

@app.route("/example_req", methods=['POST'])
def example_func():
    # Make sure no one is calling through their browser
    if request.method == 'POST':
        # Make a dict structure to hold fake data to pass to JS


        return jsonify('hello or what ever variable or text you put here get sent back to your javascript')
    else:
        return None

if __name__ == '__main__':
    app.run(debug=True)

