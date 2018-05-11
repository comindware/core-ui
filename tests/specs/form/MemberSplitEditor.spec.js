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

        it('should set initial value', () => {
            const model = new Backbone.Model({
                selected: ['user.1']
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

            expect(view.getValue()).toEqual(['user.1']);
        });

        it('should set value on double click in available container', done => {
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
                                    expect(view.getValue()).toEqual(['user.10']);
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

        it('should remove value on double click in selected container', done => {
            const model = new Backbone.Model({
                selected: ['user.1']
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
                        if (document.getElementsByClassName('js-selected-members-container').length) {
                            clearTimeout(first);
                            view.$('.js-selected-members-container .js-menu-select-item').first().click().dblclick();
                            const second = setInterval(() => {
                                if (view.$('.js-selected-members-container .js-menu-select-item').length === 0) {
                                    clearTimeout(second);
                                    expect(view.getValue()).toEqual([]);
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

        it('should move value fron available to selected container on move button click', done => {
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
                        if (document.getElementsByClassName('js-selected-members-container').length) {
                            clearTimeout(first);
                            view.$('.js-menu-select-item').first().click();
                            view.$('.js-move-right-button').click();
                            const second = setInterval(() => {
                                if (view.$('.js-selected-members-container .js-menu-select-item').length) {
                                    clearTimeout(second);
                                    expect(view.getValue()).toEqual(['user.10']);
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

        it('should move all items fron available to selected container on move all button click', done => {
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
                        if (document.getElementsByClassName('js-selected-members-container').length) {
                            clearTimeout(first);
                            view.$('.js-selected-members-container .js-menu-select-item').first().click();
                            view.$('.js-move-left-button').click();
                            const second = setInterval(() => {
                                if (view.$('.js-selected-members-container .js-menu-select-item').length === 0) {
                                    clearTimeout(second);
                                    expect(view.getValue()).toEqual([]);
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

        it('should move item fron selected to available container on move button click', done => {
            const model = new Backbone.Model({
                selected: ['user.1']
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
                        if (document.getElementsByClassName('js-selected-members-container').length) {
                            clearTimeout(first);
                            view.$('.js-menu-select-item').first().click();
                            view.$('.js-move-right-all-button').click();
                            const second = setInterval(() => {
                                if (view.$('.js-selected-members-container .js-menu-select-item').length) {
                                    clearTimeout(second);
                                    expect(view.getValue().length).toEqual(11);
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

        it('should move all item fron selected to available container on move button click', done => {
            const model = new Backbone.Model({
                selected: ['user.1', 'user.2', 'user.3', 'user.4', 'user.5']
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
                        if (document.getElementsByClassName('js-selected-members-container').length) {
                            clearTimeout(first);
                            view.$('.js-move-left-all-button').click();
                            const second = setInterval(() => {
                                if (view.$('.js-selected-members-container .js-menu-select-item').length === 0) {
                                    clearTimeout(second);
                                    expect(view.getValue()).toEqual([]);
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
