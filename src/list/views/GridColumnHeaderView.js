//@flow
import { objectPropertyTypes } from '../../Meta';
import template from '../templates/gridcolumnheader.hbs';

/**
 * @name GridColumnHeaderView
 * @memberof module:core.list.views
 * @class GridColumnHeaderView
 * @constructor
 * @description View используемый по умолчанию для отображения ячейки заголовка (шапки) списка, передавать в
 * {@link module:core.list.views.GridView GridView options.gridColumnHeaderView}
 * @extends Marionette.View
 * @param {Object} options Constructor options
 * @param {Array} options.columns массив колонок
 * */

export default Marionette.View.extend({
    initialize(options) {
        const type = options.column.type;
        this.column = options.column;
        this.alignRight = _.contains([objectPropertyTypes.INTEGER, objectPropertyTypes.DOUBLE, objectPropertyTypes.DECIMAL], type);
        if (this.alignRight) {
            this.$el.addClass('grid-header-right');
        }
    },

    template: Handlebars.compile(template),

    className: 'grid-header-column-content',

    events: {
        click: '__handleSorting'
    },

    __handleSorting(e) {
        if (e.target.className.includes('js-collapsible-button')) {
            return;
        }
        this.trigger('columnSort', this, {
            column: this.column
        });
    },

    templateContext() {
        return {
            sortingAsc: this.column.sorting === 'asc',
            sortingDesc: this.column.sorting === 'desc',
            displayText: this.options.title,
            alignRight: this.alignRight
        };
    }
});
