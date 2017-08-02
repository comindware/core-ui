/**
 * Developer: Grigory Kuznetsov
 * Date: 27.07.2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

'use strict';

import { Handlebars } from 'lib';
import template from '../templates/loadingRow.hbs';

/**
 * Some description for initializer
 * @name LoadingRowView
 * @memberof module:core.list.views
 * @class LoadingRowView
 * @extends Marionette.ItemView
 * @constructor
 * @description View показывает loader при подгрузке контента
 * */
export default Marionette.ItemView.extend({
    className: 'dev-loading-row',

    template: Handlebars.compile(template)
});
