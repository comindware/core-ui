//@flow
import template from '../templates/customContextPaletteEmpty.html';

export default Marionette.View.extend({
    template: Handlebars.compile(template),

    templateContext: {
        text: Localizer.get('PROCESS.RECORDTYPES.FORM.CONTEXT.NOATTRIBUTES')
    },

    className: 'fb-filters-empty'
});
