import template from '../../templates/blinkCheckbox/blinkCheckboxVisibilityDrag.html';

const constants = {
    iconClassConst: 'filter',
    colorIconOpened: 'filter-opened',
    colorIconClosed: 'filter-closed'
};

export default Marionette.View.extend({
    template: Handlebars.compile(template),

    templateContext() {
        return {
            iconClass: constants.iconClassConst,
            iconColor: this.isHidden ? constants.colorIconClosed : constants.colorIconOpened
        };
    },

    className: 'filter-icon-lists__dragging js-filters-list-dragging'
});
