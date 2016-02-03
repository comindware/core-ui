/**
 * Developer: Stepan Burguchev
 * Date: 7/21/2014
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

"use strict";

import * as moment_ from 'moment';
import 'moment/locale/ru';
import 'moment/locale/en-gb';
import 'moment/locale/de';
import 'bluebird';
import * as Handlebars_ from 'handlebars';
import * as _ from 'underscore';
import * as underscoreString from 'underscore.string';
import * as Backbone from 'backbone';
import 'backbone-associations';
import 'backbone.forms';
import 'backbone.marionette';
import 'jquery';
import 'jquery.inputmask/dist/jquery.inputmask.bundle';
import 'jquery.caret';
import 'jquery-mousewheel';
import 'jquery-autosize';
import * as keypress_ from 'keypress';
import 'bootstrap-datetime-picker';

_.string = _.str = underscoreString;

Backbone.Associations = Backbone.Backbone.Associations;
Backbone.Associations.EVENTS_NC = true;

$.browser = {
    msie: (/msie|trident/i).test(navigator.userAgent)
};

var api = {
    keypress: keypress_,
    moment: moment_,
    Handlebars: Handlebars_
};
export var keypress = api.keypress;
export var moment = api.moment;
export var Handlebars = api.Handlebars;
export default api;
