import RootView from './RootView';
import { RootViewFactoryOptions } from '../types';
import { iconNames } from '../meta';

const buttons = [
    {
        iconClass: iconNames.save,
        id: 'apply',
        name: 'Apply',
        type: 'Action',
        description: 'Apply'
    },
    {
        iconClass: iconNames.delete,
        id: 'reset',
        name: 'Reset',
        type: 'Action',
        description: 'Reset'
    }
];

const RootViewWithToolbar = Marionette.View.extend({
    initialize(options: RootViewFactoryOptions) {
        const toolbarItems = new Backbone.Collection(options.showResetButton ? buttons : buttons.filter(button => button.id !== 'reset'));

        this.toolbarView = new Core.components.Toolbar({
            class: 'tree-editor-toolbar',
            toolbarItems
        });

        this.listenTo(this.toolbarView, 'command:execute', (actionModel: Backbone.Model) => this.options.reqres.request('command:execute', actionModel));
    },

    template: Handlebars.compile('<div class="js-toolbar-region"></div><div class="js-root-region"></div>'),

    regions: {
        toolbarRegion: {
            el: '.js-toolbar-region',
            replaceElement: true
        },
        rootRegion: {
            el: '.js-root-region',
            replaceElement: true
        }
    },

    onRender() {
        this.showChildView('toolbarRegion', this.toolbarView);
        this.showChildView('rootRegion', new RootView(this.options));
    }
});

export default RootViewWithToolbar;
