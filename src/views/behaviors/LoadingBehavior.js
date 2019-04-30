import { helpers } from 'utils';
import LocalizationService from '../../services/LocalizationService';
import LoadingView from '../../views/LoadingView';

export default Marionette.Behavior.extend({
    initialize(options, view) {
        helpers.ensureOption(options, 'region');

        this.loadingViewOptions = {
            text: options.text || LocalizationService.get('CORE.VIEWS.BEHAVIORS.LOADING.DEFAULTLOADINGSMALL')
        };
        view.loading = {
            setLoading: this.setLoading.bind(this)
        };
    },

    setLoading(visible) {
        if (typeof visible === 'boolean') {
            if (visible) {
                const view = new LoadingView(this.loadingViewOptions);
                view.once('attach', view.el.classList.add('visible-loader'));

                this.view.getRegion(this.options.region).show(view);
            } else {
                this.view.getRegion(this.options.region).reset();
            }
        } else if (visible instanceof Promise) {
            this.setLoading(true);
            Promise.resolve(visible).then(
                () => {
                    this.setLoading(false);
                },
                () => {
                    //noinspection JSPotentiallyInvalidUsageOfThis
                    this.setLoading(false);
                }
            );
        } else {
            helpers.throwError('Invalid argument format.', 'FormatError');
        }
    }
});
