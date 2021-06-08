import core from 'coreApi';
import 'jasmine-jquery';

describe('Components', () => {
    describe('TabView', () => {
        it('should initialize', () => {
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

            window.app
                .getView()
                .getRegion('contentRegion')
                .show(view);
            // assert
            expect(true).toBe(true);
        });

        it('should selected tab on tab click', () => {
            const model = new Backbone.Model({
                title: 'foo',
                idealDays: 12,
                dueDate: '2015-07-20T10:46:37Z',
                description: 'bar\nbaz',
                blocked: true
            });

            const tabsCollection = new Backbone.Collection([
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
            ]);

            const view = new core.layout.TabLayout({
                tabs: tabsCollection,
                showStepper: true,
                showMoveButtons: true
            });

            view.on('attach', () => {
                let selectedTabs;

                //default first is selected
                selectedTabs = tabsCollection.filter(tab => tab.get('selected'));
                expect(selectedTabs).toBeArrayOfSize(1, 'many tabs are selected!');
                expect(selectedTabs[0].id).toBe('tab1');

                const testedTabId = 'tab2';
                document.getElementById(testedTabId).click();
                selectedTabs = tabsCollection.filter(tab => tab.get('selected'));
                expect(selectedTabs).toBeArrayOfSize(1, 'many tabs are selected!');
                expect(selectedTabs[0].id).toBe(testedTabId);
            });

            window.app
                .getView()
                .getRegion('contentRegion')
                .show(view);
        });
    });
});
