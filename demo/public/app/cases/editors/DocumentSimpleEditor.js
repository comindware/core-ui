

import CanvasView from 'demoPage/views/CanvasView';

export default function() {
    const getExtenstion = (() => {
        let counter = 0;
        const extensions = ['docx', 'jpg', 'xls', 'pdf'];
        return () => {
            counter++;
            if (counter === extensions.length) {
                counter = 0;
            }

            return extensions[counter];
        };
    })();
    const getDoc = i => {
        const id = `doc.${i}`;
        const extension = getExtenstion();
        return {
            extension,
            id,
            name: `some ${extension}`
        };
    };
    const model = new Backbone.Model({
        documents: _.times(3, getDoc)
    });

    const view = new Core.form.editors.DatalistEditor({
        model,
        title: 'Documents',
        key: 'documents',
        format: 'document',
        autocommit: true,
        maxQuantitySelected: 5,
        maxButtonItems: 2
    });

    return new CanvasView({
        view,
        presentation: "[ {{#each documents}}<div>{ id: '{{this.id}}', name: '{{this.name}}' }{{#unless @last}}, {{/unless}}</div>{{/each}} <div>]</div>",
        isEditor: true
    });
}
