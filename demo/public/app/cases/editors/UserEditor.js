

import CanvasView from 'demoPage/views/CanvasView';

export default function() {
    const getUser = i => {
        const id = `user.${i}`;
        return {
            id,
            avatarUrl: i % 2 === 0 ? `someUrl${i}` : undefined,
            abbreviation: `AV${i}`,
            name: i % 3 === 0 ? `Ivan Petrov ${i}` : `Vasiliy Stepanov ${i}`,
            text: `Test Reference ${i}`
        };
    };
    const model = new Backbone.Model({
        users: _.times(5, getUser)
    });

    const createDemoData = function () {
        return _.times(1000, getUser)
    };

    const collection = new Core.form.editors.reference.collections.DemoReferenceCollection(createDemoData());

    const view = new Core.form.editors.DatalistEditor({
        model,
        key: 'users',
        format: 'user',
        autocommit: true,
        showCheckboxes: true,
        maxQuantitySelected: 5,
        maxButtonItems: 2,
        fetchFiltered: true,
        addNewItem: () => alert('addNew'),
        collection
    });

    return new CanvasView({
        view,
        presentation: "[ {{#each users}}<div>{ id: '{{this.id}}', name: '{{this.name}}' }{{#unless @last}}, {{/unless}}</div>{{/each}} <div>]</div>",
        isEditor: true
    });
}
