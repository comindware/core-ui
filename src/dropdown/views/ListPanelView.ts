import Marionette from 'backbone.marionette';

// @flow
/**
 * @name ListPanelView
 * @memberof module:core.dropdown.views
 * @class Primitive view that can be used as a <code>panelView</code> to display a list of elements.
 * @constructor
 * @extends Marionette.CollectionView
 * @param {Object} options Options object.
 * */

export default Marionette.CollectionView.extend({
    tagName: 'ul'
});
