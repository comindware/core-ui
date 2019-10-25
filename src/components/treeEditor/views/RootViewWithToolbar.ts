import RootView from './RootView';
import { RootViewFactoryOptions } from '../types';
import { iconNames } from '../meta';

const RootViewWithToolbar = Marionette.View.extend({
    initialize(options: RootViewFactoryOptions) {
        const buttons = this.__getButtons();
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
    },

    __getButtons() {
        return [
            {
                iconClass: iconNames.save,
                id: 'apply',
                name: Localizer.get('CORE.TOOLBAR.TREEEDITOR.APPLY'),
                type: 'Action',
                description: Localizer.get('CORE.TOOLBAR.TREEEDITOR.APPLY')
            },
            {
                iconClass: iconNames.delete,
                id: 'reset',
                name: Localizer.get('CORE.TOOLBAR.TREEEDITOR.RESET'),
                type: 'Action',
                description: Localizer.get('CORE.TOOLBAR.TREEEDITOR.RESET')
            }
        ];
    }
});

export default RootViewWithToolbar;
