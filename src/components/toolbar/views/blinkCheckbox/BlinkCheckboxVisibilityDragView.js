import template from '../../templates/blinkCheckbox/blinkCheckboxVisibilityDrag.html';

const constants = {
    iconClassConst: 'filter',
    colorIconEnabled: 'filter-enabled',
    colorIconDisabled: 'filter-disabled'
};

export default Marionette.View.extend({
    template: Handlebars.compile(template),

    templateContext() {
        return {
            iconClass: constants.iconClassConst,
            iconColor: this.isHidden ? constants.colorIconDisabled : constants.colorIconEnabled
        };
    },

    className: 'filter-icon-lists__dragging js-filters-list-dragging'
});
