import RowView from './RowView';
import CollapsibleBehavior from '../../models/behaviors/CollapsibleBehavior';
import GridItemBehavior from '../../list/models/behaviors/GridItemBehavior';

const defaultOptions = {
    paddingLeft: 20,
    paddingRight: 10,
    levelMargin: 15,
    collapsibleButtonWidth: 14
};

const expandedClass = 'collapsible-btn_expanded';

export default RowView.extend({
    events: {
        click: '__onClick',
        dblclick: '__onDblClick',
        'click .collapsible-btn': '__toggleCollapse'
    },

    initialize() {
        _.defaults(this.options, defaultOptions);
        _.extend(this.model, new GridItemBehavior(this));
        _.extend(this.model, new CollapsibleBehavior(this));
        this.listenTo(this.model, 'checked', this.__onModelChecked);
        this.listenTo(this.model, 'unchecked', this.__onModelUnchecked);
    },

    _renderTemplate() {
        this.cellViews = [];
        let isFirstChild = true;
        this.options.columns.forEach(gridColumn => {
            const id = gridColumn.id;
            let value;

            if (gridColumn.cellViewOptions && gridColumn.cellViewOptions.getValue) {
                value = gridColumn.cellViewOptions.getValue.apply(this, [gridColumn]);
            } else {
                value = this.model.get(id);
            }

            const cellView = new gridColumn.cellView({
                className: 'grid-cell js-grid-cell',
                model: new Backbone.Model({
                    value,
                    rowModel: this.model,
                    columnConfig: gridColumn,
                    highlightedFragment: null
                }),
                gridEventAggregator: this.options.gridEventAggregator
            });
            if (isFirstChild && !gridColumn.viewModel.get('isCheckboxColumn')) {
                const level = this.model.level || 0;
                const margin = level * this.options.levelMargin;
                const hasChildren = this.model.children && this.model.children.length;
                cellView.on('render', () => {
                    if (hasChildren) {
                        this.collapseButton = $(`<span class="collapsible-btn" style="margin-left:${margin}px;"></span>`);
                        cellView.$el.prepend(this.collapseButton);
                    } else {
                        cellView.$el.prepend($(`<span style="margin-left:${margin + defaultOptions.collapsibleButtonWidth}px;"></span>`));
                    }
                });

                isFirstChild = false;
            }
            cellView.render();

            cellView.$el.addClass('js-grid-cell').appendTo(this.$el);
            this.cellViews.push(cellView);
        });

        if (this.model.level && !this.options.expandOnShow) {
            this.$el.hide();
            this.model.hidden = true;
        }
        if (this.options.expandOnShow) {
            this.updateCollapsed(false);
        }
    },

    __toggleCollapse() {
        this.updateCollapsed(this.model.collapsed === undefined ? false : !this.model.collapsed);
        this.trigger('toggle:collapse', this.model);
    },

    updateCollapsed(collapsed, external) {
        if (!collapsed) {
            this.model.expand(true);
            if (external) {
                this.$el.slideDown();
                this.model.hidden = false;
            }
        } else {
            this.model.collapse(true);
            if (this.model.level && external) {
                this.$el.slideUp();
                this.model.hidden = true;
            }
        }
        if (this.collapseButton) {
            this.collapseButton.toggleClass(expandedClass, !collapsed);
        }
    },

    __onModelChecked() {
        this.internalCheck = true;
        if (this.model.children && this.model.children.length) {
            this.model.children.forEach(model => {
                model.check();
            });
        }
        this.internalCheck = false;
        this.__updateParentChecked();
    },

    __onModelUnchecked() {
        this.internalCheck = true;
        if (this.model.children && this.model.children.length) {
            this.model.children.forEach(model => {
                model.uncheck();
            });
        }
        this.internalCheck = false;
        this.__updateParentChecked();
    },

    __updateParentChecked() {
        if (this.internalCheck) {
            return;
        }
        const parentModel = this.model.parentModel;
        if (parentModel) {
            let checkedChildren = 0;
            parentModel.children.forEach(child => {
                if (child.checked) {
                    checkedChildren++;
                }
            });
            if (checkedChildren === 0) {
                parentModel.uncheck();
            } else if (parentModel.children.length === checkedChildren) {
                parentModel.check();
            } else {
                parentModel.checkSome();
            }
        }
    }
});
