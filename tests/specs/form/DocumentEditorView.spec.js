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

            view._uploadFiles([new File([], 'testFile')]);
            setTimeout(() => {
                expect(view.getValue()).toEqual([
                    {
                        id: 'document.1',
                        name: 'Document 1',
                        url: 'GetDocument/1'
                    },
                    {
                        id: 'testFile1',
                        name: 'testFile',
                        documentsId: ['testFile1'],
                        url: null,
                        type: 'testFile'
                    }
                ]);
                done();
            }, 100);
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

            view._uploadFiles([new File([], 'firstFile'), new File([], 'secondFile')]);
            setTimeout(() => {
                expect(view.getValue()).toEqual([
                    {
                        id: 'firstFile1',
                        name: 'firstFile',
                        documentsId: ['firstFile1', 'secondFile2'],
                        url: null,
                        type: 'firstFile'
                    },
                    {
                        id: 'secondFile2',
                        name: 'secondFile',
                        documentsId: ['firstFile1', 'secondFile2'],
                        url: null,
                        type: 'secondFile'
                    }
                ]);
                view._uploadFiles([new File([], 'thirdFile')]);
                setTimeout(() => {
                    expect(view.getValue()).toEqual([
                        {
                            id: 'firstFile1',
                            name: 'firstFile',
                            documentsId: ['firstFile1', 'secondFile2'],
                            url: null,
                            type: 'firstFile'
                        },
                        {
                            id: 'secondFile2',
                            name: 'secondFile',
                            documentsId: ['firstFile1', 'secondFile2'],
                            url: null,
                            type: 'secondFile'
                        },
                        {
                            id: 'thirdFile1',
                            name: 'thirdFile',
                            documentsId: ['thirdFile1'],
                            url: null,
                            type: 'thirdFile'
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

            view._uploadFiles([new File([], 'firstFile'), new File([], 'secondFile')]);
            setTimeout(() => {
                expect(view.getValue()).toEqual([
                    {
                        id: 'firstFile1',
                        name: 'firstFile',
                        documentsId: ['firstFile1'],
                        url: null,
                        type: 'firstFile'
                    }
                ]);
                view._uploadFiles([new File([], 'thirdFile')]);
                setTimeout(() => {
                    expect(view.getValue()).toEqual([
                        {
                            id: 'thirdFile1',
                            name: 'thirdFile',
                            documentsId: ['thirdFile1'],
                            url: null,
                            type: 'thirdFile'
                        }
                    ]);
                    done();
                }, 100);
            }, 100);
        });
    });
});
