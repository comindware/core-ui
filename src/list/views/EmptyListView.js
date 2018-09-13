//@flow
import template from '../templates/emptyGrid.hbs';
import LocalizationService from '../../services/LocalizationService';

/**
 * Some description for initializer
 * @name EmptyListView
 * @memberof module:core.list.views
 * @class EmptyListView
 * @constructor
 * @description View используемый по умолчанию для отображения пустого списка (нет строк),
 * передавать в {@link module:core.list.views.GridView GridView options.emptyView}
 * @extends Marionette.View
 * @param {Object} options Constructor options
 * @param {string} [options.text=Список пуст] отображаемый текст
 * */
export default Marionette.View.extend({
    initialize(options) {
        this.model = new Backbone.Model({
            text: (options && options.text) || LocalizationService.get('CORE.GRID.EMPTYVIEW.EMPTY')
        });
    },

    template: Handlebars.compile(template),

    className: 'empty-view'
});
