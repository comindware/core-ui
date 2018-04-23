import template from '../templates/paletteToolbar.html';
import ToolbarActionsView from './ToolbarActionsView';

export default Marionette.View.extend({
    initialize(options) {
        if (options.config.toolbar) {
            this.actionsView = this.__createActionsView(options.config.toolbar.actions);
        }
        this.displayAttribute = options.config.displayPaletteAttribute || 'name';
    },

    template: Handlebars.compile(template),

    ui: {
        searchToggle: '.js-search-toggle'
    },

    events: {
        'click @ui.addComponents': '__addComponent'
    },

    regions: {
        searchRegion: '.js-search-region',
        actionsRegion: '.js-actions-region'
    },

    className: 'ld-list-toolbar',

    onRender() {
        this.showChildView('searchRegion', this.__createSearchView());
        if (this.getOption('config').toolbar) {
            this.showChildView('actionsRegion', this.actionsView);
            this.listenTo(this.actionsView, 'execute', actionId => this.trigger('execute', actionId));
        }
    },

    updateSearchModel(collection) {
        this.searchCollection = collection;
    },

    __createSearchView() {
        const searchBarView = new Core.views.SearchBarView();
        searchBarView.on('search', text => {
            this.__setCollapsed(this.searchCollection, true);
            this.__unhighlightCollection(this.searchCollection);
            this.isFiltered && this.__clearFilter(this.searchCollection);
            this.isFiltered = !!text;
            if (text) {
                this.__applyFilter(this.searchCollection, new RegExp(text, 'i'));
                this.__highlightCollection(this.searchCollection, text);
            }
        });
        return searchBarView;
    },

    __createActionsView(collection) {
        return new ToolbarActionsView({ collection });
    },

    __addComponent(event) {
        this.trigger('add:attribute', event);
    },

    __applyFilter(collection, regexp, parents = []) {
        collection.forEach(model => {
            parents.push(model);
            const children = model.get('children');
            const result = this.__hasChildren(model) && this.__applyFilter(children, regexp, parents);
            parents.pop();
            if (typeof model.setCollapsed === 'function' && model.needToExpand) {
                _.delay(() => {
                    model.setCollapsed(true);
                    model.toggleCollapsed();
                });
            }
            return result;
        });
        collection.filter(
            model => (this.__hasChildren(model) && model.get('children').length > 0) || this.__testValue(model, regexp) || parents.some(parent => this.__testValue(parent, regexp))
        );
        if (parents.length) {
            parents[parents.length - 1].needToExpand = collection.models.some(child => this.__testValue(child, regexp) || child.needToExpand);
        }
    },

    __testValue(model, regexp) {
        return regexp.test(model.get(this.displayAttribute)) || regexp.test(model.get('text'));
    },

    __highlightCollection(collection, text) {
        if (!(typeof collection.highlight === 'function')) {
            Core.utils.helpers.applyBehavior(collection, Core.collections.behaviors.HighlightableBehavior);
        }
        collection.highlight(text);
        collection.each(model => {
            if (this.__hasChildren(model)) {
                this.__highlightCollection(model.get('children'), text);
            }
        });
    },

    __unhighlightCollection(collection) {
        if (!(typeof collection.unhighlight === 'function')) {
            Core.utils.helpers.applyBehavior(collection, Core.collections.behaviors.HighlightableBehavior);
        }
        collection.unhighlight();
        collection.each(model => {
            if (this.__hasChildren(model)) {
                this.__unhighlightCollection(model.get('children'));
            }
        });
    },

    __clearFilter(collection) {
        collection.filter(null);
        collection.forEach(model => model.has('children') && this.__clearFilter(model.get('children')));
    },

    __setCollapsed(collection, value) {
        collection.forEach(model => {
            if (typeof model.setCollapsed === 'function') {
                model.setCollapsed(!value);
                model.toggleCollapsed();
            }
            this.__hasChildren(model) && this.__setCollapsed(model.get('children'), value);
        });
    },

    __hasChildren(model) {
        return model.get('children') && model.get('children').length > 0;
    }
});
