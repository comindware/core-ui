import template from '../templates/gridcolumnheader.hbs';

/**
 * @name GridColumnHeaderView
 * @memberof module:core.list.views
 * @class GridColumnHeaderView
 * @constructor
 * @description View используемый по умолчанию для отображения ячейки заголовка (шапки) списка, передавать в
 * {@link module:core.list.views.GridView GridView options.gridColumnHeaderView}
 * @extends Marionette.ItemView
 * @param {Object} options Constructor options
 * @param {Array} options.columns массив колонок
 * */

export default Marionette.ItemView.extend({
    initialize(options) {
        this.column = options.column;
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

    templateHelpers() {
        return {
            sortingAsc: this.column.sorting === 'asc',
            sortingDesc: this.column.sorting === 'desc',
            displayText: this.options.title
        };
    }
});
