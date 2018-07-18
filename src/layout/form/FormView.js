// @flow
import { helpers } from 'utils';
import form from 'form';
import LayoutBehavior from '../behaviors/LayoutBehavior';
import FormContentFactory from './FormContentFactory';
import FormSchemaFactory from './FormSchemaFactory';

const classes = {
    CLASS_NAME: 'layout__form-view'
};

export default Marionette.View.extend({
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
        this.__addUniqueFormIdToModel();
    },

    template: Handlebars.compile('<div class="form-class"></div>'),

    tagName: 'form',

    className: classes.CLASS_NAME,

    regions: {
        contentRegion: {
            el: '.form-class',
            replaceElement: true
        }
    },

    behaviors: {
        LayoutBehavior: {
            behaviorClass: LayoutBehavior
        },
        BackboneFormBehavior: {
            behaviorClass: form.behaviors.BackboneFormBehavior,
            model() {
                return this.model;
            },
            schema() {
                const schema = this.schema;
                return _.isFunction(schema) ? schema.call(this) : schema;
            }
        }
    },

    onRender() {
        this.showChildView('contentRegion', this.content);
        this.__updateState();
    },

    getValue(key) {
        if (!this.form) {
            return this.model.get(key);
        }
        return this.form.getValue(key);
    },

    __addUniqueFormIdToModel() {
        const modelUniqueFormId = this.model.get('uniqueFormId');
        const setOfUniqueFormId = modelUniqueFormId instanceof Set ? modelUniqueFormId : new Set();
        setOfUniqueFormId.add(this.uniqueFormId);
        this.model.set('uniqueFormId', setOfUniqueFormId, { silent: true });
    },

    update() {
        if (this.content.update) {
            this.content.update();
        }
        this.__updateState();
    }
});
