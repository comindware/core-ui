//@flow
import ButtonView from './ButtonView';

export default ButtonView.extend({
    triggers: {
        click: 'click:item'
    },

    onRender() {
        if (this.model.get('type') === 'Splitter') {
            this.$el.css({ height: '1px', pointerEvents: 'none' });
        }
    }
});
