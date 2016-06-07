define([
    'comindware/core'
], function() {
    'use strict';

    return Marionette.AppRouter.extend({
        appRoutes: {
            '': 'index',
            'demo/:sectionId/:groupId/:caseId': 'showCase'
        }
    });
});