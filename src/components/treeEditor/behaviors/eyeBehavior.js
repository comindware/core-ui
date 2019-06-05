const hiddenClass = 'hidden-node';

export default Marionette.Behavior.extend({
    initialize() {
        this.listenTo(this.view.options.model, 'change:isHidden', () => this.__handleHiddenChange());
    },

    ui: {
        eyeBtn: '.js-eye-btn'
    },

    events: {
        'click @ui.eyeBtn': '__handleEyeClick'
    },

    onAttach() {
        this.__toggleHiddenClass();
    },

    __handleEyeClick() {
        event.stopPropagation();
        const model = this.view.options.model;
        if (model.get('required')) {
            return;
        }

        const isHidden = model.get('isHidden');

        model.set('isHidden', !isHidden);
    },

    __handleHiddenChange() {
        // this.view.options.reqres.request('personalFormConfiguration:setWidgetConfig', this.view.model.get('id'), { isHidden: this.view.model.get('isHidden') });
        this.view.render();
        this.__toggleHiddenClass();
    },

    __toggleHiddenClass() {
        const isHidden = !!this.view.model.get('isHidden');

        this.el.classList.toggle(hiddenClass, isHidden);
    }
});
