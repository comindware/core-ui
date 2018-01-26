/**
 * Developer: Ksenia Kartvelishvili
 * Date: 12.02.2015
 * Copyright: 2009-2015 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

import template from '../templates/popoutPanelEmpty.html';

export default Marionette.View.extend({
    template: Handlebars.compile(template),

    className: 'popout-panel-empty',

    templateContext() {
        return {
            text: Localizer.get('PROCESS.COMMON.VIEW.GRID.EMPTY')
        };
    }
});
