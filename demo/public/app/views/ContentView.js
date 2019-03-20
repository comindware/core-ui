const requireCode = require.context('babel-loader!../cases', true);
const requireText = require.context('raw-loader!../cases', true);

import template from 'text-loader!../templates/content.html';
import { valueEditorTypes } from '../meta';

export default Marionette.View.extend({
    initialize() {
        this.configCollection = new Backbone.Collection();
    },

    className: 'demo-content_wrapper',

    template: Handlebars.compile(template),

    templateContext() {
        return {
            description: this.model.get('description') || ''
        };
    },

    regions: {
        caseRepresentationRegion: '.js-case-representation-region',
        attributesConfigurationRegion: '.js-attributes-configuration-region',
        toolbarRegion: '.js-toolbar-region',
        codeRegion: '.js-code'
    },

    ui: {
        code: '.js-code'
    },

    onRender() {
        let path;
        if (this.model.id) {
            path = `${this.model.get('sectionId')}/${this.model.get('groupId')}/${this.model.id}`;
        } else {
            path = `${this.model.get('sectionId')}/${this.model.get('groupId')}`;
        }

        const code = requireCode(`./${path}`).default;

        this.representationView = code;
        const representationView = code();

        this.showChildView('caseRepresentationRegion', representationView);
        const devTemporaryExcludeModules = ['MultiEditorEditor', 'DropdownEditor', 'DropdownMultiEditor', 'DatalistEditor', 'DatalistSingleEditor'];
        this.devIsInteractive = this.model.get('sectionId') === 'editors' && !devTemporaryExcludeModules.includes(this.model.get('groupId'));

        if (this.devIsInteractive) {
            const defaults = Object.entries(_.omit(representationView.view.options, 'model', 'key')).map(item => ({
                attribute: item[0],
                default: item[1],
                description: 'No description yet'
            }));
            const attributesConfig = this.model.get('attributesConfig');

            attributesConfig.forEach(config => {
                const finded = defaults.findIndex(z => z.attribute === config.attribute);
                if (finded !== -1) {
                    Object.assign(defaults[finded], config);
                } else {
                    defaults.push(config);
                }
                if (config.valueEditorType === valueEditorTypes.OBJECT_TREE) {
                    const element = defaults[defaults.findIndex(x => x.valueEditorType === valueEditorTypes.OBJECT_TREE)];
                    element.children = element.nestedattributesConfigs; //TO DO: bind this data to model (i.e. make autocommit working with nested properties too)
                }
            });

            this.configCollection.reset(
                defaults.map(config => {
                    const defaultValue = config.default || defaults[config.attribute];
                    const selectedValue = config.selectedValue ? config.selectedValue.id || config.selectedValue : defaultValue;

                    return Object.assign(config, {
                        selectedValue: config.valueEditorType === 'Datalist' ? { id: selectedValue } : selectedValue,
                        default: defaultValue
                    });
                })
            );
            this.showChildView('attributesConfigurationRegion', this.__createAttributesConfigurationView());
        }

        const toolbar = new Core.components.Toolbar({
            allItemsCollection: new Backbone.Collection([
                {
                    iconClass: 'plus',
                    id: 'component',
                    name: 'Component',
                    type: 'Checkbox',
                    severity: 'Low',
                    resultType: 'CustomClientAction',
                    context: 'Void',
                    isChecked: true
                },
                {
                    iconType: 'Undefined',
                    id: 'attributes',
                    name: 'Attributes',
                    severity: 'None',
                    defaultTheme: true,
                    type: 'Checkbox',
                    isChecked: true
                },
                {
                    iconType: 'Undefined',
                    id: 'code',
                    name: 'Code',
                    severity: 'None',
                    defaultTheme: true,
                    type: 'Checkbox',
                    isChecked: !Core.services.MobileService.isMobile
                }
            ])
        });

        this.listenTo(toolbar, 'command:execute', model => this.__handleToolbarClick(model));

        this.showChildView('toolbarRegion', toolbar);
    },

    onAttach() {
        let path;
        if (this.model.id) {
            path = `${this.model.get('sectionId')}/${this.model.get('groupId')}/${this.model.id}`;
        } else {
            path = `${this.model.get('sectionId')}/${this.model.get('groupId')}`;
        }

        const text = requireText(`./${path}`).default;

        const textView = new Core.form.editors.CodeEditor({
            model: new Backbone.Model({
                code: text
            }),
            schema: {
                type: 'Code',
                autocommit: true,
                mode: 'script',
                readonly: true,
                lineSeparator: '\n',
                showDebug: false
            },
            key: 'code'
        });

        this.showChildView('codeRegion', textView);
        textView.setReadonly(true);
        this.__reloadEditor();

        this.$('.demo-content__code').toggle(!Core.services.MobileService.isMobile);
    },

    __createAttributesConfigurationView() {
        const columns = [
            {
                key: 'attribute',
                type: 'Text',
                title: 'Attribute',
                sorting: 'asc',
                width: '0.2'
            },
            {
                key: 'selectedValue',
                schemaExtension: model => this.__getSchemaExtension(model),
                editable: true,
                readonly: false,
                autocommit: true,
                title: 'Current value',
                sortAsc: (a, b) => (a.get('selectedValue') > b.get('selectedValue') ? 1 : -1),
                sortDesc: (a, b) => (a.get('selectedValue') < b.get('selectedValue') ? 1 : -1),
                width: '0.2'
            },
            {
                key: 'default',
                type: 'Text',
                title: 'Default value',
                width: '0.2'
            },
            {
                key: 'description',
                type: 'Text',
                title: 'Description',
                width: '0.4'
            }
        ];

        const gridController = new Core.list.GridView({
            columns,
            isTree: this.configCollection.some(x => !!x.get('children')),
            childrenAttribute: 'children',
            collection: this.configCollection
        });

        return gridController;
    },

    __getSchemaExtension(model) {
        this.listenTo(model, 'change:selectedValue', () => this.__reloadEditor());
        switch (model.get('valueEditorType')) {
            case 'Datalist': {
                const valuesArray = model
                    .get('values')
                    .split(',')
                    .map(ch => ({ id: ch.trim() }));
                if (!model.get('selectedValue')) {
                    model.set('selectedValue', { id: model.get('default') });
                }
                return {
                    type: 'Datalist',
                    collection: new Backbone.Collection(valuesArray),
                    allowEmptyValue: false,
                    displayAttribute: 'id'
                };
            }
            case 'Number': {
                return {
                    type: 'Number'
                };
            }
            case valueEditorTypes.ARRAY: {
                return {
                    type: 'Text'
                };
            }
            default:
                if (!model.get('selectedValue')) {
                    model.set('selectedValue', model.get('default'));
                }
                return {
                    type: 'Text'
                };
        }
    },

    __reloadEditor() {
        if (this.devIsInteractive) {
            const __mapSelectedValue = (model, options) => {
                if (options && options.isArray) {
                    const string = model.selectedValue;
                    return string
                        ? string
                              .trim()
                              .slice(1, string.length - 1)
                              .split(',')
                              .map(x => x.trim())
                              .map(x => x.split("'")[1] || new RegExp(x.split('/')[1]))
                        : '';
                }
                if (model.selectedValue) {
                    return model.valueEditorType === 'Datalist' ? (Array.isArray(model.selectedValue) ? model.selectedValue[0].id : model.selectedValue.id) : model.selectedValue;
                }
            };
            const caseView = this.getChildView('caseRepresentationRegion').view;
            const attributes = caseView.model ? caseView.model.attributes : caseView.options.attributes;

            const schema = {};
            this.configCollection.toJSON().map(configModel => {
                let attribute;
                switch (configModel.valueEditorType) {
                    case valueEditorTypes.ARRAY:
                        attribute = __mapSelectedValue(configModel, { isArray: true });
                        break;
                    // TO DO: case valueEditorTypes.OBJECT_TREE:
                    //     attribute = __mapSomeHow(configModel.children);
                    //     break;
                    default:
                        attribute = this.__tryParse(__mapSelectedValue(configModel));
                        break;
                }
                return Object.assign(schema, { [configModel.attribute]: attribute });
            });
            this.detachChildView('caseRepresentationRegion');
            this.showChildView(
                'caseRepresentationRegion',
                this.representationView({
                    attributes,
                    schema
                })
            );
        }
    },

    __tryParse(string) {
        switch (string) {
            case 'undefined':
                return undefined;
            case 'null':
                return null;
            default:
                try {
                    const res = JSON.parse(string);
                    return res;
                } catch (e) {
                    return string;
                }
        }
    },

    __handleToolbarClick(model) {
        switch (model.id) {
            case 'component':
                this.$('.js-case-representation-region').toggle(model.get('isChecked'));
                break;
            case 'attributes':
                this.$('.js-attributes-configuration-region').toggle(model.get('isChecked'));
                break;
            case 'code':
                this.$('.demo-content__code').toggle(model.get('isChecked'));
                break;
            default:
                break;
        }
    }
});
