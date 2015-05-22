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
        './collections/SlidingWindowCollection',
        './collections/VirtualCollection',
        './collections/behaviors/HighlightableBehavior'
    ],
    function (
        utilsApi,
        SlidingWindowCollection,
        VirtualCollection,
        HighlightableBehavior
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
                    HighlightableBehavior: HighlightableBehavior
                },
                SlidingWindowCollection: SlidingWindowCollection,
                VirtualCollection: VirtualCollection
            },
            utils: utilsApi
        };
    });
