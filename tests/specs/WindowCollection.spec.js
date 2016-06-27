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
import { expectCollectionsToBeEqual, expectToHaveSameMembers } from '../helpers';
import { TaskModel, UserModel, addChanceMixins } from '../testData';

let chance = new Chance();
let repository = addChanceMixins(chance);

describe('SlidingWindow Collection', function ()
{
    var originalCollection;
    var windowCollection;

    function createFixture(options) {
        originalCollection = new Backbone.Collection(_.times(10, function () {
                return chance.task();
            }));
        windowCollection = new core.collections.SlidingWindowCollection(originalCollection, options);
        return windowCollection;
    }

    describe('When initializing', function ()
    {
        it('should have position 0 and default window size', function ()
        {
            var fixture = createFixture();

            expect(fixture.length).toEqual(0);
            expect(fixture.models.length).toEqual(0);
        });
    });

    describe('When setting window size', function ()
    {
        it('should have correct element count', function ()
        {
            var fixture = createFixture();

            fixture.updateWindowSize(3);

            expectCollectionsToBeEqual(fixture, originalCollection.first(3));
        });
    });

    describe('When setting position', function ()
    {
        it('should have correct elements offset', function ()
        {
            var fixture = createFixture();

            fixture.updateWindowSize(3);
            fixture.updatePosition(3);

            expectCollectionsToBeEqual(fixture, originalCollection.chain().rest(3).first(3).value());
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

            expectCollectionsToBeEqual(fixture, originalCollection.chain().rest(6).first(3).value());
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

            expectCollectionsToBeEqual(fixture, originalCollection.chain().rest(1).first(3).value());
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

            expectCollectionsToBeEqual(fixture, originalCollection.chain().rest(1).first(3).value());
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

            expectCollectionsToBeEqual(fixture, originalCollection);
            expect(fixture.state.position).toEqual(0);
        });

        it('should return back to normal after window trimming', function ()
        {
            var fixture = createFixture({ windowSize: 8 });

            fixture.updateWindowSize(15);
            fixture.updateWindowSize(3);

            expectCollectionsToBeEqual(fixture, originalCollection.chain().rest(0).first(3).value());
            expect(fixture.state.position).toEqual(0);
        });
    });

    describe('When near the top border', function ()
    {
        it('should trim window if there are no items ahead', function ()
        {
            var fixture = createFixture({ windowSize: 3 });

            fixture.updatePosition(8);

            expectCollectionsToBeEqual(fixture, originalCollection.chain().rest(8).first(2).value());
        });

        it('should return back to normal after window trimming', function ()
        {
            var fixture = createFixture({ windowSize: 3 });

            fixture.updatePosition(8);
            fixture.updatePosition(3);

            expectCollectionsToBeEqual(fixture, originalCollection.chain().rest(3).first(3).value());
        });
    });
});
