import RootView from './RootView';

const RootViewWithToolbar = Marionette.View.extend({
    initialize() {
        this.toolbarView = new Core.components.Toolbar({
            class: 'tree-editor-toolbar',
            toolbarItems: new Backbone.Collection([
                {
                    iconClass: 'trash-alt',
                    id: 'reset',
                    name: 'Reset',
                    type: 'Action',
                    description: 'Reset'
                },
                {
                    iconClass: 'save',
                    id: 'apply',
                    name: 'Apply',
                    type: 'Action',
                    description: 'Apply'
                }
            ])
        });

        this.listenTo(this.toolbarView, 'command:execute', actionModel => this.options.reqres.request('command:execute', actionModel));
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
