import { helpers } from 'utils';

const defaultOptions = {
    defaultURL: '' // 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEgAAABICAYAAABV7bNHAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAYdEVYdFNvZnR3YXJlAHBhaW50Lm5ldCA0LjEuNBNAaMQAAAIiSURBVHhe7Y9BjsMwDAP7x/7/LenFCxvFVJFYsQsYHmAuimKRj+u62twSKqq6JVRUdUuoqOqWUFHVLaGiqltCRVW3hIqqbgkVVd0SKqq6JVRUdUuoqOqWUFHVLaGiqltCRVW3hIqqPp/P61eO+H6oqCoVcTni+6GiqlTE5Yjvh4qqdhXIvJPZaYGKqnaFzryT2WmBiqp2hc68k9lpgYqqdoWuvlPdL0FFVbuCVt+p7pegoqpdQavvVPdLUFHVTNCunZXqfgkqqpoJ2rWzUt0vQUVVM0G7dlaq+yWoqGomaHWn6niiDyqqmgla3ak6nuiDiqpmglZ3qo4n+qCiqtagAda7VFTVGjTAepeKqlqDBljvUlFVa9AA610qqmoNGmC9S0VVrUEDrHepqKo1aID1LhVVtQYNsN6loqrWoAHWu1RU1Ro0wHqXiqpagwZY71JRVWvQAOtdKqpaDbruR471j1R2y1BR1WrQdT9yrH+ksluGiqpWg677kWP9I5XdMlRUNRM0s/PO3T9337+CiqpmgmZ23rn75+77V1BR1UzQzM47d//cff8KKqpqDRpgvUtFVa1BA6x3qaiqNWiA9S4VVbUGDbDepaKq1qAB1rtUVNUaNMB6l4qqrkH/y1GrDyqqSoF/7ajVBxVVpcC/dtTqg4oepzg8TnF4nOLwOMXhcYrD4xSHxykOj1McHqc4PE5xeJzi8DjF4XGKw+MUh8c/r8cLmcFK8y3ZeqMAAAAASUVORK5CYII='
};

/**
 * @name BaseAvatarEditorController
 * @memberof module:core.form.editors.avatar.controllers
 * @class Base data provider class for {@link module:core.form.editors.AvatarEditorView AvatarEditorView}.
 * Methods <code>upload</code> and <code>getImage</code> must be implemented by subclasses.
 * @param {Object} options - Options object.
 * @param {string} options.defaultURL - Default image URL to display when neither image value for <code>getImage</code>
 * method nor full name for {@link module:core.form.editors.AvatarEditorView AvatarEditorView} provided.
 */
export default Marionette.MnObject.extend({
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
     * @return {Promise} - Promise object that resolves with object containing value to be used as
     * {@link module:core.form.editors.AvatarEditorView AvatarEditorView} value.
     * This value will be used as <code>getImage</code> method argument and may be a file.
     */
    upload() {
        helpers.throwError('Not Implemented', 'NotImplementedError');
    },

    /**
     * Converts incoming value to valid Image URL to be displayed in {@link module:core.form.editors.AvatarEditorView AvatarEditorView}.
     * @param {?(string|number|File)} value - Value to be converted to valid image URL. If no value provided, the function must return default image URL.
     * @return {!string} - Image URL to be displayed in {@link module:core.form.editors.AvatarEditorView AvatarEditorView}.
     */
    getImage() {
        helpers.throwError('Not Implemented', 'NotImplementedError');
    }
});
