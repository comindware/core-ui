//@flow
import GridView from '../views/GridView';
import meta from '../meta';
import VirtualCollection from '../../collections/VirtualCollection';
import factory from '../factory';

/*
 * @param {Array} options.excludeActions Array of strings. Example: <code>[ 'archive', 'delete' ]</code>.
 * @param {Array} options.additionalActions Array of objects <code>[ id,  name,
 * type=button'|'checkbox', isChecked, iconClass, severity]</code>.
 * @param {Boolean} options.showCheckbox show or hide checkbox
 */

const defaultOptions = {
    isSliding: true,
    showHeader: true,
    handleSearch: true,
    updateToolbarEvents: ''
};

export default Marionette.Object.extend({
    initialize(options = {}) {
        this.options = Object.assign({}, defaultOptions, options);
        this.__createView(this.options);
    },

    setLoading(state) {
        this.view.setLoading(state);
    },

    validate() {
        return this.view.validate();
    },

    getChildren() {
        return this.view.getChildren();
    },

    __createView(options) {
        const allToolbarActions = new VirtualCollection(new Backbone.Collection(this.__getToolbarActions()));
        const comparator = factory.getDefaultComparator(options.columns);
        const collection = factory.createWrappedCollection(Object.assign({}, options, { comparator }));

        const debounceUpdateAction = _.debounce(() => this.__updateActions(allToolbarActions, collection), 10);
        this.__updateActions(allToolbarActions, collection);
        if (this.options.showToolbar) {
            if (this.options.showCheckbox) {
                this.listenTo(collection, 'check:all check:some check:none', debounceUpdateAction);
            } else {
                this.listenTo(collection, 'select:all select:some select:none deselect:one select:one', debounceUpdateAction);
            }
            if (this.options.updateToolbarEvents) {
                this.listenTo(collection.parentCollection, this.options.updateToolbarEvents, debounceUpdateAction);
            }
        }

        this.view = new GridView(
            Object.assign(this.options, {
                actions: allToolbarActions,
                collection,
                columns: options.columns
            })
        );

        this.listenTo(this.view, 'search', text => this.__onSearch(text, options.columns, collection));
        this.listenTo(this.view, 'execute:action', (model, ...rest) => this.__executeAction(model, collection, ...rest));
        this.listenTo(this.view, 'childview:click', this.__onItemClick);
        this.listenTo(this.view, 'childview:dblclick', this.__onItemDblClick);
        this.listenTo(this.view, 'drag:drop', this.__onItemMoved);
    },

    __onSearch(text, columns, collection) {
        if (!this.getOption('handleSearch')) {
            this.trigger('search', text);
            return;
        }
        if (text) {
            this.__applyFilter(new RegExp(text, 'i'), columns, collection);
            this.__highlightCollection(text, collection);
        } else {
            this.__clearFilter(collection);
            this.__unhighlightCollection(collection);
        }
    },

    __applyFilter(regexp, columns, collection) {
        collection.filter(model => {
            let result = false;
            const searchableColumns = columns.filter(column => column.searchable !== false).map(column => column.id || column.key);
            searchableColumns.forEach(column => {
                const values = model.get(column);
                const testValueFunction = value => {
                    if (value) {
                        const testValue = value.name || value.text || value.toString();
                        return regexp.test(testValue);
                    }
                };
                if (Array.isArray(values) && values.length) {
                    values.forEach(value => {
                        result = result || testValueFunction(value);
                    });
                } else {
                    result = result || testValueFunction(values);
                }
            });

            return result;
        });
    },

    __clearFilter(collection) {
        collection.filter();
    },

    __highlightCollection(text, collection) {
        collection.each(model => {
            model.highlight(text);
        });
    },

    __unhighlightCollection(collection) {
        collection.each(model => {
            model.unhighlight();
        });
    },

    __getToolbarActions() {
        let toolbarActions = [];
        const defaultActions = meta.getDefaultActions();
        if (!this.options.excludeActions) {
            toolbarActions = defaultActions;
        } else if (this.options.excludeActions !== 'all') {
            toolbarActions = defaultActions.filter(action => this.options.excludeActions.indexOf(action.id) === -1);
        }
        if (this.options.additionalActions) {
            toolbarActions = toolbarActions.concat(this.options.additionalActions);
        }
        return toolbarActions;
    },

    __updateActions(allToolbarActions, collection) {
        const selected = this.__getSelectedItems(collection);
        const selectedLength = selected.length;

        allToolbarActions.filter(action => {
            let isActionApplicable;
            switch (action.get('contextType')) {
                case 'one':
                    isActionApplicable = selectedLength === 1;
                    break;
                case 'any':
                    isActionApplicable = selectedLength;
                    break;
                case 'void':
                default:
                    isActionApplicable = true;
            }
            const condition = action.get('condition');
            if (isActionApplicable && condition && typeof condition === 'function') {
                isActionApplicable = condition(selected);
            }
            return isActionApplicable;
        });
    },

    __getSelectedItems(collection) {
        const selected = (this.options.showCheckbox ? collection.checked : collection.selected) || {};
        if (selected instanceof Backbone.Model) {
            return [selected];
        }
        return Object.values(selected);
    },

    __executeAction(model, collection, ...rest) {
        const selected = this.__getSelectedItems(collection);
        switch (model.get('id')) {
            case 'delete':
                this.__confirmUserAction(
                    Localizer.get('CORE.GRID.ACTIONS.DELETE.CONFIRM.TEXT'),
                    Localizer.get('CORE.GRID.ACTIONS.DELETE.CONFIRM.TITLE'),
                    Localizer.get('CORE.GRID.ACTIONS.DELETE.CONFIRM.YESBUTTONTEXT'),
                    Localizer.get('CORE.GRID.ACTIONS.DELETE.CONFIRM.NOBUTTONTEXT')
                ).then(result => {
                    if (result) {
                        this.__triggerAction(model, selected, ...rest);
                    }
                });
                break;
            case 'archive':
                this.__confirmUserAction(
                    Localizer.get('CORE.GRID.ACTIONS.ARCHIVE.CONFIRM.TEXT'),
                    Localizer.get('CORE.GRID.ACTIONS.ARCHIVE.CONFIRM.TITLE'),
                    Localizer.get('CORE.GRID.ACTIONS.ARCHIVE.CONFIRM.YESBUTTONTEXT'),
                    Localizer.get('CORE.GRID.ACTIONS.ARCHIVE.CONFIRM.NOBUTTONTEXT')
                ).then(result => {
                    if (result) {
                        this.__triggerAction(model, selected, ...rest);
                    }
                });
                break;
            case 'unarchive':
                this.__confirmUserAction(
                    Localizer.get('CORE.GRID.ACTIONS.UNARCHIVE.CONFIRM.TEXT'),
                    Localizer.get('CORE.GRID.ACTIONS.UNARCHIVE.CONFIRM.TITLE'),
                    Localizer.get('CORE.GRID.ACTIONS.UNARCHIVE.CONFIRM.YESBUTTONTEXT'),
                    Localizer.get('CORE.GRID.ACTIONS.UNARCHIVE.CONFIRM.NOBUTTONTEXT')
                ).then(result => {
                    if (result) {
                        this.__triggerAction(model, selected, ...rest);
                    }
                });
                break;
            case 'add':
            default:
                this.__triggerAction(model, selected, ...rest);
                break;
        }
    },

    __confirmUserAction(text, title, yesButtonText, noButtonText) {
        return Core.services.MessageService.showMessageDialog(text || '', title || '', [{ id: false, text: noButtonText || 'No' }, { id: true, text: yesButtonText || 'Yes' }]);
    },

    __triggerAction(model, selected, ...rest) {
        this.trigger('execute', model, selected, ...rest);
    },

    __onItemClick(model) {
        this.trigger('click', model);
    },

    __onItemDblClick(model) {
        this.trigger('dblclick', model);
    },

    __onItemMoved(...args) {
        this.trigger('move', ...args);
    }
});
