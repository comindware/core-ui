/**
 * Developer: Ksenia Kartvelishvili
 * Date: 22.01.2015
 * Copyright: 2009-2015 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

import template from '../templates/context.html';
import ContextSelectEditorView from '../../../ContextSelectEditorView';

export default Marionette.LayoutView.extend({
    template: Handlebars.compile(template),

    regions: {
        contextRegion: '.js-context-selector'
    },

    getValue() {
        return this.contextSelectEditorView.getValue();
    },

    setValue(value) {
        //if (value.type == 'context')
        //    this.contextSelectEditorView.setValue(value.value);
        this.contextSelectEditorView.setValue(value);
    },

    onShow() {
        this.contextSelectEditorView = new ContextSelectEditorView(_.extend(this.options));
        this.contextSelectEditorView.on('change', this.trigger.bind(this, 'change'));

        //var self = this;
        //this.contextSelectEditorView.__applyContext = function(selected) {
        //    this.popoutView.close();
        //    this.__value(selected, false);
        //    self.trigger("change");
        //}.bind(this.contextSelectEditorView);

        this.contextRegion.show(this.contextSelectEditorView);
    }
});
