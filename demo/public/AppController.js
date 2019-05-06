import DemoService from './app/DemoService';
import IndexPageView from './app/views/IndexPageView';
import ContentView from './app/views/ContentView';

export default {
    index() {
        this.contentView.showChildView(
            'contentRegion',
            new IndexPageView({
                collection: new Backbone.Collection(DemoService.getSections())
            })
        );
    },

    showCase(sectionId, groupId, caseId) {
        const sections = new Backbone.Collection(DemoService.getSections());
        sections.find(s => s.id === sectionId).set('selected', true);

        const groups = DemoService.getGroups(sectionId);

        if (!this.DemoPageView) {
            this.demoPageView = new ContentView({
                model: new Backbone.Model(DemoService.getCase(sectionId, groupId, caseId))
            });

            this.drawer = new Core.components.NavigationDrawer({
                collection: groups,
                collapsed: Core.services.MobileService.isMobile,
                isAbsolute: Core.services.MobileService.isMobile,
                title: 'Comindware Core-UI Demo'
            });

            this.contentView.showChildView('contentRegion', this.demoPageView);
            this.contentView.showChildView('navigationDrawerRegion', this.drawer);
        } else {
            this.demoPageView = new ContentView({
                model: new Backbone.Model(DemoService.getCase(sectionId, groupId, caseId))
            });

            this.contentView.showChildView('contentRegion', this.demoPageView);

            this.drawer.collection.reset(groups);
        }
    }
};
