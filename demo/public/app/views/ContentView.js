const requireCode = require.context('babel-loader!../cases', true);
const requireText = require.context('raw-loader!../cases', true);

import template from 'text-loader!../templates/content.html';

export default Marionette.View.extend({
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

        const representationView = code();

        this.showChildView('caseRepresentationRegion', representationView);

        const attributesConfig = this.model.get('attributesConfig');

        if (attributesConfig) {
            this.showChildView('attributesConfigurationRegion', this.__createAttributesConfigurationView(attributesConfig));
        }
    },

    onAttach() {
        const toolbar = new Core.components.Toolbar({
            allItemsCollection: new Backbone.Collection([
                {
                    iconClass: 'plus',
                    id: 'component',
                    name: 'Component',
                    type: 'Checkbox',
                    severity: 'Low',
                    resultType: 'CustomClientAction',
                    context: 'Void'
                },
                {
                    iconType: 'Undefined',
                    id: 'attributes',
                    name: 'Attributes',
                    severity: 'None',
                    defaultTheme: true,
                    type: 'Checkbox'
                },
                {
                    iconType: 'Undefined',
                    id: 'code',
                    name: 'Code',
                    severity: 'None',
                    defaultTheme: true,
                    type: 'Checkbox'
                }
            ])
        });

        let path;
        if (this.model.id) {
            path = `${this.model.get('sectionId')}/${this.model.get('groupId')}/${this.model.id}`;
        } else {
            path = `${this.model.get('sectionId')}/${this.model.get('groupId')}`;
        }

        this.listenTo(toolbar, 'command:execute', model => this.__handleToolbarClick(model));

        this.showChildView('toolbarRegion', toolbar);

        const text = requireText(`./${path}`);

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
    },

    __createAttributesConfigurationView(attributesConfig) {
        const columns = [
            {
                key: 'attribute',
                type: 'String',
                title: 'Attribute',
                sortAsc: Core.utils.helpers.comparatorFor(Core.utils.comparators.stringComparator2Asc, 'textCell'),
                sortDesc: Core.utils.helpers.comparatorFor(Core.utils.comparators.stringComparator2Desc, 'textCell')
            },
            {
                key: 'values',
                type: 'String',
                title: 'Possible values',
                sortAsc: Core.utils.helpers.comparatorFor(Core.utils.comparators.stringComparator2Asc, 'textCell'),
                sortDesc: Core.utils.helpers.comparatorFor(Core.utils.comparators.stringComparator2Desc, 'textCell')
            },
            {
                key: 'default',
                type: 'String',
                title: 'Default value',
                sortAsc: Core.utils.helpers.comparatorFor(Core.utils.comparators.numberComparator2Asc, 'numberCell'),
                sortDesc: Core.utils.helpers.comparatorFor(Core.utils.comparators.numberComparator2Desc, 'numberCell')
            }
        ];

        const gridController = new Core.list.controllers.GridController({
            columns,
            collection: new Backbone.Collection(attributesConfig)
        });

        return gridController.view;
    },

    __handleToolbarClick(model) {
        switch (model.id) {
            case 'component':
                this.$('.js-case-representation-region').toggle();
                break;
            case 'attribute':
                this.$('.js-attributes-configuration-region').toggle();
                break;
            case 'code':
                this.$('.demo-content__code').toggle();
                break;
            default:
                break;
        }
    }
});
