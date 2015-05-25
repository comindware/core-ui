/* global define, Backbone */

define(['module/lib'], function() {
    "use strict";

	return Backbone.Model.extend({
		defaults:
		{
			text: '',
			error: false
		}
	});
});
