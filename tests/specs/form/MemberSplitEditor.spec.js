/*eslint-ignore*/

import core from 'coreApi';
import 'jasmine-jquery';
import FocusTests from './FocusTests';
import { memberService, data } from '../../utils/memberService';

describe('Editors', () => {
    describe('Member Split Editor', () => {
        let timer;
        afterEach(() => {
            clearTimeout(timer);
        });
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
                    groups: new Backbone.Collection(),
                    memberService
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

        it('should render in showMode: button, even setValue null', done => {
            const view = new core.form.editors.MembersSplitEditor({
                autocommit: true,
                showMode: 'button',
                getDisplayText: true
            });

            view.on('render', () => {
                timer = setTimeout(() => {
                    expect(view.$('.js-members-text')).toContainText('groups');
                    view.setValue(null);
                    timer = setTimeout(() => {
                        expect(view.$('.js-members-text')).toContainText('groups');
                    }, 100);
                    done();
                }, 100);
            });

            window.app
                .getView()
                .getRegion('contentRegion')
                .show(view);
        });

        it('should work with custom display text', done => {
            const model = new Backbone.Model({
                selected: ['dog.1', 'dog.2', 'dog.4']
            });
            const view = new core.form.editors.MembersSplitEditor({
                model,
                key: 'selected',
                autocommit: true,
                showMode: 'button',
                getDisplayText: dogs => `Here I have ${dogs.length} dogs`
            });

            view.on('render', () => {
                timer = setTimeout(() => {
                    expect(view.$('.js-members-text')).toContainText('Here I have 3 dogs');
                    view.setValue(['dog.1', 'dog.2', 'dog.4', 'dog.7']);
                    timer = setTimeout(() => {
                        expect(view.$('.js-members-text')).toContainText('Here I have 4 dogs');
                        view.setValue(null);
                        timer = setTimeout(() => {
                            expect(view.$('.js-members-text')).toContainText('Here I have 0 dogs');
                            done();
                        }, 100);
                    }, 100);
                }, 100);
            });

            window.app
                .getView()
                .getRegion('contentRegion')
                .show(view);
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
                timer = setTimeout(() => {
                    expect(view.$('.js-members-text')).toContainText('3 people'); // 3 users selected
                    view.setValue(['user.1', 'user.2', 'user.4', 'user.5']);
                    timer = setTimeout(() => {
                        expect(view.$('.js-members-text')).toContainText('4 people'); // 4 users selected
                        done();
                    }, 100);
                }, 100);
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
                timer = setTimeout(() => {
                    expect(view.$('.js-members-text')).not.toContainText('3'); // 3 users selected (hidden)
                    done();
                }, 100);
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
                    const first = setTimeout(() => {
                        if (
                            view
                                .$('.member-split-wrp .member-split-grid .visible-collection')
                                .last()
                                .children().length > 1
                        ) {
                            clearTimeout(first);
                            view.$('.member-split-wrp .member-split-grid .move-all-btn')
                                .last()
                                .click();
                            const second = setTimeout(() => {
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

            const getFirstAvailableElement = () => view
                .$('.member-split-wrp .member-split-grid .visible-collection .cell').first();

            view.on('render', () => {
                view.controller.view.on('attach', () => {
                    const first = setTimeout(() => {
                        if (!isAvailableListEmpty(view)) {
                            expect(getFirstAvailableElement()).not.toContainText('Group');
                            clearTimeout(first);
                            view.$('.member-split-wrp .member-split-grid .filter-users-btn')
                                .first()
                                .click();

                            const second = setTimeout(() => {
                                expect(getFirstAvailableElement()).toContainText('Group');
                                clearTimeout(second);
                                done();
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
            const service = {
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
                key: 'selected',
                autocommit: true,
                users: listUsers,
                groups: listGroups,
                memberService: service
            });

             const getFirstAvailableElement = () => view
                .$('.member-split-wrp .member-split-grid .visible-collection .cell').first();

            view.on('render', () => {
                view.controller.view.on('attach', () => {
                    const first = setTimeout(() => {
                        if (!isAvailableListEmpty(view)) {
                            expect(getFirstAvailableElement()).not.toContainText('Group');
                            clearTimeout(first);
                            view.$('.member-split-wrp .member-split-grid .filter-users-btn')
                                .first()
                                .click();

                            const second = setTimeout(() => {
                                expect(getFirstAvailableElement()).toContainText('Group');
                                clearTimeout(second);
                                done();
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

        it('should correctly process member items', done => {
            const model = new Backbone.Model({
                available: [], // No initial values (should get data from server)
                selected: []
            });

            const view = new core.form.editors.MembersSplitEditor({
                key: 'selected',
                autocommit: true,
                model,
                showMode: 'button',
                getDisplayText: true,
                memberService
            });

            view.on('render', () => {
                view.setValue(['account.7', 'account.8', 'group.9']);
                timer = setTimeout(() => {
                    expect(view.$('.js-members-text')).toContainText('2 people 1 group');
                    view.setValue(null);
                    timer = setTimeout(() => {
                        expect(view.$('.js-members-text')).toContainText('0 people');
                        done();
                    }, 200);
                }, 200);
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

            const view = new core.form.editors.MembersSplitEditor({
                model,
                key: 'selected',
                autocommit: true,
                memberService
            });

            view.on('render', () => {
                view.controller.view.on('attach', () => {
                    expect(view.$('.visible-loader')).toExist();
                });
                timer = setTimeout(() => {
                    expect(view.$('.visible-loader')).not.toExist();
                    done();
                }, 200);
            });

            window.app
                .getView()
                .getRegion('contentRegion')
                .show(view);
        });

        it('should correctly set quantity warning', done => {
            const model = new Backbone.Model({
                available: [],
                selected: []
            });

            const view = new core.form.editors.MembersSplitEditor({
                model,
                autocommit: true,
                getDisplayText: true,
                showMode: null,
                memberService
            });

            view.on('render', () => {
                view.setValue(['account.7', 'account.8', 'group.9']);
                timer = setTimeout(() => {
                    expect(view.$('.js-quantity-warning-region')).toBeHidden();
                    done();
                }, 500);
            });

            window.app
                .getView()
                .getRegion('contentRegion')
                .show(view);
        });

        it('should correctly set quantity warning', done => {
            const model = new Backbone.Model({
                available: [],
                selected: []
            });

            const newData = Object.assign({}, data);
            newData.totalCount = 20;
            const newMemberService = Object.assign({}, memberService);
            newMemberService.getMembers = () => new Promise(res => {
                timer = setTimeout(() => res(newData), 100);
            });

            const view = new core.form.editors.MembersSplitEditor({
                model,
                autocommit: true,
                getDisplayText: true,
                showMode: null,
                newMemberService
            });

            view.on('render', () => {
                view.setValue(['account.7', 'account.8', 'group.9']);
                timer = setTimeout(() => {
                    expect(view.$('.js-quantity-warning-region')).not.toBeHidden();
                    done();
                }, 500);
            });

            window.app
                .getView()
                .getRegion('contentRegion')
                .show(view);
        });
    });
});
