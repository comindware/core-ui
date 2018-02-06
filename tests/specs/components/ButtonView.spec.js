
import core from 'coreApi';
import { initializeCore } from '../../utils/helpers';
import 'jasmine-jquery';

describe('Components', () => {
    let rootRegion;
    beforeEach(() => {
        rootRegion = initializeCore();
    });

    describe('ButtonView', () => {
        it('should set text', () => {
            const button = new core.layout.Button({
                text: 'Button text',
                handler: () => { }
            });

            rootRegion.show(button);

            expect(button.$('.layout__button-view-text').html()).toEqual('Button text');
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

            rootRegion.show(button);

            button.$el.click();

            expect(doneFn.calls.count()).toEqual(1);
        });
    });
});
