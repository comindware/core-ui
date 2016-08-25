/**
 * Developer: Stepan Burguchev
 * Date: 6/14/2016
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

"use strict";

import Chance from 'chance';
import core from 'coreApi';
import { expectCollectionsToBeEqual, expectToHaveSameMembers } from '../utils/helpers';
import { TaskModel, addChanceMixins } from '../utils/testData';

let chance = new Chance();
let repository = addChanceMixins(chance);

describe('VirtualCollection', function () {
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

    function generateTask(attributes) {
        return new TaskModel(chance.task(attributes));
    }

    function generateTaskArray(len, fn) {
        if (!fn) {
            fn = () => {};
        }
        return _.times(len, n => generateTask(fn(n)));
    }

    function createFixture(list, virtualCollectionOptions, collectionOptions) {
        let options = _.extend({ model: TaskModel }, collectionOptions);
        let collection = new Backbone.Collection(list, options);
        let virtualCollection = new core.collections.VirtualCollection(collection, virtualCollectionOptions);
        return {
            collection,
            virtualCollection
        };
    }

    describe('When grouping tree collection', function ()
    {
        it('should apply comparator to all levels of the tree', function ()
        {
            let count = 3;
            let tasks = generateTaskArray(count, n => ({
                assignee: repository.users[n % 2],
                title: String(count - n)
            }));
            tasks[1].children = new Backbone.Collection([
                generateTask({
                    title: '2'
                }),
                generateTask({
                    title: '1'
                })
            ]);
            let { collection, virtualCollection } = createFixture(tasks, {
                grouping: [ assigneeGrouping ],
                comparator: function (model) {
                    return model.get('title');
                }
            });

            // all levels of the tree must be in correct order
            expectCollectionsToBeEqual(virtualCollection, [
                virtualCollection.at(0),
                collection.at(2),
                collection.at(0),
                virtualCollection.at(3),
                collection.at(1),
                collection.at(1).children.at(0),
                collection.at(1).children.at(1)
            ]);
        });
    });

    describe('When no grouping is set', function ()
    {
        it('should pass through default collection', function ()
        {
            let { collection, virtualCollection } = createFixture(generateTaskArray(50));

            expectCollectionsToBeEqual(virtualCollection, collection);
        });
    });

    describe('When grouping plain list', function ()
    {
        it('should group by iterator', function ()
        {
            let { collection, virtualCollection } = createFixture(generateTaskArray(4, n => ({ assignee: repository.users[n % 2] })), {
                grouping: [ assigneeGrouping ]
            });

            expectCollectionsToBeEqual(virtualCollection, [
                virtualCollection.at(0),
                collection.at(0),
                collection.at(2),
                virtualCollection.at(3),
                collection.at(1),
                collection.at(3)
            ]);
        });

        it('should sort groups with comparator', function ()
        {
            let user1 = chance.user({ name: 'Ken' });
            let user2 = chance.user({ name: 'Ben' });
            let { virtualCollection } = createFixture(generateTaskArray(4, n => ({ assignee: n % 2 ? user1 : user2 })), {
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

            expect(virtualCollection.at(0).id).toEqual(user2.id, 'Ben goes first');
            expect(virtualCollection.at(3).id).toEqual(user1.id, 'Then goes Ken');
        });

        it('should sort items within a group with comparator function', function ()
        {
            let count = 4;
            let { collection, virtualCollection } = createFixture(generateTaskArray(count, n => ({
                title: 'synthetic title ' + (count - n),
                assignee: repository.users[n % 2]
            })), {
                grouping: [ assigneeGrouping ],
                comparator: function (model) {
                    return model.get('title');
                }
            });

            expectCollectionsToBeEqual(virtualCollection, [
                virtualCollection.at(0),
                collection.at(2),
                collection.at(0),
                virtualCollection.at(3),
                collection.at(3),
                collection.at(1)
            ]);
        });

        it('should accept group iterator as a model attrubute name', function ()
        {
            let count = 2;
            let { collection, virtualCollection } = createFixture(generateTaskArray(count, n => ({
                title: 'synthetic title ' + (count - n)
            })), {
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

            expectCollectionsToBeEqual(virtualCollection, [
                virtualCollection.at(0),
                collection.at(1),
                virtualCollection.at(2),
                collection.at(0)
            ]);
        });

        it('should accept group comparator as a model attrubute name', function ()
        {
            let count = 2;
            let { collection, virtualCollection } = createFixture(generateTaskArray(count, n => ({
                title: 'synthetic title ' + (count - n)
            })), {
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

            expectCollectionsToBeEqual(virtualCollection, [
                virtualCollection.at(0),
                collection.at(1),
                virtualCollection.at(2),
                collection.at(0)
            ]);
        });

        it('should accept group modelFactory as a model attrubute name', function ()
        {
            let count = 2;
            let { collection, virtualCollection } = createFixture(generateTaskArray(count, n => ({
                title: 'synthetic title ' + (count - n)
            })), {
                grouping: [
                    {
                        modelFactory: 'title',
                        comparator: 'title',
                        iterator: 'title'
                    }
                ]
            });

            expectCollectionsToBeEqual(virtualCollection, [
                virtualCollection.at(0),
                collection.at(1),
                virtualCollection.at(2),
                collection.at(0)
            ]);
            expect(virtualCollection.at(0).get('displayText')).toEqual(collection.at(1).get('title'));
            expect(virtualCollection.at(0).get('groupingModel')).toEqual(true);
        });

        it('should be able to omit modelFactory and comparator', function ()
        {
            let count = 2;
            let { collection, virtualCollection } = createFixture(generateTaskArray(count, n => ({
                title: 'synthetic title ' + (count - n)
            })), {
                grouping: [
                    {
                        iterator: 'title'
                    }
                ]
            });

            expectCollectionsToBeEqual(virtualCollection, [
                virtualCollection.at(0),
                collection.at(1),
                virtualCollection.at(2),
                collection.at(0)
            ]);
            expect(virtualCollection.at(0).get('displayText')).toEqual(collection.at(1).get('title'));
            expect(virtualCollection.at(0).get('groupingModel')).toEqual(true);
        });

        it('should compute affected attributes from field based options', function ()
        {
            let count = 2;
            let { collection, virtualCollection } = createFixture(generateTaskArray(count, n => ({
                title: 'synthetic title ' + (count - n)
            })), {
                grouping: [
                    {
                        iterator: 'title'
                    }
                ]
            });

            collection.at(0).set('title', 'synthetic title 0');

            expectCollectionsToBeEqual(virtualCollection, [
                virtualCollection.at(0),
                collection.at(0),
                virtualCollection.at(2),
                collection.at(1)
            ]);
        });
    });

    describe('When changing a model', function ()
    {
        it('should update grouping on affected attribute change', function ()
        {
            let count = 4;
            let { collection, virtualCollection } = createFixture(generateTaskArray(count, n => ({
                    assignee: repository.users[n % 2]
            })), {
                grouping: [ assigneeGrouping ]
            });
            let resetCallback = jasmine.createSpy('resetCallback');
            let addCallback = jasmine.createSpy('addCallback');
            let removeCallback = jasmine.createSpy('removeCallback');
            virtualCollection.on('reset', resetCallback);
            virtualCollection.on('add', addCallback);
            virtualCollection.on('remove', removeCallback);

            collection.at(0).set('assignee', repository.users[1]);

            expectCollectionsToBeEqual(virtualCollection, [
                virtualCollection.at(0),
                collection.at(2),
                virtualCollection.at(2),
                collection.at(0),
                collection.at(1),
                collection.at(3)
            ]);
            expect(resetCallback).toHaveBeenCalledTimes(1);
            expect(addCallback).not.toHaveBeenCalled();
            expect(removeCallback).not.toHaveBeenCalled();
        });

        it('should update sorting on affected attribute change', function ()
        {
            let count = 4;
            let { collection, virtualCollection } = createFixture(generateTaskArray(count, n => ({
                title: 'synthetic title ' + (count - n),
                assignee: repository.users[n % 2]
            })), {
                grouping: [ assigneeGrouping ],
                comparator: function (model) {
                    return model.get('title');
                }
            });
            let resetCallback = jasmine.createSpy('resetCallback');
            let addCallback = jasmine.createSpy('addCallback');
            let removeCallback = jasmine.createSpy('removeCallback');
            virtualCollection.on('reset', resetCallback);
            virtualCollection.on('add', addCallback);
            virtualCollection.on('remove', removeCallback);

            collection.at(0).set('title', 'synthetic title 0');

            expectCollectionsToBeEqual(virtualCollection, [
                virtualCollection.at(0),
                collection.at(0),
                collection.at(2),
                virtualCollection.at(3),
                collection.at(3),
                collection.at(1)
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
            let { collection, virtualCollection } = createFixture(generateTaskArray(4, n => ({
                assignee: repository.users[n % 2]
            })), {
                grouping: [ assigneeGrouping ]
            });
            expectCollectionsToBeEqual(virtualCollection, [
                virtualCollection.at(0),
                collection.at(0),
                collection.at(2),
                virtualCollection.at(3),
                collection.at(1),
                collection.at(3)
            ]);

            // Exercise system
            collection.reset(generateTaskArray(4, n => ({
                assignee: repository.users[n % 2]
            })));

            // Verify outcome
            expectCollectionsToBeEqual(virtualCollection, [
                virtualCollection.at(0),
                collection.at(0),
                collection.at(2),
                virtualCollection.at(3),
                collection.at(1),
                collection.at(3)
            ]);
        });
    });

    describe('When changing parent collection order', function ()
    {
        it('should reflect the changes on leaf level', function ()
        {
            // Fixture setup
            let count = 4;
            let { collection, virtualCollection } = createFixture(generateTaskArray(count, n => ({
                assignee: repository.users[n % 2],
                title: 'some title ' + (count - n)
            })), {
                grouping: [ assigneeGrouping ]
            });
            expectCollectionsToBeEqual(virtualCollection, [
                virtualCollection.at(0),
                collection.at(0),
                collection.at(2),
                virtualCollection.at(3),
                collection.at(1),
                collection.at(3)
            ]);

            // Exercise system
            collection.comparator = function (model) {
                return model.get('title');
            };
            collection.sort();

            // Verify outcome
            expectCollectionsToBeEqual(virtualCollection, [
                virtualCollection.at(0),
                collection.at(1),
                collection.at(3),
                virtualCollection.at(3),
                collection.at(0),
                collection.at(2)
            ]);
        });
    });

    describe('When filtering collection', function ()
    {
        it('should filter grouped list', function ()
        {
            // Fixture setup and system exercise
            let count = 4;
            let { collection, virtualCollection } = createFixture(generateTaskArray(count, n => ({
                assignee: repository.users[n % 2]
            })), {
                grouping: [ assigneeGrouping ],
                filter: function (model) {
                    return model.get('assignee') === repository.users[1];
                }
            });

            // Verify outcome
            expectCollectionsToBeEqual(virtualCollection, [
                virtualCollection.at(0),
                collection.at(1),
                collection.at(3)
            ]);
        });
    });

    describe('When getting single value', function ()
    {
        it('should return it by id index', function ()
        {
            let { collection, virtualCollection } = createFixture(generateTaskArray(10), {
                grouping: [ assigneeGrouping ]
            });

            let expectedModel = collection.at(0);
            let actualModel = virtualCollection.get(expectedModel.id);

            expect(expectedModel).toEqual(actualModel);
        });
    });

    describe('When removing item', function ()
    {
        it('should remove item with full reset', function ()
        {
            let { collection, virtualCollection } = createFixture(generateTaskArray(3));
            let resetCallback = jasmine.createSpy('resetCallback');
            let addCallback = jasmine.createSpy('addCallback');
            let removeCallback = jasmine.createSpy('removeCallback');
            virtualCollection.on('reset', resetCallback);
            virtualCollection.on('add', addCallback);
            virtualCollection.on('remove', removeCallback);

            collection.remove(collection.at(1));

            expectToHaveSameMembers(virtualCollection.models, collection.models);
            expect(resetCallback).toHaveBeenCalledTimes(1);
            expect(addCallback).not.toHaveBeenCalled();
            expect(removeCallback).not.toHaveBeenCalled();
        });

        it('should remove empty parent groups', function ()
        {
            let { collection, virtualCollection } = createFixture(generateTaskArray(3, n => ({
                assignee: repository.users[n]
            })), {
                grouping: [ assigneeGrouping ]
            });

            collection.remove(collection.at(1));

            expectCollectionsToBeEqual(virtualCollection, [
                virtualCollection.at(0),
                collection.at(0),
                virtualCollection.at(2),
                collection.at(1)
            ]);
        });

        it('should not remove parent groups if it is not empty', function ()
        {
            let { collection, virtualCollection } = createFixture(generateTaskArray(4, n => ({
                assignee: repository.users[n % 2]
            })), {
                grouping: [ assigneeGrouping ]
            });

            collection.remove(collection.at(1));

            expectCollectionsToBeEqual(virtualCollection, [
                virtualCollection.at(0),
                collection.at(0),
                collection.at(1),
                virtualCollection.at(3),
                collection.at(2)
            ]);
        });
    });

    describe('When adding item', function ()
    {
        it('should add item with full reset', function ()
        {
            let { collection, virtualCollection } = createFixture(generateTaskArray(3), { delayedAdd: false });
            let newTask = generateTask();
            let resetCallback = jasmine.createSpy('resetCallback');
            let addCallback = jasmine.createSpy('addCallback');
            let removeCallback = jasmine.createSpy('removeCallback');
            virtualCollection.on('reset', resetCallback);
            virtualCollection.on('add', addCallback);
            virtualCollection.on('remove', removeCallback);

            collection.add(newTask);

            expectToHaveSameMembers(virtualCollection.models, collection.models);
            expect(resetCallback).toHaveBeenCalledTimes(1);
            expect(addCallback).not.toHaveBeenCalled();
            expect(removeCallback).not.toHaveBeenCalled();
        });

        it('should add missing parent groups', function ()
        {
            let { collection, virtualCollection } = createFixture(generateTaskArray(2, n => ({
                assignee: repository.users[n]
            })), {
                grouping: [ assigneeGrouping ],
                delayedAdd: false
            });
            let newTask = generateTask({ assignee: repository.users[2] });

            collection.add(newTask);

            expectCollectionsToBeEqual(virtualCollection, [
                virtualCollection.at(0),
                collection.at(0),
                virtualCollection.at(2),
                collection.at(1),
                virtualCollection.at(4),
                collection.at(2)
            ]);
        });

        it('should add item at exact position', function ()
        {
            let count = 4;
            let { collection, virtualCollection } = createFixture(generateTaskArray(count, n => ({
                title: 'synthetic title ' + (count - n),
                assignee: repository.users[n % 2]
            })), {
                grouping: [ assigneeGrouping ],
                comparator: function (model) {
                    return model.get('title');
                },
                delayedAdd: false
            });

            let newTask = generateTask({
                assignee: repository.users[0],
                title: "synthetic title 0"
            });
            virtualCollection.add(newTask, { at: 6 });

            expectCollectionsToBeEqual(virtualCollection, [
                virtualCollection.at(0),
                collection.at(2),
                collection.at(0),
                virtualCollection.at(3),
                collection.at(3),
                collection.at(1),
                newTask
            ]);
        });

        it('should update internal index while adding item at exact position', function ()
        {
            let count = 4;
            let { collection, virtualCollection } = createFixture(generateTaskArray(count, n => ({
                title: 'synthetic title ' + (count - n),
                assignee: repository.users[n % 2]
            })), {
                grouping: [ assigneeGrouping ],
                comparator: function (model) {
                    return model.get('title');
                },
                delayedAdd: false
            });

            let newTask = generateTask({
                assignee: repository.users[0],
                title: "synthetic title 0"
            });
            virtualCollection.add(newTask, { at: 6 });
            virtualCollection.__rebuildModels();

            expectCollectionsToBeEqual(virtualCollection, [
                virtualCollection.at(0),
                collection.at(2),
                collection.at(0),
                virtualCollection.at(3),
                collection.at(3),
                collection.at(1),
                newTask
            ]);
        });
    });
});
