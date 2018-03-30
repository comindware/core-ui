
import Application from 'Application';
import DemoService from './app/DemoService';
import NavBarView from './app/views/NavBarView';
import IndexPageView from './app/views/IndexPageView';
import DemoPageView from './app/views/DemoPageView';

export default Marionette.Object.extend({
    index() {
        Application.headerRegion.$el.hide();
        Application.contentRegion.show(new IndexPageView({
            collection: new Backbone.Collection(DemoService.getSections())
        }));
    },

    showCase(sectionId, groupId, caseId) {
        const sections = new Backbone.Collection(DemoService.getSections());
        sections.find(s => s.id === sectionId).set('selected', true);
        Application.headerRegion.$el.show();
        const groups = DemoService.getGroups(sectionId);

        if (!this.navBarView || !this.DemoPageView) {
            this.navBarView = new NavBarView({
                collection: sections,
                activeSectionId: sectionId
            });

            this.DemoPageView = new DemoPageView({
                activeSectionId: sectionId,
                activeGroupId: groupId,
                activeCaseId: caseId
            });

            this.drawer = new Core.components.NavigationDrawer({
                collection: groups,
                collapsed: Core.services.MobileService.isMobile,
                isAbsolute: Core.services.MobileService.isMobile,
                title: 'Comindware Core-UI Demo'
            });

            Application.headerRegion.show(this.navBarView);
            Application.contentRegion.show(this.DemoPageView);
            Application.navigationDrawerRegion.show(this.drawer);
        } else {
            this.DemoPageView.reloadView({
                activeSectionId: sectionId,
                activeGroupId: groupId,
                activeCaseId: caseId
            });

            this.drawer.collection.reset(groups);
            this.navBarView.collection.reset(sections.models);
        }
    }
});
