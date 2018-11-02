//@flow
import ButtonView from '../ButtonView';

export default ButtonView.extend({
    initialize() {
        this.listenTo(this.model, 'change:iconClass', this.render);
    },

    templateContext() {
        return {
            isGroup: true
        };
    }
});
