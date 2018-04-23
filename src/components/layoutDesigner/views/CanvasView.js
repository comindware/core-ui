import template from '../templates/canvas.html';
import EmptyViewMask from '../views/EmptyViewMask';
import VerticalLayoutComponentView from '../views/VerticalLayoutComponentView';

export default Marionette.View.extend({
    template: Handlebars.compile(template),

    className: 'region',

    events: {
        mouseenter: '__mouseenter',
        mouseleave: '__mouseleave'
    },

    regions: {
        formRegion: '.js-form-region',
        emptyViewMaskRegion: '.js-empty-view-mask-region'
    },

    onRender() {
        const rootModel = this.model.get('root');
        this.showChildView('formRegion',
            this.createView(rootModel, {
                model: rootModel,
                reqres: this.getOption('reqres'),
                canvasReqres: this.getOption('canvasReqres'),
                canvasAggregator: this.getOption('canvasAggregator'),
                componentReqres: this.getOption('componentReqres')
            })
        );

        const emptyViewMaskRegion = this.getRegion('emptyViewMaskRegion');
        emptyViewMaskRegion.show(this.__createEmptyViewMask());

        if (this.getOption('config').hideEmptyView) {
            emptyViewMaskRegion.$el.hide();
        }
    },

    toggleMask(isShowed) {
        if (!this.getOption('config').hideEmptyView) {
            this.getRegion('emptyViewMaskRegion').$el.toggle(!isShowed);
        }
    },

    createView(rootModel, options) {
        let View = rootModel.get('view');
        if (this.getOption('config').dropZoneType === 'fixed') {
            const result = {};
            Object.keys(View.prototype).forEach(key => {
                result[key] = View.prototype[key];
            });
            View = VerticalLayoutComponentView.extend(result);
        }
        return new View(options);
    },

    __createEmptyViewMask() {
        return new EmptyViewMask();
    },

    __mouseenter() {
        this.canDrop = true;
    },

    __mouseleave() {
        this.canDrop = false;
    }
});
