import core from 'coreApi';
import 'jasmine-jquery';

describe('Components', () => {
    describe('Form Layout', () => {
        it('should initialize', () => {
            window.app
                .getView()
                .getRegion('contentRegion')
                .show(
                    new core.layout.Form({
                        model: new Backbone.Model({
                            1: 'bar',
                            2: 123,
                            3: 'foo',
                            4: '2015-07-20T10:46:37Z',
                            5: true,
                            6: 'aaa',
                            7: 456,
                            8: '2015-07-20T10:46:37Z',
                            9: 'dddddddddddddd',
                            10: 789
                        }),
                        schema: [
                            {
                                type: 'v-container',
                                items: [
                                    {
                                        type: 'Text-editor',
                                        key: 1
                                    },
                                    {
                                        type: 'TextArea-editor',
                                        key: 2
                                    },
                                    {
                                        type: 'Number-editor',
                                        key: 3
                                    },
                                    {
                                        type: 'DateTime-editor',
                                        key: 4
                                    },
                                    {
                                        type: 'Boolean-editor',
                                        key: 5,
                                        displayText: 'Make me some tea!'
                                    },
                                    {
                                        type: 'h-container',
                                        items: [
                                            {
                                                type: 'Text-editor',
                                                key: 6
                                            },
                                            {
                                                type: 'v-container',
                                                items: [
                                                    {
                                                        type: 'Number-editor',
                                                        key: 7
                                                    },
                                                    {
                                                        type: 'DateTime-editor',
                                                        key: 8
                                                    }
                                                ]
                                            },
                                            {
                                                type: 'TextArea-editor',
                                                key: 9
                                            },
                                            {
                                                type: 'Number-editor',
                                                key: 10
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    })
                );
            // assert
            expect(true).toBe(true);
        });

        it('should correctly use required validator', () => {
            const model = new Backbone.Model({
                1: null,
                2: null,
                3: null,
                4: null,
                5: null,
                6: null,
                7: null,
                8: null,
                9: null,
                10: null
            });
            const form = new core.layout.Form({
                model,
                schema: [
                    {
                        type: 'v-container',
                        items: [
                            {
                                type: 'Text-editor',
                                key: 1,
                                validators: ['required']
                            },
                            {
                                type: 'TextArea-editor',
                                key: 2,
                                validators: ['required']
                            },
                            {
                                type: 'Number-editor',
                                key: 3,
                                validators: ['required']
                            },
                            {
                                type: 'DateTime-editor',
                                key: 4,
                                validators: ['required']
                            },
                            {
                                type: 'Boolean-editor',
                                key: 5,
                                displayText: 'Make me some tea!',
                                validators: ['required']
                            },
                            {
                                type: 'h-container',
                                items: [
                                    {
                                        type: 'Text-editor',
                                        key: 6,
                                        validators: ['required']
                                    },
                                    {
                                        type: 'v-container',
                                        items: [
                                            {
                                                type: 'Number-editor',
                                                key: 7,
                                                validators: ['required']
                                            },
                                            {
                                                type: 'DateTime-editor',
                                                key: 8,
                                                validators: ['required']
                                            }
                                        ]
                                    },
                                    {
                                        type: 'TextArea-editor',
                                        key: 9,
                                        validators: ['required']
                                    },
                                    {
                                        type: 'Number-editor',
                                        key: 10,
                                        validators: ['required']
                                    }
                                ]
                            }
                        ]
                    }
                ]
            });

            window.app
                .getView()
                .getRegion('contentRegion')
                .show(form);

            expect(Object.keys(form.form.validate()).length).toEqual(10);

            model.set({
                1: 'bar',
                2: '123123',
                3: 123,
                4: '2015-07-20T10:46:37Z',
                5: true,
                6: 'aaa',
                7: 456,
                8: '2015-07-20T10:46:37Z',
                9: 'dddddddddddddd',
                10: 789
            });

            expect(form.form.validate()).toEqual(null);
        });

        it('should correctly use length validator', () => {
            const model = new Backbone.Model({
                1: null
            });
            const form = new core.layout.Form({
                model,
                schema: [
                    {
                        type: 'Datalist-editor',
                        key: 1,
                        validators: ['required', core.form.repository.validators.length({ min: 3, max: 3 })]
                    }
                ]
            });

            window.app
                .getView()
                .getRegion('contentRegion')
                .show(form);

            expect(Object.keys(form.form.validate()).length).toEqual(1);

            model.set({
                1: [{ id: 1, name: 1 }, { id: 2, name: 2 }, { id: 3, name: 3 }]
            });

            expect(form.form.validate()).toEqual(null);
        });

        it('should correctly use password validator', function() {
            const model = new Backbone.Model({
                1: null
            });
            const form = new core.layout.Form({
                model,
                schema: [
                    {
                        type: 'v-container',
                        items: [
                            {
                                type: 'Password-editor',
                                key: 1,
                                validators: ['required', 'password']
                            }
                        ]
                    }
                ]
            });

            window.app
                .getView()
                .getRegion('contentRegion')
                .show(form);

            expect(Object.keys(form.form.validate()).length).toEqual(1);

            model.set({
                1: '123'
            });

            expect(Object.keys(form.form.validate()).length).toEqual(1);

            model.set({
                1: '123456789'
            });

            expect(form.form.validate()).toEqual(null);
        });

        it('should correctly use system name validator', function() {
            const model = new Backbone.Model({
                1: null
            });
            const form = new core.layout.Form({
                model,
                schema: [
                    {
                        type: 'v-container',
                        items: [
                            {
                                type: 'Text-editor',
                                key: 1,
                                validators: ['required', 'systemName']
                            }
                        ]
                    }
                ]
            });

            window.app
                .getView()
                .getRegion('contentRegion')
                .show(form);

            expect(Object.keys(form.form.validate()).length).toEqual(1);

            model.set({
                1: 'русский язык и пробелы'
            });

            expect(Object.keys(form.form.validate()).length).toEqual(1);

            model.set({
                1: '123 numbers and spaces'
            });

            expect(Object.keys(form.form.validate()).length).toEqual(1);

            model.set({
                1: '123NumbersBeforeName'
            });

            expect(Object.keys(form.form.validate()).length).toEqual(1);

            model.set({
                1: 'correctSystemName'
            });

            expect(form.form.validate()).toEqual(null);
        });

        it('should correctly use email validator', () => {
            const model = new Backbone.Model({
                1: null
            });
            const form = new core.layout.Form({
                model,
                schema: [
                    {
                        type: 'v-container',
                        items: [
                            {
                                type: 'Text-editor',
                                key: 1,
                                validators: ['required', 'email']
                            }
                        ]
                    }
                ]
            });

            window.app
                .getView()
                .getRegion('contentRegion')
                .show(form);

            expect(Object.keys(form.form.validate()).length).toEqual(1);

            model.set({
                1: '2112312213.com'
            });

            expect(Object.keys(form.form.validate()).length).toEqual(1);

            model.set({
                1: 'sdfsdfsf@gmail'
            });

            expect(Object.keys(form.form.validate()).length).toEqual(1);

            model.set({
                1: 'correctemail@gmail.com'
            });

            expect(form.form.validate()).toEqual(null);
        });
    });
});
