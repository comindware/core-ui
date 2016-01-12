define(
	function() {
		'use strict';
		
		return Marionette.AppRouter.extend({
			appRoutes: {
				'': 'index',
				'demo/core/:sectionId/:groupId/:caseId': 'showCase'
			}
		});
	}
);