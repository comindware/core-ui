/**
 * Developer: Stepan Burguchev
 * Date: 12/1/2014
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

import 'lib';

const classes = {
    ANCHOR: 'anchor anchor_inline'
};

/**
 * Marionette.Behavior constructor shall never be called manually.
 * The options described here should be passed as behavior options (look into Marionette documentation for details).
 * @name CustomAnchorBehavior
 * @memberof module:core.dropdown.views.behaviors
 * @class The behavior must be applied to a button View if {@link module:core.dropdown.views.PopoutView PopoutView}
 * has option <code>customAnchor: true</code>. The button view should be passed into <code>buttonView</code> option of a PopoutView.
 * The behavior defines the place where the speech bubble triangle (we call it anchor) should be placed.
 * @constructor
 * @extends Marionette.Behavior
 * @param {Object} options Options object.
 * @param {String} [options.anchor] jQuery-selector pointing to the DOM-element that should be used as an anchor.
 *                                  If omitted, root view element ($el) is used.
 * @param {Marionette.View} view A view the behavior is applied to.
 * */

export default Marionette.Behavior.extend(/** @lends module:core.dropdown.views.behaviors.CustomAnchorBehavior.prototype */ {
    initialize(options, view) {
    },

    onRender() {
        let $el;
        if (this.options.anchor) {
            $el = this.$(this.options.anchor);
        } else {
            $el = this.$el;
        }
        if (!this.options.omitDefaultStyling) {
            $el.addClass(classes.ANCHOR);
        }
        this.view.$anchor = $el;
    }
});
