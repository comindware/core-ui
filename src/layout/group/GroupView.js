// @flow
import template from './group.hbs';
import LayoutBehavior from '../behaviors/LayoutBehavior';

const defaultOptions = ({ view }) => ({
    collapsed: false,
    collapsible: Boolean(view)
});

const classes = {
    CLASS_NAME: 'layout-group',
    COLLAPSED_CLASS: 'layout__group-collapsed__button'
};

export default Marionette.View.extend({
    initialize(options) {
        _.defaults(options, defaultOptions(options));
        this.model = new Backbone.Model(options);
        this.listenTo(this.model, 'change:collapsed', this.__onCollapsedChange);

        this.update = this.update.bind(this);
    },

    template: Handlebars.compile(template),

    className: classes.CLASS_NAME,

    regions: {
        containerRegion: '.js-container-region'
    },

    behaviors: {
        LayoutBehavior: {
            behaviorClass: LayoutBehavior
        }
    },

    ui: {
        toggleCollapseButtons: '.js-toggle',
        containerRegion: '.js-container-region'
    },

    events: {
        'click @ui.toggleCollapseButtons': 'onToggleButtonClick'
    },

    onRender() {
        const view = this.model.get('view');
        if (view) {
            this.showChildView('containerRegion', view);
        } else {
            this.ui.containerRegion[0].setAttribute('hidden', '');
        }
        this.__updateState();
        this.__onCollapsedChange();
    },

    update() {
        const view = this.model.get('view');
        if (view?.update) {
            view.update();
        }
        this.__updateState();
    },

    validate() {
        const view = this.model.get('view');
        if (view?.validate) {
            return view.validate();
        }
    },

    onToggleButtonClick(e) {
        if ([ ...this.ui.toggleCollapseButtons].some(el => el === e.currentTarget)) {
            this.toggleCollapse();
        }
    },

    toggleCollapse(collapse = !this.model.get('collapsed')) {
        if (!this.model.get('collapsible')) {
            return;
        }
        this.model.set('collapsed', collapse);
    },

    __onCollapsedChange(model = this.model, collapsed = this.model.get('collapsed')) {
        this.ui.toggleCollapseButtons.toggleClass(classes.COLLAPSED_CLASS, Boolean(collapsed));
        if (collapsed) {
            this.ui.containerRegion.hide(200);
        } else {
            this.ui.containerRegion.show(200);
        }
    }
});
