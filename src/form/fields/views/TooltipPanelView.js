/**
 * Developer: Stepan Burguchev
 * Date: 1/26/2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

import 'lib';

export default Marionette.ItemView.extend({
    modelEvents: {
        change: 'onChangeText'
    },

    className: 'form-label__tooltip-panel',

    template: false,

    onRender() {
        this.$el.text(this.model.get(this.options.textAttribute));
    },

    onChangeText() {
        this.$el.text(this.model.get(this.options.textAttribute));
    }
});
