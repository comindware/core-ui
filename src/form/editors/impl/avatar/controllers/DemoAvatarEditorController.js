/**
 * Developer: Oleg Verevkin
 * Date: 02/19/2016
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

'use strict';

import BaseAvatarEditorController from './BaseAvatarEditorController'

export default BaseAvatarEditorController.extend({
    upload(file) {
        // Demo request        
        var form = new FormData();
        form.append('file', file);
        
        this.__uploadOperation = Ajax.sendFormData('/dev/null', form).catch(() => {
            console.warn('This promise is just an example to show how to send file');
        });
        
        return Promise.delay(1000, {
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