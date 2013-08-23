from flask import Flask, render_template
from flask.ext.assets import Environment, Bundle

app = Flask(__name__)
app.config['MODELS_SETTINGS'] = 'static/models.cfg'

# Assets
assets = Environment(app)

css = Bundle('stylesheets/main.css')
assets.register('stylesheets', css)

js = Bundle('scripts/vendor/modernizr.js',
            'scripts/vendor/respond.min.js')
assets.register('header_scripts', js)

js = Bundle('scripts/vendor/knockout.js',
            'scripts/vendor/jquery.min.js',
            'scripts/vendor/bootstrap.min.js',
            'scripts/main.js')
assets.register('body_scripts', js)

# Pages
@app.route('/')
def index():
    return render_template("index.html")


if __name__ == '__main__':
    app.run()
