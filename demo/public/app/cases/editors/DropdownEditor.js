import CanvasView from 'demoPage/views/CanvasView';

export default function() {
    const possibleItems = _.times(200, n => ({
        id: n,
        text: `Text ${n}`,
        subtext: `subtext ${n}`
    }));

    const model = new Backbone.Model({
        dropdownValue: '120'
    });

    return new CanvasView({
        view: new Core.form.editors.DatalistEditor({
            model,
            key: 'dropdownValue',
            autocommit: true,
            collection: possibleItems,
            valueType: 'id',
            allowEmptyValue: false
        }),
        presentation: '{{dropdownValue}}',
        isEditor: true
    });
}
