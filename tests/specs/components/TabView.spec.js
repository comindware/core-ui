//import core from 'coreApi';
import { initializeCore } from '../../utils/helpers';
import 'jasmine-jquery';

describe('Components', () => {
    beforeEach(() => {
        this.rootRegion = initializeCore();
    });

    describe('TabView', () => {
        it('should initialize', function() {
            const model = new Backbone.Model({
                title: 'foo',
                idealDays: 12,
                dueDate: '2015-07-20T10:46:37Z',
                description: 'bar\nbaz',
                blocked: true
            });

            const view = new core.layout.TabLayout({
                tabs: [
                    {
                        id: 'tab1',
                        name: 'Tab 1',
                        view: new core.layout.Form({
                            model,
                            schema: [
                                {
                                    type: 'v-container',
                                    items: [
                                        {
                                            key: 'title',
                                            title: 'Title',
                                            type: 'Text-field'
                                        },
                                        {
                                            type: 'h-container',
                                            items: [
                                                {
                                                    key: 'idealDays',
                                                    title: 'Ideal Days',
                                                    type: 'Number-field'
                                                },
                                                {
                                                    key: 'dueDate',
                                                    type: 'DateTime-field',
                                                    title: 'Due Date'
                                                }
                                            ]
                                        },
                                        {
                                            key: 'description',
                                            title: 'Description',
                                            type: 'TextArea-field'
                                        },
                                        {
                                            key: 'blocked',
                                            type: 'Boolean-field',
                                            displayText: 'Blocked by another task'
                                        },
                                        {
                                            text: 'Commit',
                                            type: 'button',
                                            handler() {
                                                view.form.commit();
                                                alert(JSON.stringify(model.toJSON(), null, 4));
                                            }
                                        }
                                    ]
                                }
                            ]
                        })
                    },
                    {
                        id: 'tab2',
                        name: 'Tab 2',
                        view: new core.form.editors.TextAreaEditor({
                            value: 'Content 2'
                        })
                    },
                    {
                        id: 'tab3',
                        name: 'Tab 3',
                        enabled: false,
                        view: new core.form.editors.TextAreaEditor({
                            value: 'Content 3'
                        })
                    },
                    {
                        id: 'tab4',
                        name: 'Tab 4',
                        error: 'Validation Error',
                        view: new core.form.editors.TextAreaEditor({
                            value: 'Content 4'
                        })
                    }
                ],
                showStepper: true,
                showMoveButtons: true
            });

            this.rootRegion.show(view);
            // assert
            expect(true).toBe(true);
        });
    });
});
