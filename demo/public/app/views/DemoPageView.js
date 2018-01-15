
import template from 'text-loader!../templates/demoPage.html';
import DemoService from '../DemoService';
import ContentView from './ContentView';

export default Marionette.LayoutView.extend({
    className: 'demo-page',

    template: Handlebars.compile(template),

    regions: {
        groupsRegion: '.js-groups-region',
        contentRegion: '.js-content-region'
    },

    onRender() {
        const groups = DemoService.getGroups(this.options.activeSectionId);
        const activeCase = DemoService.getCase(this.options.activeSectionId, this.options.activeGroupId, this.options.activeCaseId);

        this.groupsRegion.show(new Core.components.NavigationDrawer({
            collection: groups,
            active: activeCase.groupId,
            collapsed: Core.services.MobileService.isMobile
        }));
        this.contentRegion.show(new ContentView({
            model: new Backbone.Model(activeCase)
        }));
    },

    reloadView(state) {
        const { activeSectionId, activeGroupId, activeCaseId } = state;

        const groups = DemoService.getGroups(activeSectionId);
        const activeCase = DemoService.getCase(activeSectionId, activeGroupId, activeCaseId);

        this.groupsRegion.show(new Core.components.NavigationDrawer({
            collection: groups,
            active: activeCase.groupId,
            collapsed: Core.services.MobileService.isMobile
        }));

        this.contentRegion.show(new ContentView({
            model: new Backbone.Model(activeCase)
        }));
    }
});
