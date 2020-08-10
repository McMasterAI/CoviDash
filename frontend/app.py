from flask import Flask, redirect, url_for, render_template
app = Flask(__name__,
    static_folder="js",
    template_folder="client")



@app.route('/')
def mainpage():
    return render_template("index.html")

@app.route('/<name>')
def user(name):
    return render_template("index.html", content=name)

if __name__ == '__main__':
    app.run(debug=True)

