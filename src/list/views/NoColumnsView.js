/**
 * Developer: Grigory Kuznetsov
 * Date: 27.07.2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

'use strict';

import { Handlebars } from 'lib';
import template from '../templates/noColumns.hbs';

/**
 * Some description for initializer
 * @name NoColumnsView
 * @memberof module:core.list.views
 * @class NoColumnsView
 * @extends Marionette.ItemView
 * @constructor
 * @description View используемый по умолчанию для отображения списка без колонок
 * */
export default Marionette.ItemView.extend({
    className: 'dev-no-columns-view',
    template: Handlebars.compile(template)
});
