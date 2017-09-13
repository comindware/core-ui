/**
 * Developer: Stepan Burguchev
 * Date: 6/14/2016
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

const context = require.context('./specs', true, /.+\.spec\.jsx?$/);
context.keys().forEach(context);
export default context;
