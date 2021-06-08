import form from 'form';
import LayoutBehavior from '../behaviors/LayoutBehavior';
import LoadingBehavior from 'views/behaviors/LoadingBehavior';
import FormContentFactory from './FormContentFactory';
import FormSchemaFactory from './FormSchemaFactory';
import template from './form.hbs';

const classes = {
    CLASS_NAME: 'layout__form-view'
};

const anchors = ['field', 'editor'];

export default Marionette.View.extend({
    initialize(options) {
        this.uniqueFormId = _.uniqueId('form-');
        if (!('content' in options)) {
            this.content = FormContentFactory.getContentFromSchema(options.schema, this.uniqueFormId);
            this.schema = FormSchemaFactory.getSchema(options.schema);
        } else {
            this.content = options.content;
            this.schema = options.schema;
        }

        const model = this.options.model;
        this.model = typeof model === 'function' ? model.call(this) : model;
        this.__addUniqueFormIdToModel();
    },

    template: Handlebars.compile(template),

    tagName: 'form',

    className() {
        return `${classes.CLASS_NAME} ${this.options.class || ''}`;
    },

    regions: {
        contentRegion: {
            el: '.form-class',
            replaceElement: true
        },
        loadingRegion: '.js-loading-region'
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
                return typeof schema === 'function' ? schema.call(this) : schema;
            },
            options() {
                return this.options;
            }
        },
        LoadingBehavior: {
            behaviorClass: LoadingBehavior,
            region: 'loadingRegion',
        }
    },

    onRender() {
        this.showChildView('contentRegion', this.content);
        if ('content' in this.options) {
            anchors.forEach(anchor => {
                this.content.$el.find(`[data-${anchor}s]`).each((i, el) => {
                    el.setAttribute(`${anchor}-for`, this.uniqueFormId);
                });
            });
        }
        this.__updateState();
    },

    getValue(key) {
        if (!this.form) {
            return this.model.get(key);
        }
        return this.form.getValue(key);
    },

    __addUniqueFormIdToModel() {
        if (!(this.model.uniqueFormId instanceof Set)) {
            this.model.uniqueFormId = new Set();
        }
        this.model.uniqueFormId.add(this.uniqueFormId);
    },

    update() {
        if (this.content.update) {
            this.content.update();
        }
        this.__updateState();
    },

    validate() {
        let fieldErrors;
        let contentErrors;
        if (this.form) {
            fieldErrors = this.form.validate();
        }
        if (this.content && this.content.validate) {
            contentErrors = this.content.validate();
        }

        return fieldErrors || contentErrors;
    }
});
