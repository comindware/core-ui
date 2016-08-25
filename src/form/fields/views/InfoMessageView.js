/**
 * Developer: Stepan Burguchev
 * Date: 1/26/2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

"use strict";

import '../../../libApi';

export default Marionette.ItemView.extend({
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
