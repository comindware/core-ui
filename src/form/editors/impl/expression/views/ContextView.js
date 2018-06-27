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
        //if (value.type == 'context')
        //    this.contextSelectEditorView.setValue(value.value);
        this.contextSelectEditorView.setValue(value);
    },

    onAttach() {
        this.contextSelectEditorView = new ContextSelectEditorView(Object.assign(this.options));
        this.contextSelectEditorView.on('change', this.trigger.bind(this, 'change'));

        //var self = this;
        //this.contextSelectEditorView.__applyContext = function(selected) {
        //    this.popoutView.close();
        //    this.__value(selected, false);
        //    self.trigger("change");
        //}.bind(this.contextSelectEditorView);

        this.showChildView('contextRegion', this.contextSelectEditorView);
    }
});
