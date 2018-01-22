
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
        Application.headerRegion.$el.show();
        sections.find(s => s.id === sectionId).set('selected', true);

        if (!this.navBarView || !this.demoPageView) {
            this.navBarView = new NavBarView({
                collection: sections,
                collapsed: Core.services.MobileService.isMobile
            });

            this.demoPageView = new DemoPageView({
                activeSectionId: sectionId,
                activeGroupId: groupId,
                activeCaseId: caseId
            });

            Application.headerRegion.show(this.navBarView);

            Application.contentRegion.show(this.demoPageView);
        } else {
            this.demoPageView.reloadView({
                activeSectionId: sectionId,
                activeGroupId: groupId,
                activeCaseId: caseId
            });

            this.navBarView.collection.reset(sections.models);
        }
    }
});
