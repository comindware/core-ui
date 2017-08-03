/**
 * Developer: Ksenia Kartvelishvili
 * Date: 26.06.2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

'use strict';

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
        if (_.isBoolean(visible)) {
            if (visible) {
                this.view[this.options.region].show(new LoadingView(this.loadingViewOptions));
            } else {
                this.view[this.options.region].reset();
            }
        } else if (visible instanceof Promise) {
            this.setLoading(true);
            Promise.resolve(visible).bind(this).then(function() {
                //noinspection JSPotentiallyInvalidUsageOfThis
                this.setLoading(false);
            }, function() {
                //noinspection JSPotentiallyInvalidUsageOfThis
                this.setLoading(false);
            });
        } else {
            helpers.throwError('Invalid argument format.', 'FormatError');
        }
    }
});
