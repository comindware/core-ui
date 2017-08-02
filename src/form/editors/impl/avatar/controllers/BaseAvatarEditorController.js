/**
 * Developer: Oleg Verevkin
 * Date: 02/20/2016
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

'use strict';

import { helpers } from 'utils';

const defaultOptions = {
    defaultURL: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEgAAABIAQMAAABvIyEEAAAABlBMVEUAAABTU1OoaSf/AAAAAXRSTlMAQObYZgAAAENJREFUeF7tzbEJACEQRNGBLeAasBCza2lLEGx0CxFGG9hBMDDxRy/72O9FMnIFapGylsu1fgoBdkXfUHLrQgdfrlJN1BdYBjQQm3UAAAAASUVORK5CYII='
};

/**
 * @name BaseAvatarEditorController
 * @memberof module:core.form.editors.avatar.controllers
 * @class Base data provider class for {@link module:core.form.editors.AvatarEditorView AvatarEditorView}.
 * Methods <code>upload</code> and <code>getImage</code> must be implemented by subclasses.
 * @param {Object} options - Options object.
 * @param {string} options.defaultURL - Default image URL to display when neither image value for <code>getImage</code> method nor full name for {@link module:core.form.editors.AvatarEditorView AvatarEditorView} provided.
 */
export default Marionette.Object.extend({
    /**
     * Object containing default options to be used when no corresponding options are provided while instantiating controller
     */
    defaultOptions,
    
    initialize(options) {
        this.options = _.defaults(options, this.defaultOptions);
    },
    
    /**
     * Uploads file to server or processes it any other way.
     * @param {File} file - File to be processed (uploaded to server).
     * @return {Promise} - Promise object that resolves with object containing value to be used as {@link module:core.form.editors.AvatarEditorView AvatarEditorView} value.
     * This value will be used as <code>getImage</code> method argument and may be a file.
     */
    upload(file) {
        helpers.throwError('Not Implemented', 'NotImplementedError');
    },
    
    /**
     * Converts incoming value to valid Image URL to be displayed in {@link module:core.form.editors.AvatarEditorView AvatarEditorView}.
     * @param {?(string|number|File)} value - Value to be converted to valid image URL. If no value provided, the function must return default image URL.
     * @return {!string} - Image URL to be displayed in {@link module:core.form.editors.AvatarEditorView AvatarEditorView}.
     */
    getImage(value) {
        helpers.throwError('Not Implemented', 'NotImplementedError');
    }
});
