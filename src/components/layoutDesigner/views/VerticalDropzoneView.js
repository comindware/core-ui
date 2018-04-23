import DropzoneView from './DropzoneView';

const classes = {
    DROPZONE_ACTIVE: 'dev-vertical-dropzone-active',
    DROPZONE_HOVER: 'dev-vertical-dropzone-hover'
};

export default DropzoneView.extend({
    className() {
        return `js-vertical-dropzone dev-vertical-dropzone dev-vertical-dropzone-${this.options.prefix}`;
    },

    getDistance(position) {
        const elPosition = this.$el.offset();

        if (position.y < elPosition.top || position.y > elPosition.top + this.$el.height()) {
            return Number.MAX_VALUE;
        }

        return Math.abs(position.x - (elPosition.left + this.$el.width() / 2));
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
    }
});
