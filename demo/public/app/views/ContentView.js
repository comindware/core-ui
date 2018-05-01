const requireCode = require.context('babel-loader!../cases', true);
const requireText = require.context('raw-loader!../cases', true);

import template from 'text-loader!../templates/content.html';
import Prism from 'prism';
import markdown from 'markdown';

export default Marionette.View.extend({
    className: 'demo-content_wrapper',

    template: Handlebars.compile(template),

    templateContext() {
        return {
            description: markdown.toHTML(this.model.get('description') || '')
        };
    },

    regions: {
        caseRepresentationRegion: '.js-case-representation-region',
        attributesConfigurationRegion: '.js-attributes-configuration-region'
    },

    ui: {
        code: '.js-code'
    },

    onRender() {
        Prism.highlightElement(this.ui.code[0]);
        let path;
        if (this.model.id) {
            path = `${this.model.get('sectionId')}/${this.model.get('groupId')}/${this.model.id}`;
        } else {
            path = `${this.model.get('sectionId')}/${this.model.get('groupId')}`;
        }

        const code = requireCode(`./${path}`).default;
        const text = requireText(`./${path}`);

        this.model.set('sourceCode', text);
        const representationView = code();
        this.showChildView('caseRepresentationRegion', representationView);

        const attributesConfig = this.model.get('attributesConfig');

        if (attributesConfig) {
            this.showChildViewv('attributesConfigurationRegion', this.__createAttributesConfigurationView(attributesConfig));
        }
    },

    __createAttributesConfigurationView() {
        const columns = [
            {
                key: 'textCell',
                type: 'Text',
                title: 'TextCell',
                required: true,
                viewModel: new Backbone.Model({ displayText: 'TextCell' }),
                sortAsc: core.utils.helpers.comparatorFor(core.utils.comparators.stringComparator2Asc, 'textCell'),
                sortDesc: core.utils.helpers.comparatorFor(core.utils.comparators.stringComparator2Desc, 'textCell'),
                sorting: 'asc'
            },
            {
                key: 'numberCell',
                type: 'Number',
                title: 'Number Cell',
                getReadonly: model => model.get('numberCell') % 2,
                viewModel: new Backbone.Model({ displayText: 'Number Cell' }),
                sortAsc: core.utils.helpers.comparatorFor(core.utils.comparators.numberComparator2Asc, 'numberCell'),
                sortDesc: core.utils.helpers.comparatorFor(core.utils.comparators.numberComparator2Desc, 'numberCell')
            }
        ];

        return new core.editableGrid.views.EditableGridView({
            columns,
            selectableBehavior: 'multi',
            collection: new Backbone.Collection([]),
            title: 'Attributes configuration',
            showSearch: true,
            searchColumns: ['textCell']
        });
    }
});
