import core from 'coreApi';
import 'jasmine-jquery';
import FocusTests from './FocusTests';

describe('Editors', () => {
    describe('DateEditorView', () => {
        const findDateInput = function(view) {
            return view.$('input:first');
        };

        const show = view =>
            window.app
                .getView()
                .getRegion('contentRegion')
                .show(view);

        FocusTests.runFocusTests({
            initialize: () => {
                const model = new Backbone.Model({
                    data: '2015-07-20T10:46:37.000Z'
                });
                return new core.form.editors.DateTimeEditor({
                    model,
                    key: 'data'
                });
            },
            focusElement: '.editor_date-time_date input'
        });

        it('should open date panel on focus', () => {
            const model = new Backbone.Model({
                data: '2015-07-20T10:46:37.000Z'
            });
            const view = new core.form.editors.DateEditor({
                model,
                key: 'data'
            });

            show(view);
            view.focus();

            expect(findDateInput(view)).toBeFocused();
            expect(view.hasFocus).toEqual(true, 'Must have focus.');
        });
    });
});
