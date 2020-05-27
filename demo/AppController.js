import DemoService from './app/DemoService';
import ContentView from './app/views/ContentView';

export default {
    showCase() {
        if (!this.isRunned)  {
            setTimeout(() => this.__showCase.apply(this, arguments), 1000);
            this.isRunned = true;
        } else {
            this.__showCase.apply(this, arguments);
        }
    },

    __showCase(sectionId = 'components', groupId = 'FormLayout', caseId) {
        const sections = new Backbone.Collection(DemoService.getSections());
        const defaultSectionId = sectionId || 'components';
        sections.find(s => s.id === defaultSectionId).set('selected', true);

        const groups = DemoService.getGroups(defaultSectionId);

        if (!this.DemoPageView) {
            this.demoPageView = new ContentView({
                model: new Backbone.Model(DemoService.getCase(defaultSectionId, groupId, caseId))
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
                model: new Backbone.Model(DemoService.getCase(defaultSectionId, groupId, caseId))
            });

            this.contentView.showChildView('contentRegion', this.demoPageView);

            this.drawer.collection.reset(groups);
        }
    }
};
