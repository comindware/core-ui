/**
 * Developer: Stepan Burguchev
 * Date: 2/27/2017
 * Copyright: 2009-2017 Stepan Burguchev®
 *       All Rights Reserved
 * Published under the MIT license
 */

import core from 'comindware/core';

export default function() {
    return new core.components.BreadCrumbs({
        collection: [
            {
                title: 'First step',
                subtitle: 'First step',
                id: 'First',
                url: 'url'
            },
            {
                title: 'Second step',
                subtitle: 'Second step',
                id: 'Second',
                url: 'url',
                collection: new Backbone.Collection([
                    { 1: 1,
                        2: 2 }
                ])
            },
            {
                title: 'Third step',
                subtitle: 'Third step',
                id: 'Third',
                url: 'url'
            },
            {
                title: 'Fourth step',
                subtitle: 'Fourth step',
                id: 'Fourth',
                url: 'url'
            }
        ]
    });
}
