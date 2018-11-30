import template from '../../templates/infoButton.html';
import getIconPrefixer from '../../../utils/handlebars/getIconPrefixer';

export default Marionette.View.extend({
    template: Handlebars.compile(template),

    className() {
        return `${getIconPrefixer('question-circle')('question-circle')}`;
    }
});
