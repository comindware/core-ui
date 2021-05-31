import template from './templates/wizardHeaderItem.hbs';

export default Marionette.View.extend({
    tagName: 'li',

    className() {
        return `layout__wizard__header-view-item ${this.model.get('stepClass') || ''}`;
    },

    template: Handlebars.compile(template),

    ui: {
        name: '.js-name',
        stepNumber: '.js-number'
    },

    modelEvents: {
        'change:selected change:error change:isVisible change:completed': '__applyClasses',
        'change:selected': '__onSelectedChange',
        'change:name': '__onChangeName',
        'change:stepNumber': '__onChangeStepNumber',
        'change:completed': '__onChangeCompleted'
    },

    onRender() {
        this.__applyClasses();

        this.el.setAttribute('id', this.model.id);
    },

    __onChangeName(model: Backbone.Model, name: string) {
        this.ui.name.html(name);
    },

    __onChangeStepNumber(model: Backbone.Model) {
        this.ui.stepNumber.text(model.get('stepNumber'));
    },

    __onChangeCompleted(model: Backbone.Model) {
        if (model.get('completed')) {
            this.ui.stepNumber.html(`<i class="${Handlebars.helpers.iconPrefixer('check')} layout__wizard__header-check-icon"></i>`);
        } else {
            this.__onChangeStepNumber(model);
        }
    },

    __applyClasses() {
        this.$el.toggleClass('layout__wizard__header-view-item_selected', Boolean(this.model.get('selected')));
        this.$el.toggleClass('layout__wizard__header-view-item_error', Boolean(this.model.get('error')));
        this.$el.toggleClass('layout__wizard__header-view-item_completed', this.model.get('completed'));
        this.$el.toggleClass('layout__wizard__header-view-item_hidden', !this.model.get('isVisible'));
    },

    __onSelectedChange(model: Backbone.Model, selected: boolean) {
        if (selected) {
            this.__scrollIntoViewIfNeeded();
        }
    },

    // native scrollIntoView causing the whole page to move,
    // to prevent that behaviour we need to use scrollIntoViewOptions,
    // but Edge, IE, and Safari doesn't support scrollIntoViewOptions.
    __scrollIntoViewIfNeeded() {
        if (!this.__isUiReady() || this.__isIntoView()) {
            return;
        }
        const offsetLeft = this.el.offsetLeft;
        this.$el.offsetParent().animate({ scrollLeft: offsetLeft }, 300);
    },

    __isIntoView(): boolean {
        const parentScrollLeft = this.el.parentElement.scrollLeft;
        const parentOffsetWidth = this.el.parentElement.offsetWidth;
        const parentScrollRight = parentScrollLeft + parentOffsetWidth;

        const elOffsetLeft = this.el.offsetLeft;
        const elOffsetWidth = this.el.offsetWidth;
        const elOffsetRight = elOffsetLeft + elOffsetWidth;

        return elOffsetLeft > parentScrollLeft && elOffsetRight < parentScrollRight;
    },

    __isUiReady(): boolean {
        return this.isRendered() && !this.isDestroyed() && this.isAttached();
    }
});
