/**
 * Developer: Stepan Burguchev
 * Date: 7/17/2014
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

'use strict';

import { Handlebars } from 'lib';
import template from '../templates/emptyGrid.hbs';
import LocalizationService from '../../services/LocalizationService';

/**
 * Some description for initializer
 * @name EmptyGridView
 * @memberof module:core.list.views
 * @class EmptyGridView
 * @constructor
 * @description View для отображения списка без колонок
 * @extends Marionette.ItemView
 * @param {Object} options Constructor options
 * @param {string} [options.text=Список пуст] отображаемый текст
 * */

export default Marionette.ItemView.extend({
    initialize(options) {
        this.model = new Backbone.Model({
            text: options.text || LocalizationService.get('CORE.GRID.EMPTYVIEW.EMPTY')
        });
    },

    template: Handlebars.compile(template),
    className: 'empty-view'
});
