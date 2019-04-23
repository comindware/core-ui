/*eslint-ignore*/

import core from 'coreApi';
import 'jasmine-jquery';
import FocusTests from './FocusTests';

describe('Editors', () => {
    describe('Member Split Editor', () => {
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

        const isAvailableListEmpty = view =>
            view
                .$('.member-split-wrp .member-split-grid .visible-collection')
                .first()
                .children()
                .first()
                .hasClass('empty-view');
        const isSelectedListEmpty = view =>
            view
                .$('.member-split-wrp .member-split-grid .visible-collection')
                .last()
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
                groups: new Backbone.Collection(),
                filterFnParameters: {}
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

        it('should set value on click in available container', done => {
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
                            view.$('.member-split-wrp .member-split-grid .visible-collection')
                                .first()
                                .children()
                                .first()
                                .click();
                            const second = setInterval(() => {
                                if (!isSelectedListEmpty(view)) {
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

        it('should remove value on click in selected container', done => {
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
                    const gridCollection = view.$('.member-split-wrp .member-split-grid .visible-collection').last();
                    const first = setInterval(() => {
                        if (gridCollection.children().length && !gridCollection.hasClass('empty')) {
                            clearTimeout(first);
                            gridCollection
                                .children()
                                .first()
                                .click();

                            const second = setInterval(() => {
                                if (gridCollection.hasClass('empty')) {
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

        it('should move all items fron available to selected container on move right all button click', done => {
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
                            view.$('.member-split-wrp .member-split-grid .move-all-btn')
                                .first()
                                .click();
                            const second = setInterval(() => {
                                if (!isSelectedListEmpty(view)) {
                                    clearTimeout(second);
                                    expect(view.getValue().sort()).toEqual(
                                        core.services.UserService.listUsers()
                                            .map(user => user.id)
                                            .sort()
                                    );
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

        it('should move all items from selected to available container on move left all button click', done => {
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
                        if (
                            view
                                .$('.member-split-wrp .member-split-grid .visible-collection')
                                .last()
                                .children().length === 5
                        ) {
                            clearTimeout(first);
                            view.$('.member-split-wrp .member-split-grid .move-all-btn')
                                .last()
                                .click();
                            const second = setInterval(() => {
                                if (isSelectedListEmpty(view)) {
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
    });
});
