
import core from 'comindware/core';
import CanvasView from 'demoPage/views/CanvasView';

export default function() {
    const model = new Backbone.Model({
        title: 'foo',
        idealDays: 12,
        dueDate: '2015-07-20T10:46:37Z',
        description: 'bar\nbaz',
        blocked: true
    });

    return new CanvasView({
        view: new core.layout.TabLayout({
            tabs: [{
                id: 'tab1',
                name: 'Tab 1',
                view: new core.layout.Form({
                    model,
                    schema: [{
                        cType: 'container',
                        layout: 'vertical',
                        items: [{
                            cType: 'field',
                            key: 'title',
                            title: 'Title',
                            type: 'Text'
                        }, {
                            cType: 'container',
                            layout: 'horizontal',
                            items: [{
                                cType: 'field',
                                key: 'idealDays',
                                title: 'Ideal Days',
                                type: 'Number'
                            }, {
                                cType: 'field',
                                key: 'dueDate',
                                type: 'DateTime',
                                title: 'Due Date',
                            }],
                        }, {
                            cType: 'field',
                            key: 'description',
                            title: 'Description',
                            type: 'TextArea'
                        }, {
                            cType: 'field',
                            key: 'blocked',
                            type: 'Boolean',
                            displayText: 'Blocked by another task'
                        }, {
                            text: 'Commit',
                            cType: 'button',
                            handler() {
                                view.form.commit();
                                alert(JSON.stringify(model.toJSON(), null, 4));
                            }
                        }]
                    }]
                })
            }, {
                id: 'tab2',
                name: 'Tab 2',
                view: new core.form.editors.TextAreaEditor({
                    value: 'Content 2'
                })
            }, {
                id: 'tab3',
                name: 'Tab 3',
                enabled: false,
                view: new core.form.editors.TextAreaEditor({
                    value: 'Content 3'
                })
            }, {
                id: 'tab4',
                name: 'Tab 4',
                error: 'Validation Error',
                view: new core.form.editors.TextAreaEditor({
                    value: 'Content 4'
                })
            }],
            showStepper: true,
            showMoveButtons: true
        }),
        canvas: {
            height: '400px',
            width: '400px'
        }
    });
}
