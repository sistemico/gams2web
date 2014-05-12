import codecs
import json
from os import listdir, path
from os.path import isfile


# Path of model descriptor files
DATA_PATH = path.join(path.dirname(path.abspath(__file__)), 'data')

# Cached models data
_models = {}

for filename in listdir(DATA_PATH):
    file_path = path.join(DATA_PATH, filename)

    if isfile(file_path) and filename.endswith('.json'):
        with codecs.open(file_path, 'rU', 'utf-8') as json_file:
            _models[filename[:-5]] = json.load(json_file)


# Returns a list of all models available to run
get_all_models = lambda: _models

# Returns a list of all models available to run
get_model_by_name = lambda model_name: _models.get(model_name)
