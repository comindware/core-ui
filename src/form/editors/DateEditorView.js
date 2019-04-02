// @flow
import DateTimeEditorView from './DateTimeEditorView';
import formRepository from '../formRepository';

export default (formRepository.editors.Date = DateTimeEditorView.extend({
    initialize(options) {
        options.showTime = false;

        DateTimeEditorView.prototype.initialize.apply(this, arguments);
    }
}));
