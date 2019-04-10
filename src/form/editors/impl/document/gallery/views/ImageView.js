import LoadingBehavior from '../../../../../../views/behaviors/LoadingBehavior';
import template from '../templates/image.html';

const playIconClassName = 'play-icon';

export default Marionette.View.extend({
    initialize(options) {
        this.previewMode = options.previewMode;
    },

    regions: {
        loadingRegion: '.js-gallery-loading-region'
    },

    className() {
        const isVideo = this.model.get('previewTag') === 'video' ? playIconClassName : '';
        return `gallery-image ${isVideo}`;
    },

    template: Handlebars.compile(template),

    templateContext() {
        const tag = this.model.get('previewTag');
        return {
            url: this.model.get('url'),
            tag,
            attrs: tag === 'video' && !this.previewMode ? 'controls' : ''
        };
    },

    behaviors: {
        LoadingBehavior: {
            behaviorClass: LoadingBehavior,
            region: 'loadingRegion'
        }
    },

    triggers: { click: 'item:click' },

    modelEvents: {
        change: 'render'
    },

    onRender() {
        const imgElement = this.el.querySelector('img, video');
        if (!this.previewMode && imgElement) {
            this.__setLoading(true);
            imgElement.addEventListener('load', () => this.__setLoading(false));
        }
    },

    onDestroy() {
        const imgElement = this.el.querySelector('img, video');
        imgElement.removeEventListener('load', this.__setLoading);
    },

    __setLoading(state) {
        this.loading.setLoading(state);
    }
});
