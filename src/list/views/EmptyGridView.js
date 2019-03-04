//@flow
import template from '../templates/emptyGrid.hbs';

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
    templateContext() {
        return {
            text: _.result(this.options, 'text', Localizer.get('CORE.GRID.EMPTYVIEW.EMPTY')),
            colspan: this.options.colspan
        };
    },

    tagName: 'tr',

    template: Handlebars.compile(template),

    className: 'empty-view'
});
