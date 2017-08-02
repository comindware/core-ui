/**
 * Developer: Stepan Burguchev
 * Date: 11/27/2014
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

'use strict';

import { Handlebars } from 'lib';
import template from '../templates/defaultButton.hbs';

/**
 * @name DefaultButtonView
 * @memberof module:core.dropdown.views
 * @class Trivial implementation of a button View that displays plain text without any styles.
 * The <code>text</code> attribute of the passed model is displayed.
 * Factory method {@link module:core.dropdown.factory createMenu} uses this view to display menu button.
 * @constructor
 * @extends Marionette.ItemView
 * @param {Object} options Options object.
 * @param {Backbone.Model} options.model Data model. Must contain <code>text</code> attribute.
 * */

export default Marionette.ItemView.extend({
    initialize(options) {
    },

    tagName: 'span',

    template: Handlebars.compile(template),

    modelEvents: {
        change: 'render'
    }
});
