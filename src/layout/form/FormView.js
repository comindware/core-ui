/**
 * Developer: Stepan Burguchev
 * Date: 2/28/2017
 * Copyright: 2009-2017 Stepan Burguchev®
 *       All Rights Reserved
 * Published under the MIT license
 */

import 'lib';
import { helpers, RegionBehavior } from 'utils';
import form from 'form';
import LayoutBehavior from '../behaviors/LayoutBehavior';

const classes = {
    CLASS_NAME: 'layout__form-view'
};

export default Marionette.ItemView.extend({
    initialize(options) {
        helpers.ensureOption(options, 'schema');
        helpers.ensureOption(options, 'model');
        helpers.ensureOption(options, 'content');

        const model = this.options.model;
        this.model = _.isFunction(model) ? model.call(this) : model;

        this.content = options.content;
    },

    template: false,

    className: classes.CLASS_NAME,

    regions() {
        return {
            contentRegion: {
                el: this.el
            }
        };
    },

    behaviors: {
        LayoutBehavior: {
            behaviorClass: LayoutBehavior
        },
        RegionBehavior: {
            behaviorClass: RegionBehavior
        },
        BackboneFormBehavior: {
            behaviorClass: form.behaviors.BackboneFormBehavior,
            renderStrategy: 'manual',
            model() {
                return this.model;
            },
            schema() {
                const schema = this.options.schema;
                return _.isFunction(schema) ? schema.call(this) : schema;
            }
        }
    },

    onShow() {
        this.contentRegion.show(this.options.content);
        this.renderForm();
        this.__updateState();
    },

    getValue(key) {
        if (!this.form) {
            return this.model.get(key);
        }
        return this.form.getValue(key);
    },

    update() {
        if (this.content.update) {
            this.content.update();
        }
        this.__updateState();
    }
});
