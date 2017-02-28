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

const classes = {
    CLASS_NAME: 'layout__form-view'
};

export default Marionette.ItemView.extend({
    initialize: function (options) {
        helpers.ensureOption(options, 'schema');
        helpers.ensureOption(options, 'model');
        helpers.ensureOption(options, 'content');
    },

    template: false,

    className: classes.CLASS_NAME,

    regions () {
        return {
            contentRegion: {
                el: this.el
            }
        };
    },

    behaviors: {
        RegionBehavior: {
            behaviorClass: RegionBehavior
        },
        BackboneFormBehavior: {
            behaviorClass: form.behaviors.BackboneFormBehavior,
            renderStrategy: 'manual',
            model: function () {
                const model = this.options.model;
                return _.isFunction(model) ? model.call(this) : model;
            },
            schema: function () {
                const schema = this.options.schema;
                return _.isFunction(schema) ? schema.call(this) : schema;
            }
        }
    },

    onShow () {
        this.contentRegion.show(this.options.content);
        this.renderForm();
    }
});
