import 'jasmine-jquery';
import core from 'coreApi';

describe('Layout', () => {
    describe('SplitPanel', () => {
        it('should initialize', () => {
            const splitPanelView = new core.views.SplitPanelView({
                text: 'Button text'
            });

            window.app
                .getView()
                .getRegion('contentRegion')
                .show(splitPanelView);
        });
    });
});
