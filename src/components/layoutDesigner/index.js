/**
 * A class to represent Layout editor.
 * @class
 *
 * @constructor
 *
 * @property editorModel - main model - pass here all needed params for editor
 * * @type {Backbone.Model}
 *
 * @property palette - configuration, representing the left tab of editor
 * * @type {object}
 * * @property elementsCollection
 * * * @type {Backbone.Collection}
 * * @property collection
 * * * @type {Backbone.Collection}
 * * @property size
 * * * @type {string}
 * * @property toolbar
 * * * @type {object}
 * * * @property actions
 * * * * @type {Backbone.Collection}
 *
 * @property canvas - configuration, representing the central part of editor
 * * @type {object}
 * * @property collection
 * * * @type {Backbone.Collection}
 * * @property components
 * * * @type {object}
 * * @property hideEmptyView
 * * * @type {boolean}
 * * @property focusOnShow
 * * * @type {boolean}
 *
 * @property properties - configuration, representing the right tab of editor
 * * @type {object}
 * * @property components
 * * * @type {object}
 * * @property size
 * * * @type {string}
 *
 * @property toolbar - configuration, representing the main visual editor's toolbar
 * * @type {object}
 * * @property excludeActions
 * * * @type {array}
 *
 * @property configurationKey - edification information for storing module specific information
 * * @type {string}
 */

import Controller from './controllers/VisualEditorController';

export default {
    Controller
};
/**
 * @example
 this.layoutDesigner = new VisualEditor.Controller({
    editorModel: new Backbone.Model(),
    palette: {
        collection: new Backbone.Collection()
        elementsCollection: new Backbone.Collection(),
        size: 'small'
    },
    canvas: {
        collection: new Backbone.Collection(),
        components: {
            Rule: {
                view: new Marionette.View(),
                model:  new Backbone.Model()
            },
            SystemView: new Marionette.View()
        }
    },
    properties: {
        components: {
            Rule: RuleActionsPropertiesView,
            SystemView: new Backbone.Model()
        },
        size: 'large'
    },
    toolbar: {
        excludeActions: ['saveAs']
    },
    configurationKey: ModuleService.modules.PROCESS_RECORDTYPES_FORM_RULES
});
*/
