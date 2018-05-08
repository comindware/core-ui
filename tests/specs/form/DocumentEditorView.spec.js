import core from 'coreApi';
import 'jasmine-jquery';

describe('Editors', () => {
    describe('DocumentEditorView', () => {
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

            document.getElementsByClassName('js-clear-button')[0].click();

            expect(view.getValue()).toEqual([]);
        });
    });
});
