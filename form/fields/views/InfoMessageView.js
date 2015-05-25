/* global Marionette, define */

define(['module/lib'], function() {
    "use strict";

	return Marionette.ItemView.extend({
		modelEvents: {
			'change:text': 'onChangeText'
		},
        className: 'fr-dropdown-message',
		template: false,       
		onRender: function() {
			this.$el.text(this.model.get('text'));
		},
		onChangeText: function() {
			this.$el.text(this.model.get('text'));
		}
	});
});
