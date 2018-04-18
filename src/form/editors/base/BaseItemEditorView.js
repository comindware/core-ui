// @flow

/*
* This class is fully compatible with Backbone.Form.editors.Base and should be used to create Marionette-based editors for Backbone.Form
* */

import MarionetteEditorPrototype from './MarionetteEditorPrototype';

export default Marionette.View.extend(MarionetteEditorPrototype.create(Marionette.View));
