import nativeGridApi from '../../nativeGrid/nativeGridApi';
import template from '../templates/editableGridColumnHeader.hbs';

const ColumnHeaderView = nativeGridApi.views.ColumnHeaderView;

const checkedState = {
    checked: 'checked',
    unchecked: 'unchecked',
    checkedSome: 'checkedSome'
};

const checkBoxClasses = {
    checked: 'editor_checked',
    checkedSome: 'editor_checked_some'
};

export default ColumnHeaderView.extend({
    initialize() {
        ColumnHeaderView.prototype.initialize.apply(this, arguments);
        if (this.model.get('isCheckboxColumn')) {
            this.selectableCollection = this.model.get('selectableCollection');
            this.listenTo(this.selectableCollection, 'select:all', this.__setCheckBoxAll);
            this.listenTo(this.selectableCollection, 'select:none', this.__setCheckBoxNone);
            this.listenTo(this.selectableCollection, 'select:some', this.__setCheckBoxSome);
        }
        this.__regionManager = new Marionette.RegionManager();
    },

    template: Handlebars.compile(template),

    ui: {
        checkbox: '.js-header-checkbox',
        cellContent: '.js-cell-content'
    },

    events: {
        'click @ui.checkbox': '__toggleSelection',
        'click @ui.cellContent': '__handleSorting'
    },

    onRender() {
        ColumnHeaderView.prototype.onRender.call(this);

        if (this.model.get('isCheckboxColumn') && this.selectableCollection.selectedLength) {
            if (this.selectableCollection.selected.length === this.selectableCollection.selectedLength) {
                this.__setCheckBoxAll();
            } else {
                this.__setCheckBoxSome();
            }
        }
    },

    onDestroy() {
        this.__regionManager.destroy();
    },

    __toggleSelection() {
        if (this.checkedState !== checkedState.checked) {
            this.selectableCollection.selectAll();
        } else {
            this.selectableCollection.selectNone();
        }
        return false;
    },

    __setCheckBoxAll() {
        this.checkedState = checkedState.checked;
        this.ui.checkbox.addClass(checkBoxClasses.checked);
        this.ui.checkbox.removeClass(checkBoxClasses.checkedSome);
    },

    __setCheckBoxNone() {
        this.checkedState = checkedState.unchecked;
        this.ui.checkbox.removeClass(checkBoxClasses.checked);
        this.ui.checkbox.removeClass(checkBoxClasses.checkedSome);
    },

    __setCheckBoxSome() {
        this.checkedState = checkedState.checkedSome;
        this.ui.checkbox.removeClass(checkBoxClasses.checked);
        this.ui.checkbox.addClass(checkBoxClasses.checkedSome);
    }
});

