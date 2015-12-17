/* global define, Marionette, Handlebars */

define([
    'text!../templates/InfoButton_Normal.html',
    'text!../templates/InfoButton_Error.html',
    'core/dropdown/dropdownApi'], function (infoTemplate, errorTemplate, dropdown) {
    "use strict";

	return Marionette.ItemView.extend({
		behaviors: {
			CustomAnchorBehavior: {
				behaviorClass: dropdown.views.behaviors.CustomAnchorBehavior,
				anchor: '.js-anchor'
			}
		},
		getTemplate: function() {
			if (this.model.get('error')) {
				return Handlebars.compile(errorTemplate);
			}
			return Handlebars.compile(infoTemplate);
		}
	});
});
