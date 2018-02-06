
import DemoService from './app/DemoService';
import NavBarView from './app/views/NavBarView';
import IndexPageView from './app/views/IndexPageView';
import DemoPageView from './app/views/DemoPageView';

export default Marionette.Object.extend({
    index() {
        window.app.getView().getRegion('headerRegion').$el.hide();
        window.app.getView().showChildView('contentRegion', new IndexPageView({
            collection: new Backbone.Collection(DemoService.getSections())
        }));
    },

    showCase(sectionId, groupId, caseId) {
        const sections = new Backbone.Collection(DemoService.getSections());
        window.app.getView().getRegion('headerRegion').$el.show();

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

            window.app.getView().showChildView('headerRegion', this.navBarView);
            window.app.getView().showChildView('contentRegion', this.demoPageView);
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
