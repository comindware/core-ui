import CanvasView from 'demoPage/views/CanvasView';

export default function() {
    const model = new Backbone.Model({
        docs: [
            {
                id: 'document.1',
                name: 'Document 1',
                url: 'GetDocument/1'
            },
            {
                extension: 'jpg',
                id: 'document.2',
                name: 'image',
                url: 'images/image.jpg'
            },
            {
                extension: 'jpg',
                id: 'document.3',
                name: 'image2',
                url: 'images/image2.jpg'
            },
            {
                extension: 'jpg',
                id: 'document.4',
                name: '4k_16:9_image',
                url: 'images/image3.jpg'
            }
        ]
    });

    return new CanvasView({
        view: new Core.form.editors.DocumentEditor({
            model,
            key: 'docs',
            autocommit: true,
            displayText: 'Document Editor',
            title: 'My images',
            uploadUrl: null
        }),
        presentation: "[ {{#each docs}}<div>{ id: '{{this.id}}', name: '{{this.name}}' }{{#unless @last}}, {{/unless}}</div>{{/each}} <div>]</div>",
        isEditor: true
    });
}
