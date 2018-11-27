//@flow
import TriggerButtonView from '../TriggerButtonView';

export default TriggerButtonView.extend({
    initialize() {
        this.listenTo(this.model, 'change:iconClass', this.render);
    },

    templateContext() {
        return {
            isGroup: true
        };
    }
});
