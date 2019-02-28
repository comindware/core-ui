import core from 'coreApi';
import 'jasmine-jquery';

describe('Components', () => {
    describe('ButtonView', () => {
        it('should set text', () => {
            const button = new core.layout.Button({
                text: 'Button text',
                handler: () => {}
            });

            window.app
                .getView()
                .getRegion('contentRegion')
                .show(button);

            expect(button.$('.toolbar-btn__text').html()).toEqual('Button text');
        });

        it('should trigger callback on button press', done => {
            const doneFn = jasmine.createSpy();

            const button = new core.layout.Button({
                text: 'Button text',
                handler: () => {
                    doneFn();
                    done();
                }
            });

            window.app
                .getView()
                .getRegion('contentRegion')
                .show(button);

            button.ui.btn.click();

            expect(doneFn.calls.count()).toEqual(1);
        });
    });
});
