/**
 * Developer: Stepan Burguchev
 * Date: 1/26/2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

"use strict";

import infoTemplate from '../templates/InfoButton_Normal.hbs';
import errorTemplate from '../templates/InfoButton_Error.hbs';
import '../../../libApi';
import dropdown from '../../../dropdown/dropdownApi';

export default Marionette.ItemView.extend({
	behaviors: {
		CustomAnchorBehavior: {
			behaviorClass: dropdown.views.behaviors.CustomAnchorBehavior,
			anchor: '.js-anchor'
		}
	},

	getTemplate: function() {
		if (this.model.get('error')) {
			return errorTemplate;
		}
		return infoTemplate;
	}
});
