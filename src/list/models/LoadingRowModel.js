/**
 * Developer: Grigory Kuznetsov
 * Date: 27.07.2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

'use strict';

import 'lib';

/**
 * Some description for initializer
 * @name LoadingRowModel
 * @memberof module:core.list.models
 * @class LoadingRowModel
 * @constructor
 * @description Model строки списка
 * @extends Backbone.Model
 * */
export default Backbone.Model.extend({
    initialize() {
    },

    defaults: {
        isLoadingRowModel: true
    }
});
