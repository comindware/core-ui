/**
 * Developer: Ksenia Kartvelishvili
 * Date: 24.02.2015
 * Copyright: 2009-2015 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

import template from '../templates/popoutButton.html';

const classes = {
    EMPTY: 'dev-context-editor__empty'
};

export default Marionette.View.extend({

    tagName: 'span',

    className: 'source-text',

    template: Handlebars.compile(template),

    templateContext() {
        const value = this.model.get('value');
        return {
            buttonText: value || Localizer.get('WIDGETS.WTABLE.EMPTYVALUE')
        };
    },

    modelEvents: {
        'change:value': 'render'
    },

    onRender() {
        this.$el.toggleClass(classes.EMPTY, !this.model.get('value'));
    }
});
