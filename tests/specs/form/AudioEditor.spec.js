import core from 'coreApi';
import 'jasmine-jquery';
import FocusTests from './FocusTests';

describe('Avatar editor', () => {
    const show = view => window.app.getView()
                                    .getRegion('contentRegion')
                                    .show(view);
    FocusTests.runFocusTests({
        initialize: () => {
            const model = new Backbone.Model({
                value: 'Foo Bar'
            });
    
            return new Core.form.editors.AudioEditor({
                model: model,
                key: 'value'
            });
        }
    });
    it('should be initialized', () => {
        const model = new Backbone.Model({
            value: 'Foo Bar'
        });

        const view = new Core.form.editors.AudioEditor({
            model: model,
            key: 'value'
        });

        show(view);

        expect(true).toEqual(true);
    });
});
