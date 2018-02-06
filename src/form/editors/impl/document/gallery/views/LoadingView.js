/**
 * Developer: Ksenia Kartvelishvili
 * Date: 8/25/2017
 * Copyright: 2009-2017 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

import template from '../templates/loading.html';

export default Marionette.ItemView.extend({

    template: Handlebars.compile(template),

    className: 'l-loader'
});
