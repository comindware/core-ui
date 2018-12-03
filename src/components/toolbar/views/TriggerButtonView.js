import ButtonView from './ButtonView';

export default ButtonView.extend({
    triggers: {
        click: {
            event: 'click',
            preventDefault: false,
            stopPropagation: false
        },
        keyup: {
            event: 'keyup',
            preventDefault: false,
            stopPropagation: false
        }
    }
});
