import DatalistEditorView from './DatalistEditorView';
import userBubble from './templates/userBubble.hbs';
import formRepository from '../formRepository';

export default (formRepository.editors.User = DatalistEditorView.extend({
    initialize(options = {}) {
        _.defaults(
            options,
            {
                listTitle: Localizer.get('CORE.FORM.EDITORS.MEMBERSELECT.ALLUSERS'),
                title: Localizer.get('CORE.FORM.EDITORS.MEMBERSELECT.SELECTEDUSERS'),
                panelClass: 'simplified-panel_container',
                buttonBubbleTemplate: userBubble,
                panelBubbleTemplate: userBubble
            }
        );

        DatalistEditorView.prototype.initialize.apply(this, arguments);
    }
}));
