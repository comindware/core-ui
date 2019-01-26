import template from '../templates/defaultButton.hbs';
import Marionette from 'backbone.marionette';

/**
 * @name DefaultButtonView
 * @memberof module:core.dropdown.views
 * @class Trivial implementation of a button View that displays plain text without any styles.
 * The <code>text</code> attribute of the passed model is displayed.
 * Factory method {@link module:core.dropdown.factory createMenu} uses this view to display menu button.
 * @constructor
 * @extends Marionette.View
 * @param {Object} options Options object.
 * @param {Backbone.Model} options.model Data model. Must contain <code>text</code> attribute.
 * */

export default Marionette.View.extend({
    tagName: 'span',

    template: Handlebars.compile(template),

    modelEvents: {
        change: 'render'
    }
});
