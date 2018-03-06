/*
 * This class is fully compatible with Backbone.Form.editors.Base and should be used to create Marionette-based editors for Backbone.Form
 * */

import MarionetteEditorPrototype from './MarionetteEditorPrototype';

export default Marionette.CompositeView.extend(MarionetteEditorPrototype.create(Marionette.CompositeView));
