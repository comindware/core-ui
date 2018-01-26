/**
 * Developer: Stepan Burguchev
 * Date: 8/20/2015
 * Copyright: 2009-2015 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

export default Marionette.View.extend({
    modelEvents: {
        change: 'render'
    },
    template: false
});
