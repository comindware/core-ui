

import CanvasView from 'demoPage/views/CanvasView';

export default function() {
    const possibleItems = _.times(200, n => ({
        id: n + 1,
        text: `Text ${n + 1}`,
        subtext: `subtext ${n + 1}`
    }));

    const model = new Backbone.Model({
        dropdownValue: '120'
    });

    return new CanvasView({
        view: new core.form.editors.DatalistEditor({
            model,
            key: 'dropdownValue',
            autocommit: true,
            collection: new Backbone.Collection(possibleItems),
            createBySelect: true
        }),
        presentation: '{{dropdownValue}}',
        isEditor: true
    });
}
