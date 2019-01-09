import CanvasView from 'demoPage/views/CanvasView';

export default function() {
    const possibleItems = _.times(200, n => ({
        id: n,
        text: `Text ${n}`,
        subtext: `subtext ${n}`
    }));

    const model = new Backbone.Model({
        dropdownValue: ['120', '10', '3']
    });

    const view = new Core.form.editors.DatalistEditor({
        model,
        key: 'dropdownValue',
        autocommit: true,
        collection: possibleItems,
        valueType: 'id',
        maxQuantitySelected: 4,
        allowEmptyValue: true
    });

    return new CanvasView({
        view,
        presentation: '{{dropdownValue}}',
        isEditor: true
    });
}
