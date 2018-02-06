
import core from 'comindware/core';
import CanvasView from 'demoPage/views/CanvasView';

export default function() {
    const model = new Backbone.Model({
        selected: [],
    });

    return new CanvasView({
        view: new core.form.editors.MembersSplitPanelEditor({
            model,
            key: 'selected',
            autocommit: true,
            users: Core.services.UserService.listUsers(),
            groups: new Backbone.Collection(),
        }),
        presentation: '\'{{memberValue}}\'',
        isEditor: true
    });
}
