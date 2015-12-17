/* global define, Backbone */

define(['core/libApi'], function() {
    "use strict";

	return Backbone.Model.extend({
		defaults:
		{
			text: '',
			error: false
		}
	});
});
