import { helpers } from 'utils';
import template from './group.hbs';
import LayoutBehavior from '../behaviors/LayoutBehavior';

const defaults = {
    collapsed: false
};

const classes = {
    CLASS_NAME: 'layout-group',
    COLLAPSED_CLASS: 'layout__group-collapsed__button'
};

export default Marionette.View.extend({
    initialize(options) {
        helpers.ensureOption(options, 'view');

        this.model = new Backbone.Model(Object.assign(defaults, options));
        this.model.set({ collapsible: options.collapsible === undefined ? true : options.collapsible });
        this.listenTo(this.model, 'change:collapsed', this.__onCollapsedChange);
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
        toggleCollapseButton: '.js-toggle'
    },

    events: {
        'click @ui.toggleCollapseButton': '__toggleCollapse'
    },

    onRender() {
        const view = this.model.get('view');
        if (view) {
            this.showChildView('containerRegion', view);
        }
        this.__updateState();
    },

    update() {
        const view = this.model.get('view');
        if (view.update) {
            view.update();
        }
        this.__updateState();
    },

    validate() {
        const view = this.model.get('view');
        if (view.validate) {
            return view.validate();
        }
    },

    __toggleCollapse() {
        if (!this.model.get('collapsible')) {
            return;
        }
        if (this.model.get('collapsible') !== false) {
            this.model.set('collapsed', !this.model.get('collapsed'));
            return false;
        }
    },

    __onCollapsedChange(model, collapsed) {
        this.ui.toggleCollapseButton.toggleClass(classes.COLLAPSED_CLASS, collapsed);
        if (collapsed) {
            this.getRegion('containerRegion').$el.hide(200);
        } else {
            this.getRegion('containerRegion').$el.show(200);
        }
        return false;
    }
});
