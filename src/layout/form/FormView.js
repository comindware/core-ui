
import 'lib';
import { helpers, RegionBehavior } from 'utils';
import form from 'form';
import LayoutBehavior from '../behaviors/LayoutBehavior';
import FormContentFactory from './FormContentFactory';
import FormSchemaFactory from './FormSchemaFactory';

const classes = {
    CLASS_NAME: 'layout__form-view'
};

export default Marionette.ItemView.extend({
    initialize(options) {
        helpers.ensureOption(options, 'schema');
        helpers.ensureOption(options, 'model');
        if (!('content' in options)) {
            this.uniqueFormId = _.uniqueId('form-');
            this.content = FormContentFactory.getContentFromSchema(options.schema, this.uniqueFormId);
            this.schema = FormSchemaFactory.getSchema(options.schema);
        } else {
            this.content = options.content;
            this.schema = options.schema;
        }

        const model = this.options.model;
        this.model = _.isFunction(model) ? model.call(this) : model;
        this.model.set({ uniqueFormId: this.uniqueFormId }, { silent: true });
    },

    template: false,

    tagName: 'form',

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
                const schema = this.schema;
                return _.isFunction(schema) ? schema.call(this) : schema;
            }
        }
    },

    onShow() {
        this.contentRegion.show(this.content);
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
