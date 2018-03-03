/* global define, require, Handlebars, Backbone, Marionette, $, _ */

/*
 * This class is fully compatible with Backbone.Form.editors.Base and should be used to create Marionette-based editors for Backbone.Form
 * */

import 'lib';
import MarionetteEditorPrototype from './MarionetteEditorPrototype';

export default Marionette.CollectionView.extend(MarionetteEditorPrototype.create(Marionette.CollectionView));
