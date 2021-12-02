import CanvasView from 'demoPage/views/CanvasView';

export default function() {
    const model = new Backbone.Model({
        booleanValue: [1]
    });

    return new CanvasView({
        view: new Core.form.editors.BooleanGroupEditor({
            model,
            key: 'booleanValue',
            changeMode: 'keydown',
            autocommit: true,
            title: 'Some',
            items: [
                { id: 1, displayText: 'First choice' },
                { id: 2, displayText: 'Second choice' },
                { id: 3, displayText: 'Checkbox, text left', displayTextPosition: 'left' },
                { id: 4, displayText: 'Switch', displayAsSwitch: true },
                { id: 5, displayText: 'Switch, text left', displayAsSwitch: true, displayTextPosition: 'left' },
                { id: 6, displayText: 'Checkbox, justified', isFullWidth: true },
                { id: 7, displayText: 'Checkbox, text left, justified', displayTextPosition: 'left', isFullWidth: true },
                { id: 8, displayText: 'Switch, justified', displayAsSwitch: true, isFullWidth: true },
                { id: 9, displayText: 'Switch, text left, justified', displayAsSwitch: true, displayTextPosition: 'left', isFullWidth: true },
            ]
        }),
        presentation: "[ {{#each booleanValue}}<div>'{{this}}'</div>{{/each}} <div>]</div>",
        isEditor: true
    });
}
