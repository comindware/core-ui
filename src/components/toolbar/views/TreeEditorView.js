import TreeEditor from '../../treeEditor';

export default options => {
    const { model } = options;
    const view = new TreeEditor(model.get('treeEditorOptions')).getView();

    view.on('save reset', () => {
        model.set('columns', view.getRootCollection());
        view.trigger('action:click', model);
    });

    return view;
};
