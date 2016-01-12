define([
    'comindware/core'
], function() {
    'use strict';

    return Marionette.AppRouter.extend({
        appRoutes: {
            '': 'index',
            'demo/core/:sectionId/:groupId/:caseId': 'showCase'
        }
    });
});