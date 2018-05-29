export default function(options) {
    _.defaults(options, {
        anotherEditor: 'alias'
    });
    if (!options.view) {
        console.error('SideEditorEffect "passToEmptyEditor" expect view in options');
        return;
    }
    if (options.view.form.getValue(options.anotherEditor)) {
        return;
    }
    this.model.set(options.anotherEditor, options.value || this.getValue());
}
