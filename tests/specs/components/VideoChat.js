import core from 'coreApi';
import 'jasmine-jquery';

describe('Components', () => {
    describe('VideoChat', () => {
        it('should initialize', () => {
            const view = new core.components.VideoChat();

            window.app.getView().getRegion('contentRegion').show(view);
            // assert
            expect(true).toBe(true);
        });
    });
});
