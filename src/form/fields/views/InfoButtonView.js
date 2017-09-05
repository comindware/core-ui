/**
 * Developer: Stepan Burguchev
 * Date: 1/26/2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

import { Handlebars } from 'lib';
import dropdown from 'dropdown';
import template from '../templates/infoButton.hbs';

export default Marionette.ItemView.extend({
    template: Handlebars.compile(template),

    className: 'form-label__info-button',

    behaviors: {
        CustomAnchorBehavior: {
            behaviorClass: dropdown.views.behaviors.CustomAnchorBehavior,
            anchor: '.js-anchor',
            omitDefaultStyling: true
        }
    }
});
