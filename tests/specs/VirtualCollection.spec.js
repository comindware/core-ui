/**
 * Developer: Stepan Burguchev
 * Date: 6/14/2016
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

"use strict";

import Chance from 'chance';
import chai from 'chai';
import core from 'coreApi';

let chance = new Chance();

var VirtualCollection = core.collections.VirtualCollection;
var SlidingWindowCollection = core.collections.SlidingWindowCollection;

var UserModel = Backbone.Model.extend({});
var TaskModel = Backbone.Model.extend({
    initialize: function () {
        _.extend(this, new core.list.models.behaviors.ListItemBehavior(this));
    }
});

chai.assert.sameSequence = function (actual, expected)
{
    expect(actual.length).toBe(expected.length);
    for (var i = 0, len = actual.length; i < len; i++) {
        var actualItemValue = actual.at ? actual.at(i) : actual[i];
        var expectedItemValue = expected.at ? expected.at(i) : expected[i];
        //noinspection JSHint
        if (actualItemValue != expectedItemValue) {
            // Assertion failed. Fire breakpoint to solve the problem.
            console.log('i =', i);
            actualItemValue && actualItemValue.toJSON && console.log('actual:', actualItemValue.toJSON());
            expectedItemValue && expectedItemValue.toJSON && console.log('expected:', expectedItemValue.toJSON());
        }
        chai.assert.equal(actualItemValue, expectedItemValue, 'The elements of array at ' + i + ' are equal');
    }
};

chai.assert.sameBackboneSequence = function (actual, expected)
{
    //noinspection JSUnresolvedVariable
    chai.expect(actual).to.have.length(expected.length);
    for (var i = 0, len = actual.length; i < len; i++) {
        chai.assert.equal(actual.at(i), expected.at(i), 'The elements of array at ' + i + ' are equal');
    }
};

chance.mixin({
    'user': function (predefinedAttributes) {
        return new UserModel({
            id: (predefinedAttributes && predefinedAttributes.id) || _.uniqueId(),
            name: (predefinedAttributes && predefinedAttributes.name) || chance.name()
        });
    }
});

var users = _.times(10, function () { return chance.user(); });

var titles = _.times(100, function () { return chance.sentence({ min: 4, max: 10 }); });
chance.mixin({
    'task': function (predefinedAttributes) {
        return {
            id: (predefinedAttributes && predefinedAttributes.id) || _.uniqueId(),
            title: (predefinedAttributes && predefinedAttributes.title) || titles[chance.integer({min: 0, max: titles.length - 1})],
            assignee: (predefinedAttributes && predefinedAttributes.assignee) || users[chance.integer({ min: 0, max: users.length - 1 })]
        };
    }
});

describe('Virtual Collection', function () {
    var assigneeGrouping = {
        modelFactory: function (model) {
            return model.get('assignee');
        },
        comparator: function (model) {
            return model.get('assignee').id;
        },
        iterator: function (model) {
            return model.get('assignee').get('name');
        },
        affectedAttributes: [
            'assignee'
        ]
    };

    var originalCollection;
    var virtualCollection;

    function createFixture(list, virtualCollectionOptions, originalCollectionOptions) {
        var options = { model: TaskModel };
        if (originalCollectionOptions) {
            _.extend(options, originalCollectionOptions);
        }
        originalCollection = new Backbone.Collection(list, options);
        virtualCollection = new VirtualCollection(originalCollection, virtualCollectionOptions);
        return virtualCollection;
    }

    describe('When grouping tree collection', function ()
    {
        it('should apply comparator to all levels of the tree', function ()
        {
            // Fixture setup and system exercise
            var count = 3;
            var rootTasks = _.times(count, function (n) {
                return new TaskModel(chance.task({
                    assignee: users[n % 2],
                    title: String(count - n)
                }));
            });
            rootTasks[1].children = new Backbone.Collection([
                new TaskModel(chance.task({
                    title: '2'
                })),
                new TaskModel(chance.task({
                    title: '1'
                }))
            ]);
            createFixture(rootTasks, {
                grouping: [ assigneeGrouping ],
                comparator: function (model) {
                    return model.get('title');
                }
            });

            // Verify outcome: all levels of the tree should be sorted now.
            chai.assert.sameSequence(virtualCollection, [
                virtualCollection.at(0),
                originalCollection.at(2),
                originalCollection.at(0),
                virtualCollection.at(3),
                originalCollection.at(1),
                originalCollection.at(1).children.at(0),
                originalCollection.at(1).children.at(1)
            ]);
        });
    });

    describe('When no grouping is set', function ()
    {
        it('should pass through default collection', function ()
        {
            createFixture(_.times(50, function () {
                return chance.task();
            }));

            chai.assert.sameBackboneSequence(virtualCollection, originalCollection);
        });
    });

    describe('When grouping plain list', function ()
    {
        it('should group by iterator', function ()
        {
            createFixture(_.times(4, function (n) {
                return chance.task({ assignee: users[n % 2] });
            }), {
                grouping: [ assigneeGrouping ]
            });

            chai.assert.sameSequence(virtualCollection, [
                virtualCollection.at(0),
                originalCollection.at(0),
                originalCollection.at(2),
                virtualCollection.at(3),
                originalCollection.at(1),
                originalCollection.at(3)
            ]);
        });

        it('should sort groups with comparator', function ()
        {
            var user1 = chance.user({ name: 'Ken' });
            var user2 = chance.user({ name: 'Ben' });
            createFixture(_.times(4, function (n) {
                return chance.task({ assignee: n % 2 ? user1 : user2 });
            }), {
                grouping: [
                    {
                        modelFactory: function (model) {
                            return model.get('assignee');
                        },
                        comparator: function (model)
                        {
                            return model.get('assignee').get('name');
                        },
                        iterator: function (model)
                        {
                            return model.get('assignee').get('id');
                        }
                    }
                ]
            });

            chai.assert.equal(virtualCollection.at(0).id, user2.id, 'Ben goes first');
            chai.assert.equal(virtualCollection.at(3).id, user1.id, 'Then goes Ken');
        });

        it('should sort items within a group with comparator function', function ()
        {
            var count = 4;
            createFixture(_.times(count, function (n) {
                return chance.task({
                    title: 'synthetic title ' + count--,
                    assignee: users[n % 2]
                });
            }), {
                grouping: [ assigneeGrouping ],
                comparator: function (model) {
                    return model.get('title');
                }
            });

            chai.assert.sameSequence(virtualCollection, [
                virtualCollection.at(0),
                originalCollection.at(2),
                originalCollection.at(0),
                virtualCollection.at(3),
                originalCollection.at(3),
                originalCollection.at(1)
            ]);
        });

        it('should accept group iterator as a model attrubute name', function ()
        {
            var count = 2;
            var fixture = createFixture(_.times(count, function () {
                return chance.task({
                    title: 'synthetic title ' + count--
                });
            }), {
                grouping: [
                    {
                        modelFactory: function (model) {
                            return new Backbone.Model({ title: model.get('title') });
                        },
                        comparator: function (model) {
                            return model.get('title');
                        },
                        iterator: 'title'
                    }
                ]
            });

            chai.assert.sameSequence(fixture, [
                fixture.at(0),
                originalCollection.at(1),
                fixture.at(2),
                originalCollection.at(0)
            ]);
        });

        it('should accept group comparator as a model attrubute name', function ()
        {
            var count = 2;
            var fixture = createFixture(_.times(count, function () {
                return chance.task({
                    title: 'synthetic title ' + count--
                });
            }), {
                grouping: [
                    {
                        modelFactory: function (model) {
                            return new Backbone.Model({ title: model.get('title') });
                        },
                        comparator: 'title',
                        iterator: 'title'
                    }
                ]
            });

            chai.assert.sameSequence(fixture, [
                fixture.at(0),
                originalCollection.at(1),
                fixture.at(2),
                originalCollection.at(0)
            ]);
        });

        it('should accept group modelFactory as a model attrubute name', function ()
        {
            var count = 2;
            var fixture = createFixture(_.times(count, function () {
                return chance.task({
                    title: 'synthetic title ' + count--
                });
            }), {
                grouping: [
                    {
                        modelFactory: 'title',
                        comparator: 'title',
                        iterator: 'title'
                    }
                ]
            });

            chai.assert.sameSequence(fixture, [
                fixture.at(0),
                originalCollection.at(1),
                fixture.at(2),
                originalCollection.at(0)
            ]);
            chai.assert.equal(fixture.at(0).get('displayText'), originalCollection.at(1).get('title'));
            chai.assert.equal(fixture.at(0).get('groupingModel'), true);
        });

        it('should be able to omit modelFactory and comparator', function ()
        {
            var count = 2;
            var fixture = createFixture(_.times(count, function () {
                return chance.task({
                    title: 'synthetic title ' + count--
                });
            }), {
                grouping: [
                    {
                        iterator: 'title'
                    }
                ]
            });

            chai.assert.sameSequence(fixture, [
                fixture.at(0),
                originalCollection.at(1),
                fixture.at(2),
                originalCollection.at(0)
            ]);
            chai.assert.equal(fixture.at(0).get('displayText'), originalCollection.at(1).get('title'));
            chai.assert.equal(fixture.at(0).get('groupingModel'), true);
        });

        it('should compute affected attributes from field based options', function ()
        {
            var count = 2;
            var fixture = createFixture(_.times(count, function () {
                return chance.task({
                    title: 'synthetic title ' + count--
                });
            }), {
                grouping: [
                    {
                        iterator: 'title'
                    }
                ]
            });

            originalCollection.at(0).set('title', 'synthetic title 0');

            chai.assert.sameSequence(fixture, [
                fixture.at(0),
                originalCollection.at(0),
                fixture.at(2),
                originalCollection.at(1)
            ]);
        });
    });

    describe('When changing a model', function ()
    {
        it('should update grouping on affected attribute change', function ()
        {
            var count = 4;
            var fixture = createFixture(_.times(count, function (n) {
                return chance.task({
                    assignee: users[n % 2]
                });
            }), {
                grouping: [ assigneeGrouping ]
            });
            var resetCallback = jasmine.createSpy('resetCallback');
            var addCallback = jasmine.createSpy('addCallback');
            var removeCallback = jasmine.createSpy('removeCallback');
            fixture.on('reset', resetCallback);
            fixture.on('add', addCallback);
            fixture.on('remove', removeCallback);

            originalCollection.at(0).set('assignee', users[1]);

            chai.assert.sameSequence(fixture, [
                virtualCollection.at(0),
                originalCollection.at(2),
                virtualCollection.at(2),
                originalCollection.at(0),
                originalCollection.at(1),
                originalCollection.at(3)
            ]);
            expect(resetCallback).toHaveBeenCalledTimes(1);
            expect(addCallback).not.toHaveBeenCalled();
            expect(removeCallback).not.toHaveBeenCalled();
        });

        it('should update sorting on affected attribute change', function ()
        {
            var count = 4;
            var fixture = createFixture(_.times(count, function (n) {
                return chance.task({
                    title: 'synthetic title ' + count--,
                    assignee: users[n % 2]
                });
            }), {
                grouping: [ assigneeGrouping ],
                comparator: function (model) {
                    return model.get('title');
                }
            });
            var resetCallback = jasmine.createSpy('resetCallback');
            var addCallback = jasmine.createSpy('addCallback');
            var removeCallback = jasmine.createSpy('removeCallback');
            fixture.on('reset', resetCallback);
            fixture.on('add', addCallback);
            fixture.on('remove', removeCallback);

            originalCollection.at(0).set('title', 'synthetic title 0');

            chai.assert.sameSequence(fixture, [
                fixture.at(0),
                originalCollection.at(0),
                originalCollection.at(2),
                fixture.at(3),
                originalCollection.at(3),
                originalCollection.at(1)
            ]);
            expect(resetCallback).toHaveBeenCalledTimes(1);
            expect(addCallback).not.toHaveBeenCalled();
            expect(removeCallback).not.toHaveBeenCalled();
        });
    });

    describe('When resetting parent collection', function ()
    {
        it('should reflect the changes', function ()
        {
            // Fixture setup
            createFixture(_.times(4, function (n) {
                return chance.task({
                    assignee: users[n % 2]
                });
            }), {
                grouping: [ assigneeGrouping ]
            });
            chai.assert.sameSequence(virtualCollection, [
                virtualCollection.at(0),
                originalCollection.at(0),
                originalCollection.at(2),
                virtualCollection.at(3),
                originalCollection.at(1),
                originalCollection.at(3)
            ]);

            // Exercise system
            originalCollection.reset(_.times(4, function (n) {
                return chance.task({
                    assignee: users[n % 2]
                });
            }));

            // Verify outcome
            chai.assert.sameSequence(virtualCollection, [
                virtualCollection.at(0),
                originalCollection.at(0),
                originalCollection.at(2),
                virtualCollection.at(3),
                originalCollection.at(1),
                originalCollection.at(3)
            ]);
        });
    });

    describe('When changing parent collection order', function ()
    {
        it('should reflect the changes on leaf level', function ()
        {
            // Fixture setup
            var count = 4;
            var i = count;
            createFixture(_.times(count, function (n) {
                return chance.task({
                    assignee: users[n % 2],
                    title: 'some title ' + i--
                });
            }), {
                grouping: [ assigneeGrouping ]
            });
            chai.assert.sameSequence(virtualCollection, [
                virtualCollection.at(0),
                originalCollection.at(0),
                originalCollection.at(2),
                virtualCollection.at(3),
                originalCollection.at(1),
                originalCollection.at(3)
            ]);

            // Exercise system
            originalCollection.comparator = function (model) {
                return model.get('title');
            };
            originalCollection.sort();

            // Verify outcome
            chai.assert.sameSequence(virtualCollection, [
                virtualCollection.at(0),
                originalCollection.at(1),
                originalCollection.at(3),
                virtualCollection.at(3),
                originalCollection.at(0),
                originalCollection.at(2)
            ]);
        });
    });

    describe('When filtering collection', function ()
    {
        it('should filter grouped list', function ()
        {
            // Fixture setup and system exercise
            var count = 4;
            createFixture(_.times(count, function (n) {
                return chance.task({
                    assignee: users[n % 2]
                });
            }), {
                grouping: [ assigneeGrouping ],
                filter: function (model) {
                    return model.get('assignee') === users[1];
                }
            });

            // Verify outcome
            chai.assert.sameSequence(virtualCollection, [
                virtualCollection.at(0),
                originalCollection.at(1),
                originalCollection.at(3)
            ]);
        });
    });

    describe('When getting single value', function ()
    {
        it('should return it by id index', function ()
        {
            createFixture(_.times(10, function () {
                return chance.task();
            }), {
                grouping: [ assigneeGrouping ]
            });

            var expectedModel = originalCollection.at(0);
            var actualModel = virtualCollection.get(expectedModel.id);

            chai.assert.equal(expectedModel, actualModel);
        });
    });

    describe('When removing item', function ()
    {
        it('should remove item with full reset', function ()
        {
            var fixture = createFixture(_.times(3, function () {
                return chance.task();
            }));
            var resetCallback = jasmine.createSpy('resetCallback');
            var addCallback = jasmine.createSpy('addCallback');
            var removeCallback = jasmine.createSpy('removeCallback');
            fixture.on('reset', resetCallback);
            fixture.on('add', addCallback);
            fixture.on('remove', removeCallback);

            originalCollection.remove(originalCollection.at(1));

            chai.assert.sameMembers(fixture.models, originalCollection.models);
            expect(resetCallback).toHaveBeenCalledTimes(1);
            expect(addCallback).not.toHaveBeenCalled();
            expect(removeCallback).not.toHaveBeenCalled();
        });

        it('should remove empty parent groups', function ()
        {
            var fixture = createFixture(_.times(3, function (n) {
                return chance.task({
                    assignee: users[n]
                });
            }), {
                grouping: [ assigneeGrouping ]
            });

            originalCollection.remove(originalCollection.at(1));

            chai.assert.sameSequence(fixture, [
                fixture.at(0),
                originalCollection.at(0),
                fixture.at(2),
                originalCollection.at(1)
            ]);
        });

        it('should not remove parent groups if it is not empty', function ()
        {
            var fixture = createFixture(_.times(4, function (n) {
                return chance.task({
                    assignee: users[n % 2]
                });
            }), {
                grouping: [ assigneeGrouping ]
            });

            originalCollection.remove(originalCollection.at(1));

            chai.assert.sameSequence(fixture, [
                fixture.at(0),
                originalCollection.at(0),
                originalCollection.at(1),
                fixture.at(3),
                originalCollection.at(2)
            ]);
        });
    });

    describe('When adding item', function ()
    {
        it('should add item with full reset', function ()
        {
            var fixture = createFixture(_.times(3, function () {
                return chance.task();
            }), { delayedAdd: false });
            var newTask = chance.task();
            var resetCallback = jasmine.createSpy('resetCallback');
            var addCallback = jasmine.createSpy('addCallback');
            var removeCallback = jasmine.createSpy('removeCallback');
            fixture.on('reset', resetCallback);
            fixture.on('add', addCallback);
            fixture.on('remove', removeCallback);

            originalCollection.add(newTask);

            chai.assert.sameMembers(fixture.models, originalCollection.models);
            expect(resetCallback).toHaveBeenCalledTimes(1);
            expect(addCallback).not.toHaveBeenCalled();
            expect(removeCallback).not.toHaveBeenCalled();
        });

        it('should add missing parent groups', function ()
        {
            var fixture = createFixture(_.times(2, function (n) {
                return chance.task({
                    assignee: users[n]
                });
            }), {
                grouping: [ assigneeGrouping ],
                delayedAdd: false
            });
            var newTask = chance.task({ assignee: users[2] });

            originalCollection.add(newTask);

            chai.assert.sameSequence(fixture, [
                fixture.at(0),
                originalCollection.at(0),
                fixture.at(2),
                originalCollection.at(1),
                fixture.at(4),
                originalCollection.at(2)
            ]);
        });

        it('should add item at exact position', function ()
        {
            var count = 4;
            var fixture = createFixture(_.times(count, function (n) {
                return chance.task({
                    title: 'synthetic title ' + count--,
                    assignee: users[n % 2]
                });
            }), {
                grouping: [ assigneeGrouping ],
                comparator: function (model) {
                    return model.get('title');
                },
                delayedAdd: false
            });

            var newTask = new Backbone.Model(chance.task({ assignee: users[0], title: "synthetic title 0" }));
            fixture.add(newTask, { at: 6 });

            chai.assert.sameSequence(fixture, [
                fixture.at(0),
                originalCollection.at(2),
                originalCollection.at(0),
                fixture.at(3),
                originalCollection.at(3),
                originalCollection.at(1),
                newTask
            ]);
        });

        it('should update internal index while adding item at exact position', function ()
        {
            var count = 4;
            var fixture = createFixture(_.times(count, function (n) {
                return chance.task({
                    title: 'synthetic title ' + count--,
                    assignee: users[n % 2]
                });
            }), {
                grouping: [ assigneeGrouping ],
                comparator: function (model) {
                    return model.get('title');
                },
                delayedAdd: false
            });

            var newTask = new Backbone.Model(chance.task({ assignee: users[0], title: "synthetic title 0" }));
            fixture.add(newTask, { at: 6 });
            fixture.__rebuildModels();

            chai.assert.sameSequence(fixture, [
                fixture.at(0),
                originalCollection.at(2),
                originalCollection.at(0),
                fixture.at(3),
                originalCollection.at(3),
                originalCollection.at(1),
                newTask
            ]);
        });
    });
});

describe('SlidingWindow Collection', function ()
{
    var originalCollection;
    var windowCollection;

    function createFixture(options, list) {
        if (!list) {
            list = _.times(10, function () {
                return chance.task();
            });
        }

        originalCollection = new Backbone.Collection(list);
        windowCollection = new SlidingWindowCollection(originalCollection, options);
        return windowCollection;
    }

    describe('When initializing', function ()
    {
        it('should have position 0 and default window size', function ()
        {
            var fixture = createFixture();

            chai.assert.equal(fixture.length, 0);
            chai.assert.equal(fixture.models.length, 0);
        });
    });

    describe('When setting window size', function ()
    {
        it('should have correct element count', function ()
        {
            var fixture = createFixture();

            fixture.updateWindowSize(3);

            chai.assert.sameSequence(fixture, originalCollection.first(3));
        });
    });

    describe('When setting position', function ()
    {
        it('should have correct elements offset', function ()
        {
            var fixture = createFixture();

            fixture.updateWindowSize(3);
            fixture.updatePosition(3);

            chai.assert.sameSequence(fixture, originalCollection.chain().rest(3).first(3).value());
        });
    });

    describe('When dramatically changing position', function ()
    {
        it('should trigger reset', function ()
        {
            var fixture = createFixture({ windowSize: 3 });
            var resetCallback = jasmine.createSpy('resetCallback');
            var addCallback = jasmine.createSpy('addCallback');
            var removeCallback = jasmine.createSpy('removeCallback');
            fixture.on('reset', resetCallback);
            fixture.on('add', addCallback);
            fixture.on('remove', removeCallback);

            fixture.updatePosition(6);

            chai.assert.sameSequence(fixture, originalCollection.chain().rest(6).first(3).value());
            expect(resetCallback).toHaveBeenCalledTimes(1);
            expect(addCallback).not.toHaveBeenCalled();
            expect(removeCallback).not.toHaveBeenCalled();
        });
    });

    describe('When slightly changing position', function ()
    {
        it('should trigger add/remove going +1', function ()
        {
            var fixture = createFixture({ windowSize: 3 });
            var resetCallback = jasmine.createSpy('resetCallback');
            var addCallback = jasmine.createSpy('addCallback');
            var removeCallback = jasmine.createSpy('removeCallback');
            fixture.on('reset', resetCallback);
            fixture.on('add', addCallback);
            fixture.on('remove', removeCallback);

            fixture.updatePosition(1);

            chai.assert.sameSequence(fixture, originalCollection.chain().rest(1).first(3).value());
            expect(resetCallback).not.toHaveBeenCalled();
            expect(addCallback).toHaveBeenCalledTimes(1);
            expect(removeCallback).toHaveBeenCalledTimes(1);
        });

        it('should trigger add/remove going -1', function ()
        {
            var fixture = createFixture({ position: 2, windowSize: 3 });
            var resetCallback = jasmine.createSpy('resetCallback');
            var addCallback = jasmine.createSpy('addCallback');
            var removeCallback = jasmine.createSpy('removeCallback');
            fixture.on('reset', resetCallback);
            fixture.on('add', addCallback);
            fixture.on('remove', removeCallback);

            fixture.updatePosition(1);

            chai.assert.sameSequence(fixture, originalCollection.chain().rest(1).first(3).value());
            expect(resetCallback).not.toHaveBeenCalled();
            expect(addCallback).toHaveBeenCalledTimes(1);
            expect(removeCallback).toHaveBeenCalledTimes(1);
        });
    });

    describe('When window cannot be filled complete', function ()
    {
        it('should trim window if window size is too big', function ()
        {
            var fixture = createFixture({ windowSize: 8 });

            fixture.updateWindowSize(11);

            chai.assert.sameSequence(fixture, originalCollection);
            chai.assert.equal(fixture.state.position, 0);
        });

        it('should return back to normal after window trimming', function ()
        {
            var fixture = createFixture({ windowSize: 8 });

            fixture.updateWindowSize(15);
            fixture.updateWindowSize(3);

            chai.assert.sameSequence(fixture, originalCollection.chain().rest(0).first(3).value());
            chai.assert.equal(fixture.state.position, 0);
        });
    });

    describe('When near the top border', function ()
    {
        it('should trim window if there are no items ahead', function ()
        {
            var fixture = createFixture({ windowSize: 3 });

            fixture.updatePosition(8);

            chai.assert.sameSequence(fixture, originalCollection.chain().rest(8).first(2).value());
        });

        it('should return back to normal after window trimming', function ()
        {
            var fixture = createFixture({ windowSize: 3 });

            fixture.updatePosition(8);
            fixture.updatePosition(3);

            chai.assert.sameSequence(fixture, originalCollection.chain().rest(3).first(3).value());
        });
    });
});