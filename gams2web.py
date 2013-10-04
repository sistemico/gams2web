from flask import Flask, render_template, g, request, jsonify
from flask.ext.assets import Environment, Bundle
from flask.ext.babel import Babel
import json

app = Flask(__name__)
app.config['MODELS_SETTINGS'] = 'static/models.cfg'
babel = Babel(app)

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

@babel.localeselector
def get_locale():
    # if a user is logged in, use the locale from the user settings
    user = getattr(g, 'user', None)
    if user is not None:
        return user.locale
    # otherwise try to guess the language from the user accept
    # header the browser transmits.  We support de/fr/en in this
    # example.  The best match wins.
    return request.accept_languages.best_match(['es', 'en'])

# Futuro metodo rest para obtener la lista de modelos
@app.route('/models', methods=["GET"])
def get_models():
	return jsonify(json.loads(open('examples/models.json').read()))

# Futuro metodo rest para obtener la informacion de un modelo (ejemplo con Sudoku, seria parametro string)
@app.route('/models/<model>', methods=["GET"])
def get_model(model):
	# TODO: String format o sanitizar esto...
	cont = open('examples/'+ model+ '.json').read()
	data = json.loads(cont)
	return jsonify(data)
	
# Stub para guardar una instancia de ejecucion de un modelo (ejemplo con Sudoku)
@app.route('/models/<model>/instance', methods=["POST"])
def save_model_instance(model):
	return jsonify(json.loads(request.data))
	
# Stub para guardar una instancia de ejecucion de un modelo (ejemplo con Sudoku)
@app.route('/models/<model>/instance/<instanceId>', methods=["GET"])
def get_model_instance(model, instanceId):
	data = json.loads(request.data)
	return jsonify(data)
    
    

if __name__ == '__main__':
    app.run(debug=True)
