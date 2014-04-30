define(["require", "exports"], function(require, exports) {
    

    exports.models = [
        {
            "name": "trnsport",
            "title": "Transportation Problem",
            "description": "A transportation problem with discretized economies of scale",
            "flags": ["new"]
        },
        {
            "name": "sudoku",
            "title": "Sudoku",
            "description": "Sudoku solver using linear programming",
            "instructions": [
                "Within any column of the 9x9 grid, each of the numbers 1 to 9 must be found.",
                "Within any row of the 9x9 grid, each of the numbers 1 to 9 must be found.",
                "Within any of the 9 individual 3x3 boxes, each of the numbers 1 to 9 must be found."
            ],
            "params": [
                {
                    "id": "board",
                    "label": "Board",
                    "helpText": "Fill empty squares with the numbers [1–9]",
                    "type": "matrix",
                    "options": {
                        "rows": 9,
                        "columns": 9,
                        "length": 1,
                        "min": 1,
                        "max": 9
                    }
                }
            ]
        }
    ];

    exports.tasks = [
        {
            "model": "Sodoku",
            "remainingTime": "00:05"
        },
        {
            "model": "Sodoku",
            "submitDate": "2014-04-13T14:13:00.000Z"
        },
        {
            "model": "Transportation Problem",
            "submitDate": "2014-04-10T04:27:00.000Z"
        },
        {
            "model": "Sodoku",
            "remainingTime": "",
            "submitDate": "2014-04-04T03:01:00.000Z"
        }
    ];

    function addTask(model) {
        exports.tasks.push({
            model: model.title,
            submitDate: new Date().toISOString()
        });
    }
    exports.addTask = addTask;

    function removeTask(index) {
        exports.tasks.splice(index, 1);
    }
    exports.removeTask = removeTask;

    function getModelInfo(modelName) {
        var result;

        exports.models.forEach(function (model) {
            if (model.name === modelName) {
                result = model;
            }
        });

        return result;
    }
    exports.getModelInfo = getModelInfo;
});
