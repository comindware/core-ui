/*eslint-ignore*/

import core from 'coreApi';
import 'jasmine-jquery';
import FocusTests from './FocusTests';

describe('Editors', () => {
    describe('Member Split Editor', () => {
        /*
        FocusTests.runFocusTests({
            initialize: () => {
                const model = new Backbone.Model({
                    selected: []
                });

                return new core.form.editors.MembersSplitEditor({
                    model,
                    key: 'selected',
                    autocommit: true,
                    users: core.services.UserService.listUsers(),
                    groups: new Backbone.Collection()
                });
            }
        });
*/
        const isAvailableListEmpty = view =>
            view
                .$('.js-available-items-list-region .visible-collection')
                .children()
                .first()
                .hasClass('empty-view');
        const isSelectedListEmpty = view =>
            view
                .$('.js-selected-items-list-region .visible-collection')
                .children()
                .first()
                .hasClass('empty-view');

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

        it('should set value on double click in available container', () => {
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
                        if (!isAvailableListEmpty(view)) {
                            clearTimeout(first);
                            view.$('.js-available-items-list-region .visible-collection')
                                .children()
                                .first()
                                .click()
                                .dblclick();
                            const second = setInterval(() => {
                                if (!isSelectedListEmpty(view)) {
                                    clearTimeout(second);
                                    expect(view.getValue()).toEqual(['user.10']);
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

        it('should remove value on double click in selected container', () => {
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
                    const gridCollection = view.$('.js-selected-items-list-region .visible-collection');
                    const first = setInterval(() => {
                        if (gridCollection.children().length) {
                            clearTimeout(first);
                            gridCollection
                                .children()
                                .first()
                                .click()
                                .dblclick();

                            const second = setInterval(() => {
                                if (
                                    gridCollection
                                        .children()
                                        .first()
                                        .hasClass('empty-view')
                                ) {
                                    clearTimeout(second);
                                    expect(view.getValue()).toEqual([]);
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

        it('should move item from available to selected container on move right button click', () => {
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
                        if (!isAvailableListEmpty(view)) {
                            clearTimeout(first);
                            view.$('.js-available-items-list-region .grid-selection-panel')
                                .children()
                                .first()
                                .children()
                                .click();
                            view.$('.js-move-right-button').click();
                            const second = setInterval(() => {
                                if (!isSelectedListEmpty(view)) {
                                    clearTimeout(second);
                                    expect(view.getValue()).toEqual(['user.10']);
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

        it('should move all items fron available to selected container on move right all button click', () => {
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
                        if (!isAvailableListEmpty(view)) {
                            clearTimeout(first);
                            view.$('.js-move-right-all-button').click();
                            const second = setInterval(() => {
                                if (!isSelectedListEmpty(view)) {
                                    clearTimeout(second);
                                    expect(view.getValue().sort()).toEqual(
                                        core.services.UserService.listUsers()
                                            .map(user => user.id)
                                            .sort()
                                    );
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

        it('should move item from selected to available container on move left button click', () => {
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
                        if (!isSelectedListEmpty(view)) {
                            clearTimeout(first);
                            view.$('.js-selected-items-list-region .grid-selection-panel')
                                .children()
                                .first()
                                .children()
                                .click();
                            view.$('.js-move-left-button').click();
                            const second = setInterval(() => {
                                if (isSelectedListEmpty(view)) {
                                    clearTimeout(second);
                                    expect(view.getValue().length).toEqual(0);
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

        it('should move all items from selected to available container on move left all button click', () => {
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
                        if (view.$('.js-selected-items-list-region .visible-collection').children().length === 5) {
                            clearTimeout(first);
                            view.$('.js-move-left-all-button').click();
                            const second = setInterval(() => {
                                if (isSelectedListEmpty(view)) {
                                    clearTimeout(second);
                                    expect(view.getValue()).toEqual([]);
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

        it('should correctly filter items by type on toolbar type select', () => {
            const model = new Backbone.Model({
                selected: []
            });

            const view = new core.form.editors.MembersSplitEditor({
                model,
                key: 'selected',
                autocommit: true,
                users: core.services.UserService.listUsers().slice(0, 3),
                groups: core.services.UserService.listGroups().slice(0, 5)
            });

            view.on('render', () => {
                view.controller.view.on('attach', () => {
                    const first = setInterval(() => {
                        if (view.$('.js-available-items-list-region .visible-collection').children().length === 8) {
                            clearTimeout(first);
                            view.$('.js-users-button').click();

                            const second = setInterval(() => {
                                if (view.$('.js-available-items-list-region .visible-collection').children().length === 3) {
                                    clearTimeout(second);
                                    view.$('.js-groups-button').click();

                                    const third = setInterval(() => {
                                        if (view.$('.js-available-items-list-region .visible-collection').children().length === 5) {
                                            clearTimeout(third);
                                            expect(true).toEqual(true);
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
