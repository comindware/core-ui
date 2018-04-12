//@flow
import utils from 'utils';
import GridView from '../views/GridView';
import meta from '../meta';
import CellViewFactory from '../CellViewFactory';
import VirtualCollection from '../../collections/VirtualCollection';
import factory from '../factory';

/*
 * @param {Array} options.excludeActions Array of strings. Example: <code>[ 'archive', 'delete' ]</code>.
 * @param {Array} options.additionalActions Array of objects <code>[ id,  displayText,
 * type=button'|'checkbox', defaultValue, onChange, contextType, className ]</code>.
 * @param {Boolean} options.disableMultiSelection show or hide checkbox
 */

const defaultOptions = {
    isSliding: true
};

export default Marionette.Object.extend({
    initialize(options = {}) {
        this.options = Object.assign({}, defaultOptions, options);
        this.__createView(this.options);
    },

    __createView(options) {
        const allToolbarActions = new VirtualCollection(new Backbone.Collection(this.__getToolbarActions()));
        const collection = factory.createWrappedCollection(this.options);

        const debounceUpdateAction = _.debounce(() => this.__updateActions(allToolbarActions, collection));
        if (this.options.showSelection) {
            this.listenTo(this.collection, 'check:all check:some check:none', debounceUpdateAction);
        } else {
            this.listenTo(this.collection, 'select:all select:some select:none', debounceUpdateAction);
        }

        this.view = new GridView(
            Object.assign(this.options, {
                actions: allToolbarActions,
                collection,
                columns: options.columns
            })
        );

        this.listenTo(this.view, 'search', text => this.__onSearch(text, options.columns, collection));
        this.listenTo(this.view, 'execute:action', this.__executeAction);
        this.listenTo(this.view, 'childview:click', this.__onItemClick);
        this.listenTo(this.view, 'childview:dblclick', this.__onItemDblClick);
    },

    __onSearch(text, columns, collection) {
        if (text) {
            this.__applyFilter(new RegExp(text, 'i'), columns, collection);
            this.__highlightCollection(text, collection);
        } else {
            this.__clearFilter(collection);
            this.__unhighlightCollection(collection);
        }

        if (this.options.isTree) {
            this.__toggleCollapseAll(text && !this.options.expandOnShow);
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
        if (!this.options.excludeActions) {
            toolbarActions = meta.defaultActions;
        } else if (this.options.excludeActions !== 'all') {
            toolbarActions = meta.defaultActions.filter(action => this.options.excludeActions.indexOf(action.id) === -1);
        }
        if (this.options.additionalActions) {
            toolbarActions = toolbarActions.concat(this.options.additionalActions);
        }
        return toolbarActions;
    },

    __updateActions(allToolbarActions, collection) {
        const checkedLength = this.__getSelectedItems(collection).length;

        allToolbarActions.filter(action => {
            switch (action.get('contextType')) {
                case 'void':
                    return true;
                case 'one':
                    return checkedLength === 1;
                case 'any':
                    return checkedLength;
                default:
                    return true;
            }
        });
    },

    __getSelectedItems(collection) {
        const selected = (this.options.showSelection ? collection.checked : collection.selected) || {};

        return Object.values(selected);
    },

    __executeAction(model) {
        switch (model.get('id')) {
            case 'delete':
                this.__confirmUserAction(
                    Localizer.get('PROCESS.COMMON.VIEW.GRID.ACTIONS.DELETE.CONFIRM.TEXT'),
                    Localizer.get('PROCESS.COMMON.VIEW.GRID.ACTIONS.DELETE.CONFIRM.TITLE'),
                    Localizer.get('PROCESS.COMMON.VIEW.GRID.ACTIONS.DELETE.CONFIRM.YESBUTTONTEXT'),
                    Localizer.get('PROCESS.COMMON.VIEW.GRID.ACTIONS.DELETE.CONFIRM.NOBUTTONTEXT')
                ).then(result => {
                    if (result) {
                        this.__triggerAction(model);
                    }
                });
                break;
            case 'archive':
                this.__confirmUserAction(
                    Localizer.get('PROCESS.COMMON.VIEW.GRID.ACTIONS.ARCHIVE.CONFIRM.TEXT'),
                    Localizer.get('PROCESS.COMMON.VIEW.GRID.ACTIONS.ARCHIVE.CONFIRM.TITLE'),
                    Localizer.get('PROCESS.COMMON.VIEW.GRID.ACTIONS.ARCHIVE.CONFIRM.YESBUTTONTEXT'),
                    Localizer.get('PROCESS.COMMON.VIEW.GRID.ACTIONS.ARCHIVE.CONFIRM.NOBUTTONTEXT')
                ).then(result => {
                    if (result) {
                        this.__triggerAction(model);
                    }
                });
                break;
            case 'unarchive':
                this.__confirmUserAction(
                    Localizer.get('PROCESS.COMMON.VIEW.GRID.ACTIONS.UNARCHIVE.CONFIRM.TEXT'),
                    Localizer.get('PROCESS.COMMON.VIEW.GRID.ACTIONS.UNARCHIVE.CONFIRM.TITLE'),
                    Localizer.get('PROCESS.COMMON.VIEW.GRID.ACTIONS.UNARCHIVE.CONFIRM.YESBUTTONTEXT'),
                    Localizer.get('PROCESS.COMMON.VIEW.GRID.ACTIONS.UNARCHIVE.CONFIRM.NOBUTTONTEXT')
                ).then(result => {
                    if (result) {
                        this.__triggerAction(model);
                    }
                });
                break;
            case 'addNew':
            default:
                this.__triggerAction(model);
                break;
        }
    },

    __confirmUserAction(text, title, yesButtonText, noButtonText) {
        return Core.services.MessageService.showMessageDialog(text || '', title || '', [{ id: true, text: yesButtonText || 'Yes' }, { id: false, text: noButtonText || 'No' }]);
    },

    __triggerAction(model) {
        this.trigger('execute', model, this.__getSelectedItems());
    },

    __getColumns() {
        return this.getOption('columns').map(column => ({
            id: column.key || column.id,
            cellView: column.cellView || column.customizeCellView || CellViewFactory.getCellViewForColumn(column),
            viewModel: column.viewModel || new Backbone.Model({ displayText: column.title }),
            sortAsc: utils.helpers.comparatorFor(utils.comparators.getComparatorByDataType(column.type, 'asc'), column.key),
            sortDesc: utils.helpers.comparatorFor(utils.comparators.getComparatorByDataType(column.type, 'desc'), column.key),
            width: column.width || 0,
            type: column.editor || 'Text',
            collection: new Backbone.Collection()
        }));
    },

    __onItemClick(model) {
        this.trigger('click', model);
    },

    __onItemDblClick(model) {
        this.trigger('dblclick', model);
    }
});
