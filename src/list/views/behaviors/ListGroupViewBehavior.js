/*
    This behavior makes grouping items collapsible.
     To switch between the collapsed/expanded states there is a templateHelpers property 'collapsed' passed to the template model.
    
    Options:
        collapseButton - jquery selector string that points to the collapse/expand button.
         If omitted, whole view is considered the button and toggle the collapse state on click.
*/

const ListGroupViewBehavior = Marionette.Behavior.extend({
    initialize(options, view) {
        // mixing behavior's templateHelpers even if it's already defined in the view
        if (view.templateHelpers) {
            const viewTemplateHelpers = view.templateHelpers.bind(view);
            view.templateHelpers = () => _.extend(self.templateHelpers(), viewTemplateHelpers());
        }
    },

    events: {
        click: '__handleCollapseExpand'
    },

    __handleCollapseExpand(e) {
        const collapseButton = this.getOption('collapseButton');
        let collapseButtonEl;
        if (!collapseButton || ((collapseButtonEl = this.$el.find(collapseButton)[0]) !== undefined && e.target === collapseButtonEl)) {
            this.view.model.toggleCollapsed();
        }
    },

    templateHelpers() {
        return {
            collapsed: this.view.model.collapsed === true
        };
    }
});

export default ListGroupViewBehavior;
