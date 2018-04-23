//@flow
import template from '../templates/dropzone.html';

const classes = {
    DROPZONE_ACTIVE: 'ld-dragzone_active',
    DROPZONE_HOVER: 'ld-dragzone_hover'
};

export default Marionette.View.extend({
    initialize(options) {
        this.context = options.context;
    },

    template: Handlebars.compile(template),

    className: 'ld-dragzone',

    /**
     * Считаем расстояние между текущей дропзоной и позицией мыши.
     * Расстояние - вооще говоря любая подходящая нам метрика
     * @param position - объект с позицией мышки {x, y} - координаты
     * @returns {Number} - расстояние
     */
    getDistance(position) {
        const elPosition = this.$el.offset();

        if (position.x < elPosition.left || position.x > elPosition.left + this.$el.width()) {
            return Number.MAX_VALUE;
        }

        return Math.abs(position.y - (elPosition.top + this.$el.height() / 2));
    },

    activate() {
        this.$el.addClass(classes.DROPZONE_ACTIVE);
    },

    deactivate() {
        this.$el.removeClass(classes.DROPZONE_ACTIVE);
    },

    enter() {
        this.$el.addClass(classes.DROPZONE_HOVER);
    },

    leave() {
        this.$el.removeClass(classes.DROPZONE_HOVER);
    },

    drop(dragContext) {
        this.trigger('drop', {
            zoneContext: this.context,
            dragContext
        });
    }
});
