//@flow
import ButtonView from './ButtonView';

export default ButtonView.extend({
    templateContext() {
        return {
            isGroup: true
        };
    }
});
