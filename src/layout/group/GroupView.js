/**
 * Developer: Ksenia Kartvelishvili
 * Date: 8/2/2017
 * Copyright: 2009-2017 Ksenia Kartvelishvili®
 *       All Rights Reserved
 * Published under the MIT license
 */

import { Handlebars } from 'lib';
import { helpers } from 'utils';
import template from './group.hbs';
import LayoutBehavior from '../behaviors/LayoutBehavior';

const classes = {
    CLASS_NAME: 'layout__group'
};

export default Marionette.LayoutView.extend({
    initialize(options) {
        helpers.ensureOption(options, 'view');
        
        this.model = new Backbone.Model(options);
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

    onShow() {
        const view = this.model.get('view');
        if (view) {
            this.containerRegion.show(view);
        }
        this.__updateState();
    },

    update() {
        const view = this.model.get('view');
        if (view.update) {
            view.update();
        }
        this.__updateState();
    }
});
