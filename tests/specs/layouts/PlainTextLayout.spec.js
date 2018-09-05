import 'jasmine-jquery';
import core from 'coreApi';

describe('Layout', () => {
    describe('PlainText', () => {
        it('should initialize', () => {
            const plainText = new core.layout.PlainText({
                text: 'Button text'
            });

            window.app
                .getView()
                .getRegion('contentRegion')
                .show(plainText);
        });
    });
});
