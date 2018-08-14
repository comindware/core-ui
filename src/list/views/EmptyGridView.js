//@flow
import template from '../templates/emptyGrid.hbs';
import LocalizationService from '../../services/LocalizationService';

/**
 * Some description for initializer
 * @name EmptyGridView
 * @memberof module:core.list.views
 * @class EmptyGridView
 * @constructor
 * @description View для отображения списка без колонок
 * @extends Marionette.View
 * @param {Object} options Constructor options
 * @param {string} [options.text=Список пуст] отображаемый текст
 * */

export default Marionette.View.extend({
    initialize(options) {
        this.model = new Backbone.Model({
            text: options.text || LocalizationService.get('CORE.GRID.EMPTYVIEW.EMPTY')
        });
    },

    template: Handlebars.compile(template),

    className: 'empty-view'
});
