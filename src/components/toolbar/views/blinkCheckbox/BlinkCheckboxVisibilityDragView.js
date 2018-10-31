import template from '../../templates/blinkCheckbox/blinkCheckboxVisibilityDrag.html';

const constants = {
    eyesListOpen: 'eyes-list-eye_open',
    eyesListClose: 'eyes-list-eye_close'
};

export default Marionette.View.extend({
    template: Handlebars.compile(template),

    templateContext: {
        visibilityClass() {
            return this.isHidden ? constants.eyesListClose : constants.eyesListOpen;
        }
    },

    className: 'eyes-lists__dragging js-filters-list-dragging'
});
