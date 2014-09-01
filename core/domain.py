from datetime import datetime
from uuid import uuid4

from schematics.models import Model as Entity
from schematics.types import BooleanType, DateTimeType, MultilingualStringType, StringType, UUIDType
from schematics.types.compound import DictType, ListType, ModelType
from schematics.types.serializable import serializable
from schematics.transforms import blacklist


FALLBACK_LOCALE = 'en'


class ModelParameter(Entity):
    id = StringType(required=True)
    type = StringType(default='number')
    options = DictType(StringType, default=None)
    # Multilingual fields
    metadata = DictType(MultilingualStringType(default_locale=FALLBACK_LOCALE))

    class Options:
        serialize_when_none = False


class Model(Entity):
    name = StringType(required=True, deserialize_from=('name', 'model_name'))
    file = StringType(deserialize_from=('file', 'model_file', 'filename'))
    template = StringType()
    display_options = DictType(BooleanType, default=None)
    parameters = ListType(ModelType(ModelParameter), default=None, deserialize_from=('parameters', 'params'))
    output = ListType(StringType)
    # Multilingual fields
    title = MultilingualStringType(default_locale=FALLBACK_LOCALE)
    description = MultilingualStringType(default_locale=FALLBACK_LOCALE)
    instructions = DictType(MultilingualStringType(default_locale=FALLBACK_LOCALE))

    class Options:
        roles = {'DTO': blacklist('file', 'template')}
        serialize_when_none = False


class Task(Entity):
    id = UUIDType(default=uuid4, required=True)
    model = ModelType(Model, required=True)
    arguments = StringType(default='')  # As JSON serialized object
    created = DateTimeType(default=datetime.now)
    result = DictType(StringType, default={})
    status = StringType(default='UNKNOWN', choices=('PENDING', 'RUNNING', 'SUCCESS', 'FAILED', 'COMPLETED'))

    @serializable
    def model_name(self):
        return self.model.name if self.model else None

    def is_completed(self):
        return any(self.result)

    class Options:
        serialize_when_none = False
        roles = {
            'default': blacklist('model_name', 'status'),
            'DTO': blacklist('model', 'arguments')
        }


class Result(Entity):
    output = DictType(StringType)
    log = StringType(default='')
