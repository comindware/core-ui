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
                extension: 'mp4',
                id: 'document.2',
                name: 'SampleVideo',
                url: 'images/SampleVideo.mp4',
                infoWidget: {
                    text: '11.11.2111 12:59',
                    subtext: 'Pavel Koroteev',
                    picUrl: 'images/VSAvatar.PNG'
                }
            },
            {
                extension: 'jpg',
                id: 'document.3',
                name: 'image',
                url: 'images/image.jpg'
            },
            {
                extension: 'jpg',
                id: 'document.4',
                name: 'image2',
                url: 'images/image2.jpg',
                infoWidget: {
                    text: '26.08.2019 12:59',
                    subtext: 'Vladislav Smirnov',
                    picUrl: 'images/VSAvatar.PNG'
                }
            },
            {
                extension: 'jpg',
                id: 'document.5',
                name: '4k_16:9_image',
                url: 'images/image3.jpg'
            },
            {
                extension: 'webp',
                id: 'document.6',
                name: 'image4',
                url: 'images/image4.webp',
                infoWidget: {
                    text: 'Looong text, very very long tex',
                    subtext: 'Tony Podkolzin',
                    picUrl: 'images/VSAvatar.PNG'
                }
            },
            {
                extension: 'gif',
                id: 'document.7',
                name: 'cat',
                url: 'images/cat.gif'
            },
            {
                extension: 'gif',
                id: 'document.8',
                name: 'dance',
                url: 'images/dance.gif',
                infoWidget: {
                    text: '05.04.2077 11:30',
                    subtext: 'Vladislav Smirnov',
                    picUrl: 'images/VSAvatar.PNG'
                }
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
