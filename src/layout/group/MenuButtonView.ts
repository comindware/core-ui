import Marionette from 'backbone.marionette';
import _ from 'underscore';

export default Marionette.View.extend({
    className: 'fas fa-ellipsis-v',

    tagName: 'i',

    template: _.noop
});
