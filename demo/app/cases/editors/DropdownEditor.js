import CanvasView from 'demoPage/views/CanvasView';

export default function() {
    const possibleItems = _.times(200, n => ({
        id: n,
        text: `Text ${n}`,
        subtext: `subtext ${n}`,
        contextIcon: n % 2 ? 'decimal' : 'text'
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
            showAdditionalList: true,
            iconProperty: 'contextIcon',
            subtextProperty: 'subtext',
            allowEmptyValue: false,
            displayAttribute: attr => `id: ${attr.id}, text: ${attr.text}`,
            subtextProperty: attr => `id: ${attr.id}, subtext: ${attr.subtext}`
        }),
        presentation: '{{dropdownValue}}',
        isEditor: true
    });
}
