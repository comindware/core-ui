/**
 * Developer: Stepan Burguchev
 * Date: 6/27/2016
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

"use strict";

import core from 'coreApi';
import { dataProvider } from './testData';
import localizationMap from 'localizationMap';
import 'jasmine-jquery';

let $ = core.lib.$; // jshint ignore:line

let at = function (collection, index) {
    return collection.at ? collection.at(index) : collection[index];
};

export function expectCollectionsToBeEqual (actualCollection, expectedCollection) {
    expect(actualCollection.length).toBe(expectedCollection.length);
    for (var i = 0, len = actualCollection.length; i < len; i++) {
        var actualValue = at(actualCollection, i);
        var expectedValue = at(expectedCollection, i);
        if (actualValue !== expectedValue) {
            // Logging additional debug information
            console.log('i =', i);
            if (actualValue && actualValue.toJSON) {
                console.log('actual:', actualValue.toJSON());
            }
            if (expectedValue && expectedValue.toJSON) {
                console.log('expected:', expectedValue.toJSON());
            }
        }
        expect(actualValue === expectedValue).toBe(true, 'The elements of collections at index ' + i + ' are equal.');
    }
}

export function expectToHaveSameMembers (actual, expected) {
    let actualValues = _.sortBy(_.uniq(actual), v => v);
    let expectedValues = _.sortBy(_.uniq(expected), v => v);
    expectCollectionsToBeEqual(actualValues, expectedValues);
}

export function initializeCore () {
    setFixtures('<div id="rootRegion"></div>');
    let regionManager = new Marionette.RegionManager();
    regionManager.addRegions({
        rootRegion: '#rootRegion'
    });

    let rootRegion = regionManager.get('rootRegion');

    core.initialize({
        ajaxService: {
            ajaxMap: []
        },
        localizationService: {
            langCode: 'en',
            localizationMap: localizationMap,
            warningAsError: true
        },
        userService: {
            dataProvider: dataProvider
        }
    });

    return rootRegion;
}
