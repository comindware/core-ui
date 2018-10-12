//@flow
import { objectPropertyTypes } from '../../../Meta';
import template from '../../templates/gridcolumnheader.hbs';
import InfoButtonView from './InfoButtonView';
import InfoMessageView from './InfoMessageView';

export default Marionette.View.extend({
    initialize(options) {
        this.column = options.column;
    },

    attributes() {
        return {
            title: this.options.title
        };
    },

    template: Handlebars.compile(template),

    className() {
        const type = this.options.column.type;
        this.alignRight = [objectPropertyTypes.INTEGER, objectPropertyTypes.DOUBLE, objectPropertyTypes.DECIMAL].includes(type);
        return `grid-header-column-content ${this.alignRight ? 'grid-header-right' : ''}`;
    },

    events: {
        mouseover: '__handleColumnSelect',
        click: '__handleSorting',
        'click .js-help-text-region': '__handleHelpMenuClick'
    },

    regions: {
        helpTextRegion: '.js-help-text-region'
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
        const helpText = this.column.helpText;

        if (helpText) {
            const infoPopout = Core.dropdown.factory.createPopout({
                buttonView: InfoButtonView,
                panelView: InfoMessageView,
                panelViewOptions: {
                    text: helpText
                },
                popoutFlow: 'right',
                customAnchor: true
            });

            this.showChildView('helpTextRegion', infoPopout);
        }
    },

    __handleHelpMenuClick() {
        return false;
    },

    __handleSorting(e) {
        if (this.options.columnSort === false) {
            return;
        }
        if (e.target.className.includes('js-collapsible-button')) {
            return;
        }
        this.trigger('columnSort', this, {
            column: this.column
        });
    },

    __handleColumnSelect(event) {
        this.trigger('handleColumnSelect', {
            view: this,
            event
        });
    }
});
