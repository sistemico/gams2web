from flask import Flask, render_template

from flask.ext.assets import Environment

import settings
import api


# Flask app
app = Flask(__name__)
app.config.from_object(settings)

# Resources
assets = Environment(app)

# Routes
app.add_url_rule('/', 'index', lambda: render_template('main.html'))
app.add_url_rule('/api/models', 'model.all', api.get_models, methods=['GET'])
app.add_url_rule('/api/models/<model>', 'model.get', api.get_model, methods=['GET'])
app.add_url_rule('/api/models/<model>/instances', 'model.instances', api.get_model_instances, methods=['GET'])
app.add_url_rule('/api/instances', 'instances.all', api.get_instances, methods=['GET'])
app.add_url_rule('/api/models/<model>/instances/<task_id>', 'instances.get', api.get_model_instance, methods=['GET'])
app.add_url_rule('/api/models/<model>', 'model.run', api.run_model_instance, methods=['POST', 'PUT', 'GET'])


# Start local web server
if __name__ == '__main__':
    app.run(host='0.0.0.0')
