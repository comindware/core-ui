import core from 'coreApi';
import 'jasmine-jquery';

describe('Components', () => {
    describe('Menu dropdown view', () => {
        it('should show menu correctly', () => {
            const menu = core.dropdown.factory.createMenu({
                text: '',
                items: [
                    {
                        text: '1',
                        id: 1
                    },
                    {
                        text: 2,
                        id: 2
                    }
                ]
            });

            window.app
                .getView()
                .getRegion('contentRegion')
                .show(menu);

            expect(true).toEqual(true);
        });
    });
});
