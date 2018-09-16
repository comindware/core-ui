//@flow
import { objectPropertyTypes } from '../../../Meta';
import template from '../../templates/gridcolumnheader.hbs';
import InfoButtonView from './InfoButtonView';
import InfoMessageView from './InfoMessageView';

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
        this.column = options.column;
    },

    template: Handlebars.compile(template),

    className() {
        const type = this.options.column.type;
        this.alignRight = [objectPropertyTypes.INTEGER, objectPropertyTypes.DOUBLE, objectPropertyTypes.DECIMAL].includes(type);
        return `grid-header-column-content ${this.alignRight ? 'grid-header-right' : ''}`;
    },
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
    },

    onRender() {
        const helpText = this.getOption('column').helpText;

        if (helpText) {
            this.addRegion('viewRegion', { el: this.ui.helpTextRegion[0] });

            const infoPopout = Core.dropdown.factory.createPopout({
                buttonView: InfoButtonView,
                panelView: InfoMessageView,
                panelViewOptions: {
                    text: helpText
                },
                popoutFlow: 'right',
                customAnchor: true
            });
            this.getRegion('viewRegion').show(infoPopout);
        }
    }
});
