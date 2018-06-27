// @flow
import LayoutBehavior from '../behaviors/LayoutBehavior';

type optionsT = {
    text: string,
    model?: Backbone.Model,
    key?: string
};

export default Marionette.View.extend({
    initialize(options: optionsT) {
        this.text = options.text;
        this.key = options.key;
        if (this.model && this.key) {
            this.listenTo(this.model, `change:${this.key}`, (model, newValue) => this.$el.text(newValue));
        }
    },

    className() {
        return this.options.class ? this.options.class : '';
    },

    template: false,

    behaviors: {
        LayoutBehavior: {
            behaviorClass: LayoutBehavior
        }
    },

    onRender() {
        if (this.model && this.key) {
            this.$el.text(this.model.get(this.key));
        } else {
            this.$el.text(this.text);
        }
    },

    update() {
        this.__updateState();
    }
});
