import ButtonView from './ButtonView';

export default ButtonView.extend({
    attributes() {
        return {
            title: this.model.get('description') || ''
        }
    },
});
