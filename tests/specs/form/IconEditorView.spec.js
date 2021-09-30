/*eslint-ignore*/

import core from 'coreApi';
import 'jasmine-jquery';
import FocusTests from './FocusTests';

describe('Editors', () => {
    describe('IconEditorView', () => {
        FocusTests.runFocusTests({
            initialize: () => {
                const model = new Backbone.Model({
                    iconClass: 'user'
                });

                return new core.form.editors.IconEditor({
                    modelIconProperty: 'iconClass',
                    model
                });
            }
            // focusElement: '.js-input'
        });

        it('should render', () => {
            const model = new Backbone.Model({
                iconClass: 'user'
            });

            const view = new core.form.editors.IconEditor({
                modelIconProperty: 'iconClass',
                model
            });

            window.app
                .getView()
                .getRegion('contentRegion')
                .show(view);

            expect(document.getElementsByClassName('icons-wrp').length).toEqual(1);
        });

        it('should set initial value', () => {
            const model = new Backbone.Model({
                iconClass: 'user'
            });

            const view = new core.form.editors.IconEditor({
                key: 'iconClass',
                model
            });

            window.app
                .getView()
                .getRegion('contentRegion')
                .show(view);

            expect(view.getValue()).toEqual('user');
        });

        it('should remove value on icon click', () => {
            const model = new Backbone.Model({
                iconClass: 'user'
            });

            const view = new core.form.editors.IconEditor({
                key: 'iconClass',
                model
            });

            window.app
                .getView()
                .getRegion('contentRegion')
                .show(view);

            document.getElementsByClassName('js-delete-icon')[0].click();

            expect(view.getValue()).toEqual(null);
        });
    });
});
