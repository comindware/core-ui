/**
 * Developer: Stepan Burguchev
 * Date: 5/21/2015
 * Copyright: 2009-2015 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* global define, require, Handlebars, Backbone, Marionette, $, _ */

define([
        './utils/utilsApi',
        './utils/dropdownApi',
        './collections/SlidingWindowCollection',
        './collections/VirtualCollection',
        './collections/behaviors/HighlightableBehavior',
        'core/models/behaviors/CollapsibleBehavior',
        'core/models/behaviors/HighlightableBehavior',
        'core/models/behaviors/SelectableBehavior'
    ],
    function (
        utilsApi,
        dropdownApi,
        SlidingWindowCollection,
        VirtualCollection,
        CollectionHighlightableBehavior,
        CollapsibleBehavior,
        HighlightableBehavior,
        SelectableBehavior
    ) {
        'use strict';

        //noinspection UnnecessaryLocalVariableJS
        /**
         * Core UI components: the ground components to build Comindware web application.
         * @exports core
         * */
        return {
            collections: {
                behaviors: {
                    HighlightableBehavior: CollectionHighlightableBehavior
                },
                SlidingWindowCollection: SlidingWindowCollection,
                VirtualCollection: VirtualCollection
            },
            models: {
                behaviors: {
                    CollapsibleBehavior: CollapsibleBehavior,
                    HighlightableBehavior: HighlightableBehavior,
                    SelectableBehavior: SelectableBehavior
                }
            },
            dropdown: dropdownApi,
            utils: utilsApi
        };
    });
