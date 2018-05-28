/*eslint-ignore*/

import core from 'coreApi';
import 'jasmine-jquery';

describe('Editors', () => {
    describe('Bound list editor', () => {
        it('should be initialized', () => {
            const model = new Backbone.Model({
                selected: []
            });

            const view = new core.form.editors.MembersSplitEditor({
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

            const view = new core.form.editors.MembersSplitEditor({
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

            const view = new core.form.editors.MembersSplitEditor({
                model,
                key: 'selected',
                autocommit: true,
                users: core.services.UserService.listUsers(),
                groups: new Backbone.Collection()
            });

            view.on('render', () => {
                view.controller.view.on('attach', () => {
                    const first = setInterval(() => {
                        if (document.getElementsByClassName('js-available-items-list-region').length) {
                            clearTimeout(first);
                            view.$('.js-available-items-list-region .js-visible-collection-wrp').children().first().click().dblclick();
                            const second = setInterval(() => {
                                if (view.$('.js-selected-items-list-region .js-visible-collection-wrp').children().length) {
                                    clearTimeout(second);
                                    expect(view.getValue()).toEqual(['user.10']);
                                    done();
                                }
                            }, 100);
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

            const view = new core.form.editors.MembersSplitEditor({
                model,
                key: 'selected',
                autocommit: true,
                users: core.services.UserService.listUsers(),
                groups: new Backbone.Collection()
            });

            view.on('render', () => {
                view.controller.view.on('attach', () => {
                    const first = setInterval(() => {
                        if (view.$('.js-selected-items-list-region .js-visible-collection-wrp').children().length) {
                            clearTimeout(first);
                            view.$('.js-selected-items-list-region .js-visible-collection-wrp').children().first().click().dblclick();

                            const second = setInterval(() => {
                                if (view.$('.js-selected-items-list-region .js-visible-collection-wrp').children().length === 0) {
                                    clearTimeout(second);
                                    expect(view.getValue()).toEqual([]);
                                    done();
                                }
                            }, 100);
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

            const view = new core.form.editors.MembersSplitEditor({
                model,
                key: 'selected',
                autocommit: true,
                users: core.services.UserService.listUsers(),
                groups: new Backbone.Collection()
            });

            view.on('render', () => {
                view.controller.view.on('attach', () => {
                    const first = setInterval(() => {
                        if (document.getElementsByClassName('js-available-items-list-region').length) {
                            clearTimeout(first);
                            view.$('.js-available-items-list-region .js-visible-collection-wrp').children().first().click();
                            view.$('.js-move-right-button').click();
                            const second = setInterval(() => {
                                if (view.$('.js-selected-items-list-region .js-visible-collection-wrp').children().length) {
                                    clearTimeout(second);
                                    expect(view.getValue()).toEqual(['user.10']);
                                    done();
                                }
                            }, 100);
                        }
                    }, 10);
                });
            });

            window.app
                .getView()
                .getRegion('contentRegion')
                .show(view);
        });

        it('should move item fron available to selected container on move right button click', done => {
            const model = new Backbone.Model({
                selected: []
            });

            const view = new core.form.editors.MembersSplitEditor({
                model,
                key: 'selected',
                autocommit: true,
                users: core.services.UserService.listUsers(),
                groups: new Backbone.Collection()
            });

            view.on('render', () => {
                view.controller.view.on('attach', () => {
                    const first = setInterval(() => {
                        if (document.getElementsByClassName('js-available-items-list-region').length) {
                            clearTimeout(first);
                            view.$('.js-available-items-list-region .js-visible-collection-wrp').children().first().click();
                            view.$('.js-move-right-button').click();
                            const second = setInterval(() => {
                                if (view.$('.js-selected-items-list-region .js-visible-collection-wrp').children().length === 1) {
                                    clearTimeout(second);
                                    expect(view.getValue()).toEqual(['user.10']);
                                    done();
                                }
                            }, 100);
                        }
                    }, 10);
                });
            });

            window.app
                .getView()
                .getRegion('contentRegion')
                .show(view);
        });

        it('should move item from selected to available container on move button click', done => {
            const model = new Backbone.Model({
                selected: ['user.1']
            });

            const view = new core.form.editors.MembersSplitEditor({
                model,
                key: 'selected',
                autocommit: true,
                users: core.services.UserService.listUsers(),
                groups: new Backbone.Collection()
            });

            view.on('render', () => {
                view.controller.view.on('attach', () => {
                    const first = setInterval(() => {
                        if (document.getElementsByClassName('js-selected-items-list-region').length) {
                            clearTimeout(first);
                            view.$('.js-selected-items-list-region .js-visible-collection-wrp').children().first().click();
                            view.$('.js-move-left-button').click();
                            const second = setInterval(() => {
                                if (view.$('.js-selected-items-list-region .js-visible-collection-wrp').children().length === 0) {
                                    clearTimeout(second);
                                    expect(view.getValue().length).toEqual(0);
                                    done();
                                }
                            }, 100);
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

            const view = new core.form.editors.MembersSplitEditor({
                model,
                key: 'selected',
                autocommit: true,
                users: core.services.UserService.listUsers(),
                groups: new Backbone.Collection()
            });

            view.on('render', () => {
                view.controller.view.on('attach', () => {
                    const first = setInterval(() => {
                        if (document.getElementsByClassName('js-selected-items-list-region').length) {
                            clearTimeout(first);
                            view.$('.js-move-left-all-button').click();
                            const second = setInterval(() => {
                                if (view.$('.js-selected-items-list-region .js-visible-collection-wrp').children().length === 0) {
                                    clearTimeout(second);
                                    expect(view.getValue()).toEqual([]);
                                    done();
                                }
                            }, 100);
                        }
                    }, 10);
                });
            });

            window.app
                .getView()
                .getRegion('contentRegion')
                .show(view);
        });

        it('should correctly filter items by type on toolbar type select', done => {
            const model = new Backbone.Model({
                selected: []
            });

            const view = new core.form.editors.MembersSplitEditor({
                model,
                key: 'selected',
                autocommit: true,
                users: core.services.UserService.listUsers().slice(0, 3),
                groups: core.services.UserService.listGroups().slice(0, 3)
            });

            view.on('render', () => {
                view.controller.view.on('attach', () => {
                    const first = setInterval(() => {
                        if (document.getElementsByClassName('js-selected-items-list-region').length) {
                            clearTimeout(first);
                            view.$('.js-users-button').click();

                            const second = setInterval(() => {
                                if (view.$('.js-available-items-list-region .js-visible-collection-wrp').children().length === 3) {
                                    clearTimeout(second);
                                    view.$('.js-groups-button').click();

                                    const third = setInterval(() => {
                                        if (view.$('.js-available-items-list-region .js-visible-collection-wrp').children().length === 3) {
                                            clearTimeout(third);
                                            expect(true).toEqual(true);
                                            done();
                                        }
                                    }, 10);
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
