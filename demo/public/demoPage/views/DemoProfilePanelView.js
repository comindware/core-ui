/**
 * Developer: Stepan Burguchev
 * Date: 11/27/2014
 * Copyright: 2009-2014 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

import core from 'comindware/core';
import template from 'text-loader!../templates/demoProfilePanel.html';

export default Marionette.View.extend({
    className: 'nav-profile_test',

    regions: {
        dateEditorRegion: '.js-date-editor-region'
    },

    template: Handlebars.compile(template),

    onRender() {
        this.showChildView('dateEditorRegion', new core.form.editors.DateTimeEditor());
    }
});
