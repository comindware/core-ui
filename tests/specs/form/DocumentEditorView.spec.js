import core from 'coreApi';
import 'jasmine-jquery';
import FocusTests from './FocusTests';

describe('Editors', () => {
    describe('DocumentEditorView', () => {
        FocusTests.runFocusTests({
            initialize: () => {
                const model = new Backbone.Model({
                    value: [
                        {
                            id: 'document.1',
                            name: 'Document 1',
                            url: 'GetDocument/1'
                        }
                    ]
                });

                return new core.form.editors.DocumentEditor({
                    model,
                    key: 'value',
                    autocommit: true
                });
            },
            focusElement: '.js-file-button'
        });

        it('should initialize', () => {
            const model = new Backbone.Model({
                value: [
                    {
                        id: 'document.1',
                        name: 'Document 1',
                        url: 'GetDocument/1'
                    }
                ]
            });

            const view = new core.form.editors.DocumentEditor({
                model,
                key: 'value',
                autocommit: true
            });

            window.app
                .getView()
                .getRegion('contentRegion')
                .show(view);

            expect(true).toBe(true);
        });

        it('should initialize with value', () => {
            const model = new Backbone.Model({
                value: [
                    {
                        id: 'document.1',
                        name: 'Document 1',
                        url: 'GetDocument/1'
                    }
                ]
            });

            const view = new core.form.editors.DocumentEditor({
                model,
                key: 'value',
                autocommit: true
            });

            window.app
                .getView()
                .getRegion('contentRegion')
                .show(view);

            expect(view.getValue()).toEqual([
                {
                    id: 'document.1',
                    name: 'Document 1',
                    url: 'GetDocument/1'
                }
            ]);
        });

        it('should remove value on remove button press', () => {
            const model = new Backbone.Model({
                value: [
                    {
                        id: 'document.1',
                        name: 'Document 1',
                        url: 'GetDocument/1'
                    }
                ]
            });

            const view = new core.form.editors.DocumentEditor({
                model,
                key: 'value',
                autocommit: true
            });

            window.app
                .getView()
                .getRegion('contentRegion')
                .show(view);

            view.$('.task-links__i').trigger('mouseenter');

            document.getElementsByClassName('js-bubble-delete')[0].click();

            expect(view.getValue()).toEqual([]);
        });

        it('should not show remove button if deleteion not permitted', () => {
            const model = new Backbone.Model({
                value: [
                    {
                        id: 'document.1',
                        name: 'Document 1',
                        url: 'GetDocument/1'
                    }
                ]
            });

            const view = new core.form.editors.DocumentEditor({
                model,
                key: 'value',
                autocommit: true,
                allowDelete: false
            });

            window.app
                .getView()
                .getRegion('contentRegion')
                .show(view);

            view.$('.task-links__i').trigger('mouseenter');

            expect(document.getElementsByClassName('js-bubble-delete').length).toEqual(0);
        });

        it('should show revision on revion button click', done => {
            const model = new Backbone.Model({
                value: [
                    {
                        id: 'document.1',
                        name: 'Document 1',
                        url: 'GetDocument/1'
                    }
                ]
            });

            const view = new core.form.editors.DocumentEditor({
                model,
                key: 'value',
                autocommit: true,
                allowDelete: false,
                showRevision: true
            });

            window.app
                .getView()
                .getRegion('contentRegion')
                .show(view);

            view.$('.task-links__i').trigger('mouseenter');
            view.$('.js-revise-button-region').click();
            setTimeout(() => {
                expect(document.getElementsByClassName('js-revision-list').length).toEqual(1);
                done();
            }, 100);
        });

        it('change value after upload ', done => {
            const model = new Backbone.Model({
                value: [
                    {
                        id: 'document.1',
                        name: 'Document 1',
                        url: 'GetDocument/1'
                    }
                ]
            });

            const view = new core.form.editors.DocumentEditor({
                model,
                key: 'value',
                autocommit: true,
                allowDelete: false,
                showRevision: true
            });

            window.app
                .getView()
                .getRegion('contentRegion')
                .show(view);

            const file = new File([], 'testFile');
            view._uploadFiles([file]);
            setTimeout(() => {
                const value = view.getValue();
                expect(value).toEqual([
                    {
                        id: 'document.1',
                        name: 'Document 1',
                        url: 'GetDocument/1'
                    },
                    {
                        name: 'testFile',
                        extension: 'testFile',
                        streamId: 'testFile1',
                        url: value[1].url
                    }
                ]);
                done();
            }, 1000);
        });

        it('show add values after twice upload by default', done => {
            const model = new Backbone.Model({
                value: null
            });

            const view = new core.form.editors.DocumentEditor({
                model,
                key: 'value',
                autocommit: true,
                allowDelete: false,
                showRevision: true
            });

            window.app
                .getView()
                .getRegion('contentRegion')
                .show(view);

            const file1 = new File([], 'firstFile');
            const file2 = new File([], 'secondFile');
            view._uploadFiles([file1, file2]);
            setTimeout(() => {
                const value = view.getValue();
                expect(value).toEqual([
                    {
                        name: 'firstFile',
                        extension: 'firstFile',
                        streamId: 'firstFile1',
                        url: value[0].url
                    },
                    {
                        name: 'secondFile',
                        extension: 'secondFile',
                        streamId: 'secondFile2',
                        url: value[1].url
                    }
                ]);
                const file3 = new File([], 'thirdFile');
                view._uploadFiles([file3]);
                setTimeout(() => {
                    const newValue = view.getValue();
                    expect(view.getValue()).toEqual([
                        {
                            name: 'firstFile',
                            extension: 'firstFile',
                            streamId: 'firstFile1',
                            url: newValue[0].url
                        },
                        {
                            name: 'secondFile',
                            extension: 'secondFile',
                            streamId: 'secondFile2',
                            url: newValue[1].url
                        },
                        {
                            name: 'thirdFile',
                            extension: 'thirdFile',
                            streamId: 'thirdFile1',
                            url: newValue[2].url
                        }
                    ]);
                    done();
                }, 100);
            }, 100);
        });

        it('show should reset value after any update if multiple restricted', done => {
            const model = new Backbone.Model({
                value: null
            });

            const view = new core.form.editors.DocumentEditor({
                model,
                key: 'value',
                autocommit: true,
                allowDelete: false,
                showRevision: true,
                multiple: false
            });

            window.app
                .getView()
                .getRegion('contentRegion')
                .show(view);

            const file1 = new File([], 'firstFile');
            view._uploadFiles([file1, new File([], 'secondFile')]);
            setTimeout(() => {
                const value = view.getValue();
                expect(value).toEqual([
                    {
                        name: 'firstFile',
                        extension: 'firstFile',
                        streamId: 'firstFile1',
                        url: value[0].url
                    }
                ]);
                const file3 = new File([], 'thirdFile');
                view._uploadFiles([file3]);
                setTimeout(() => {
                    const newValue = view.getValue();
                    expect(view.getValue()).toEqual([
                        {
                            name: 'thirdFile',
                            extension: 'thirdFile',
                            streamId: 'thirdFile1',
                            url: newValue[0].url
                        }
                    ]);
                    done();
                }, 100);
            }, 100);
        });
    });
});
