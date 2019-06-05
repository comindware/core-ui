export default Marionette.Behavior.extend({
    ui: {
        eyeBtn: '.js-eye-btn'
    },

    events: {
        'click @ui.eyeBtn': '__onEyeClick'
    },

    __onEyeClick(event) {
        event.stopPropagation();
        console.log(this);
    }
});
