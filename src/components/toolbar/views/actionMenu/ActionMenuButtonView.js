//@flow
import TriggerButtonView from '../TriggerButtonView';

export default TriggerButtonView.extend({
    initialize() {
        this.listenTo(this.model, 'change:iconClass', this.render);
    },

    templateContext() {
        return Object.assign(
            TriggerButtonView.prototype.templateContext.apply(this, arguments),
            {
                isGroup: true,
                customAnchor: this.options.customAnchor
            }
        );
    }
});
