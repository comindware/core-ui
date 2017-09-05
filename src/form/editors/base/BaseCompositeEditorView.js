/**
 * Developer: Stepan Burguchev
 * Date: 12/2/2014
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

/* global define, require, Handlebars, Backbone, Marionette, $, _ */

/*
 * This class is fully compatible with Backbone.Form.editors.Base and should be used to create Marionette-based editors for Backbone.Form
 * */

'use strict';

import 'lib';
import MarionetteEditorPrototype from './MarionetteEditorPrototype';

export default Marionette.CompositeView.extend(MarionetteEditorPrototype.create(Marionette.CompositeView));
