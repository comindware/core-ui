import nativeGridApi from '../../nativeGrid/nativeGridApi';
import EditableGridColumnHeaderView from './EditableGridColumnHeaderView';

const HeaderView = nativeGridApi.views.HeaderView;

export default HeaderView.extend({
    initialize() {
        HeaderView.prototype.initialize.apply(this, arguments);
    },

    onRender() {
        if (this.__columnEls) {
            this.__columnEls.forEach(c => c.destroy());
        }

        this.__columnEls = [];

        let isFirstChild = true;
        this.ui.gridHeaderColumnContent.each((i, el) => {
            const column = this.columns[i];
            const view = new EditableGridColumnHeaderView(Object.assign(this.gridColumnHeaderViewOptions || {}, {
                model: column.viewModel,
                column,
                gridEventAggregator: this.gridEventAggregator
            }));
            this.listenTo(view, 'columnSort', this.__handleColumnSort);
            this.__columnEls.push(view);
            const childEl = view.render().el;
            el.appendChild(childEl);
            if (this.options.isTree && isFirstChild && !column.viewModel.get('isCheckboxColumn')) {
                this.collapseButton = $('<span class="collapsible-btn"></span>');
                view.$el.prepend(this.collapseButton);
                isFirstChild = false;
            }
        });

        this.headerMinWidth = this.__getAvailableWidth();
        this.__setInitialWidth(this.headerMinWidth);
    }
});
