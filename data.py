import codecs
import json
import os

import settings


# Reads JSON file
def _load_from_json(filename, root=settings.GAMS2WEB_DATA):
    with codecs.open(os.path.join(root, filename), 'rU', 'utf-8') as json_file:
        return json.load(json_file)


models = _load_from_json('models-en.json')

tasks = []

