define([ 'comindware/core', 'demoPage/views/CanvasView' ], function (core, CanvasView) {
    'use strict';
    return function () {
        var menu = core.dropdown.factory.createMenu({
            text: 'Actions',
            items: [
                {
                    id: 'action.1',
                    name: 'Create Task'
                },
                {
                    id: 'action.2',
                    name: 'Delete'
                }
            ]
        });

        menu.on('execute', function (modelId, model) {
            alert(JSON.stringify(arguments));
        });

        return new CanvasView({
            view: menu,
            canvas: {
                height: '30px'
            },
            region: {
                float: 'left'
            }
        });
    };
});
