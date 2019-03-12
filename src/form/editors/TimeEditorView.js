// @flow
import DateTimeEditorView from './DateTimeEditorView';
import formRepository from '../formRepository';

export default (formRepository.editors.Time = DateTimeEditorView.extend({
    initialize() {
        this.options.showDate = false;

        DateTimeEditorView.prototype.initialize.apply(this, arguments);
    }
}));
