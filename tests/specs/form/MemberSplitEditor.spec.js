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

        it('should count correctly', done => {
            const model = new Backbone.Model({
                selected: ['user.1', 'user.2', 'user.4']
            });

            const view = new core.form.editors.MembersSplitEditor({
                model,
                key: 'selected',
                autocommit: true,
                users: core.services.UserService.listUsers(),
                groups: new Backbone.Collection(),
                hideUsers: false,
                hideGroups: false,
                showMode: 'button'
            });

            view.on('render', () => {
                setTimeout(() => {
                    expect(view.$('.js-members-text')).toContainText('3'); // 3 users selected
                    view.setValue(['user.1', 'user.2', 'user.4', 'user.5']);
                    setTimeout(() => {
                        expect(view.$('.js-members-text')).toContainText('4'); // 4 users selected
                        done();
                    }, 500);
                }, 500);
            });

            window.app
                .getView()
                .getRegion('contentRegion')
                .show(view);
        });

        it('should count correctly on hide users or groups', done => {
            const model = new Backbone.Model({
                selected: ['user.2', 'user.3', 'user.4']
            });

            const view = new core.form.editors.MembersSplitEditor({
                model,
                key: 'selected',
                autocommit: true,
                users: core.services.UserService.listUsers(),
                groups: new Backbone.Collection(),
                hideUsers: true,
                hideGroups: true,
                getDisplayText: true,
                showMode: 'button'
            });

            view.on('render', () => {
                setTimeout(() => {
                    expect(view.$('.js-members-text')).not.toContainText('3'); // 3 users selected (hidden)
                    done();
                }, 500);
            });

            window.app
                .getView()
                .getRegion('contentRegion')
                .show(view);
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

        xit('should remove value on click in selected container', done => {
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

        it('should correctly filter items by type if filter checkbox was checked', done => {
            const model = new Backbone.Model({
                selected: []
            });

            const listGroups = core.services.UserService.listGroups();
            const listUsers = core.services.UserService.listUsers();
            const view = new core.form.editors.MembersSplitEditor({
                model,
                key: 'selectes',
                autocommit: true,
                users: listUsers,
                groups: listGroups,
                filterFnParameters: {
                    users: 'users',
                    groups: 'groups'
                },
                memberTypes: {
                    users: 'users',
                    groups: 'groups'
                }
            });

            view.on('render', () => {
                view.controller.view.on('attach', () => {
                    const first = setInterval(() => {
                        if (!isAvailableListEmpty(view)) {
                            clearTimeout(first);
                            view.$('.member-split-wrp .member-split-grid .filter-groups-btn')
                                .first()
                                .click();
                            let i = 0;
                            const second = setInterval(() => {
                                i++;
                                if (
                                    view
                                        .$('.member-split-wrp .member-split-grid .visible-collection')
                                        .first()
                                        .children().length === listUsers.length
                                ) {
                                    clearTimeout(second);
                                    expect(i < 10).toEqual(true);
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

        it('should correctly filter items by type if memberService enabled', done => {
            const model = new Backbone.Model({
                selected: []
            });

            const listGroups = core.services.UserService.listGroups();
            const listUsers = core.services.UserService.listUsers();
            const memberService = {
                filterFnParameters: {
                    users: 'users',
                    groups: 'groups'
                },
                memberTypes: {
                    users: 'users',
                    groups: 'groups'
                },
                getMembers: options => {
                    const list = options.filterType === 'groups' ? listGroups : options.filterType === 'users' ? listUsers : listUsers.concat(listGroups);
                    return { available: list, selected: [] };
                }
            };

            const view = new core.form.editors.MembersSplitEditor({
                model,
                key: 'selectes',
                autocommit: true,
                users: listUsers,
                groups: listGroups,
                memberService
            });

            view.on('render', () => {
                view.controller.view.on('attach', () => {
                    const first = setInterval(() => {
                        if (!isAvailableListEmpty(view)) {
                            clearTimeout(first);
                            view.$('.member-split-wrp .member-split-grid .filter-groups-btn')
                                .first()
                                .click();
                            let i = 0;
                            const second = setInterval(() => {
                                i++;
                                if (
                                    view
                                        .$('.member-split-wrp .member-split-grid .visible-collection')
                                        .first()
                                        .children().length === listUsers.length
                                ) {
                                    clearTimeout(second);
                                    expect(i < 10).toEqual(true);
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

        it('should correctly set loading', done => {
            const model = new Backbone.Model({
                selected: []
            });

            const listGroups = core.services.UserService.listGroups();
            const listUsers = core.services.UserService.listUsers();
            const data = {
                available: [],
                selected: []
            };
            const memberService = {
                filterFnParameters: {
                    users: 'users',
                    groups: 'groups'
                },
                memberTypes: {
                    users: 'users',
                    groups: 'groups'
                },
                getMembers: () => new Promise(res => {
                    setTimeout(() => res(data), 100);
                })
            };

            const view = new core.form.editors.MembersSplitEditor({
                model,
                key: 'selectes',
                autocommit: true,
                users: listUsers,
                groups: listGroups,
                memberService
            });

            view.on('render', async() => {
                view.controller.view.on('attach', () => {
                    expect(view.$('.visible-loader')).toExist();
                });
                await view.controller.model.initialized;
                expect(view.$('.visible-loader')).not.toExist();
                done();
            });

            window.app
                .getView()
                .getRegion('contentRegion')
                .show(view);
        });
    });
});
