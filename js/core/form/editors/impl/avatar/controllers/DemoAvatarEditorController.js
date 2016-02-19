/**
 * Developer: Oleg Verevkin
 * Date: 02/19/2016
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

'use strict';

const defaultOptions = {
    defaultURL: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEgAAABIAQMAAABvIyEEAAAABlBMVEUAAABTU1OoaSf/AAAAAXRSTlMAQObYZgAAAENJREFUeF7tzbEJACEQRNGBLeAasBCza2lLEGx0CxFGG9hBMDDxRy/72O9FMnIFapGylsu1fgoBdkXfUHLrQgdfrlJN1BdYBjQQm3UAAAAASUVORK5CYII='
};

export default Marionette.Object.extend({
    initialize(options) {
        this.options = _.defaults(options, defaultOptions);
    },
    
    upload(file) {
        // Demo request        
        var form = new FormData();
        form.append('file', file);
        
        this.__uploadOperation = Ajax.sendFormData('/dev/null', form).catch(() => {
            console.warn('This promise is just an example to show how to send file');
        });
        
        return Promise.delay(3000, {
            value: '14167968'
            //value: file // file may also be used as upload result
        });
    },
    
    getImage(value) {
        if (_.isUndefined(value)) {
            return this.getOption('defaultURL');
        }
        
        if (_.isString(value)) {
            return `https://avatars.githubusercontent.com/u/${value}`;
        }
        
        if (_.isObject(value) && {}.toString.call(value).slice(8, -1) === 'File') {
            return value;
        }
    }
});