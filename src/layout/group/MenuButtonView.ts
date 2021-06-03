import Marionette from 'backbone.marionette';
import _ from 'underscore';

export default Marionette.View.extend({
    className() {
        return Handlebars.helpers.iconPrefixer('ellipsis-v');
    },

    tagName: 'i',

    template: _.noop
});
