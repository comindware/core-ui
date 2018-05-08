/*eslint-ignore*/

import core from 'coreApi';
import 'jasmine-jquery';

describe('Editors', () => {
    describe('Bound list editor', () => {
        it('should be initialized', () => {
            const model = new Backbone.Model({
                selected: []
            });

            const view = new core.form.editors.MembersSplitPanelEditor({
                model,
                key: 'selected',
                autocommit: true,
                users: core.services.UserService.listUsers(),
                groups: new Backbone.Collection()
            });

            window.app
                .getView()
                .getRegion('contentRegion')
                .show(view);

            expect(true).toEqual(true);
        });

        it('should set value on double click', done => {
            const model = new Backbone.Model({
                selected: []
            });

            const view = new core.form.editors.MembersSplitPanelEditor({
                model,
                key: 'selected',
                autocommit: true,
                users: core.services.UserService.listUsers(),
                groups: new Backbone.Collection()
            });

            view.on('render', () => {
                view.controller.view.on('attach', () => {
                    const first = setInterval(() => {
                        if (document.getElementsByClassName('js-menu-select-item').length) {
                            clearTimeout(first);
                            view.$('.js-menu-select-item').first().click().dblclick();
                            const second = setInterval(() => {
                                if (view.$('.js-selected-members-container .js-menu-select-item').length) {
                                    clearTimeout(second);
                                    expect(view.getValue()).toEqual([ 'user.10' ]);
                                    done();                                
                                }
                            }, 10);
                        }
                    }, 10);
                });
            });


            window.app
                .getView()
                .getRegion('contentRegion')
                .show(view);
        });
    });
});
