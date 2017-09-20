/**
 * Developer: Stepan Burguchev
 * Date: 6/27/2016
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

import core from 'coreApi';
import { dataProvider } from './testData';
import localizationMap from 'localizationMap';
import 'jasmine-jquery';

const $ = core.lib.$; // jshint ignore:line

const at = function(collection, index) {
    return collection.at ? collection.at(index) : collection[index];
};

export function expectCollectionsToBeEqual(actualCollection, expectedCollection) {
    expect(actualCollection.length).toBe(expectedCollection.length);
    for (let i = 0, len = actualCollection.length; i < len; i++) {
        const actualValue = at(actualCollection, i);
        const expectedValue = at(expectedCollection, i);
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
        expect(actualValue === expectedValue).toBe(true, `The elements of collections at index ${i} are equal.`);
    }
}

export function expectToHaveSameMembers(actual, expected) {
    const actualValues = _.sortBy(_.uniq(actual), v => v);
    const expectedValues = _.sortBy(_.uniq(expected), v => v);
    expectCollectionsToBeEqual(actualValues, expectedValues);
}

export function initializeCore() {
    setFixtures('<div id="rootRegion"></div>');
    const regionManager = new Marionette.RegionManager();
    regionManager.addRegions({
        rootRegion: '#rootRegion'
    });

    const rootRegion = regionManager.get('rootRegion');

    core.initialize({
        ajaxService: {
            ajaxMap: []
        },
        localizationService: {
            langCode: 'en',
            localizationMap,
            warningAsError: true
        },
        userService: {
            dataProvider
        }
    });

    return rootRegion;
}
