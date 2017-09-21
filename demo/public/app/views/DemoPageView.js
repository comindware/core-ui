/**
 * Developer: Alexander Makarov
 * Date: 08.07.2015
 * Copyright: 2009-2015 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

import template from 'text-loader!../templates/demoPage.html';
import GroupsView from './GroupsView';
import GroupsCollection from '../collections/GroupsCollection';
import DemoService from '../DemoService';
import ContentView from './ContentView';

export default Marionette.LayoutView.extend({
    className: 'demo-page',

    template: Handlebars.compile(template),

    regions: {
        groupsRegion: '.js-groups-region',
        contentRegion: '.js-content-region'
    },

    onShow() {
        let groups = DemoService.getGroups(this.options.activeSectionId),
            activeCase = DemoService.getCase(this.options.activeSectionId, this.options.activeGroupId, this.options.activeCaseId);

        let groupsCollection = new GroupsCollection(groups),
            activeGroupModel = groupsCollection.findWhere({ id: activeCase.groupId });
        groupsCollection.select(activeGroupModel);

        this.groupsRegion.show(new GroupsView({
            collection: groupsCollection
        }));
        this.contentRegion.show(new ContentView({
            model: new Backbone.Model(activeCase)
        }));
    }
});
