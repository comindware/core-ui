
import template from 'text-loader!../templates/demoPage.html';
import DemoService from '../DemoService';
import ContentView from './ContentView';

export default Marionette.View.extend({
    className: 'demo-page',

    template: Handlebars.compile(template),

    regions: {
        contentRegion: '.js-content-region'
    },

    onRender() {
        const activeCase = DemoService.getCase(this.options.activeSectionId, this.options.activeGroupId, this.options.activeCaseId);

        this.showChildView('contentRegion', new ContentView({
            model: new Backbone.Model(activeCase)
        }));
    },

    reloadView(state) {
        const { activeSectionId, activeGroupId, activeCaseId } = state;

        const activeCase = DemoService.getCase(activeSectionId, activeGroupId, activeCaseId);

        this.showChildView('contentRegion', new ContentView({
            model: new Backbone.Model(activeCase)
        }));
    }
});
