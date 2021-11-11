import template from './templates/infoButton.hbs';

export default Marionette.View.extend({
    template: Handlebars.compile(template),

    className() {
        return `form-label__info-button ${Handlebars.helpers.iconPrefixer('question-circle')}`;
    },

    tagName: 'i'
});
