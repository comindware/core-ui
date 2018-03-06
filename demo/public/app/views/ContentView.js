const requireCode = require.context('babel-loader!../cases', true);
const requireText = require.context('raw-loader!../cases', true);

import template from 'text-loader!../templates/content.html';
import Prism from 'prism';
import markdown from 'markdown';

export default Marionette.LayoutView.extend({
    modelEvents: {
        change: 'render'
    },

    className: 'demo-content_wrapper',

    template: Handlebars.compile(template),

    templateHelpers() {
        return {
            description: markdown.toHTML(this.model.get('description') || '')
        };
    },

    regions: {
        caseRepresentationRegion: '.js-case-representation-region'
    },

    ui: {
        code: '.js-code'
    },

    onRender() {
        Prism.highlightElement(this.ui.code[0]);
    },

    onShow() {
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
        this.caseRepresentationRegion.show(representationView);
    }
});
