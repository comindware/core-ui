import DemoService from './app/DemoService';
import NavBarView from './app/views/NavBarView';
import IndexPageView from './app/views/IndexPageView';
import DemoPageView from './app/views/DemoPageView';

export default Marionette.Object.extend({
    index() {
        window.app
            .getView()
            .getRegion('headerRegion')
            .$el.hide();
        window.app.getView().showChildView(
            'contentRegion',
            new IndexPageView({
                collection: new Backbone.Collection(DemoService.getSections())
            })
        );
    },

    showCase(sectionId, groupId, caseId) {
        const sections = new Backbone.Collection(DemoService.getSections());
        sections.find(s => s.id === sectionId).set('selected', true);
        window.app
            .getView()
            .getRegion('headerRegion')
            .$el.show();
        const groups = DemoService.getGroups(sectionId);

        if (!this.navBarView || !this.DemoPageView) {
            this.navBarView = new NavBarView({
                collection: sections,
                activeSectionId: sectionId
            });

            this.demoPageView = new DemoPageView({
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

            window.app.getView().showChildView('headerRegion', this.navBarView);
            window.app.getView().showChildView('contentRegion', this.demoPageView);
            window.app.getView().showChildView('navigationDrawerRegion', this.drawer);
        } else {
            this.demoPageView.reloadView({
                activeSectionId: sectionId,
                activeGroupId: groupId,
                activeCaseId: caseId
            });

            this.drawer.collection.reset(groups);
            this.navBarView.collection.reset(sections.models);
        }
    }
});
