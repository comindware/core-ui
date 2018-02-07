
import template from '../templates/context.html';
import ContextSelectEditorView from '../../../ContextSelectEditorView';

export default Marionette.View.extend({
    template: Handlebars.compile(template),

    regions: {
        contextRegion: '.js-context-selector'
    },

    getValue() {
        return this.contextSelectEditorView.getValue();
    },

    setValue(value) {
        this.contextSelectEditorView.setValue(value);
    },

    onRender() {
        this.contextSelectEditorView = new ContextSelectEditorView(Object.assign(this.options));
        this.contextSelectEditorView.on('change', this.trigger.bind(this, 'change'));

        this.showChildView('contextRegion', this.contextSelectEditorView);
    }
});
