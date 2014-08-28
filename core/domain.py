from datetime import datetime
from uuid import uuid4

from schematics.models import Model as Entity
from schematics.types import BooleanType, DateTimeType, MultilingualStringType, StringType, UUIDType
from schematics.types.compound import DictType, ListType, ModelType
from schematics.types.serializable import serializable
from schematics.transforms import blacklist


class ModelParameter(Entity):
    id = StringType(required=True)
    type = StringType(default='number')
    options = DictType(StringType, default=None)

    class Options:
        serialize_when_none = False


class Model(Entity):
    name = StringType(required=True, deserialize_from=('name', 'model_name'))
    file = StringType(deserialize_from=('file', 'model_file', 'filename'))
    template = StringType()
    title = MultilingualStringType()
    parameters = ListType(ModelType(ModelParameter), default=None, deserialize_from=('parameters', 'params'))
    display_options = DictType(BooleanType, default=None)
    output = ListType(StringType)

    class Options:
        serialize_when_none = False
        roles = {'DTO': blacklist('file', 'template')}


class Task(Entity):
    id = UUIDType(default=uuid4, required=True)
    model = ModelType(Model, required=True)
    arguments = StringType(default='')  # As JSON serialized object
    created = DateTimeType(default=datetime.now)
    result = DictType(StringType, default={})
    # TODO: status = StringType(default='PENDING', choices=('PENDING', 'RUNNING', 'SUCCESS', 'FAILURE', 'COMPLETED'))

    @serializable
    def model_name(self):
        return self.model.name if self.model else None

    def is_completed(self):
        return any(self.result)

    class Options:
        serialize_when_none = False
        roles = {
            'default': blacklist('model_name'),
            'DTO': blacklist('model', 'arguments')
        }


class Result(Entity):
    output = DictType(StringType)
    log = StringType(default='')
