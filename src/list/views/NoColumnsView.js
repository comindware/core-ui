
import { Handlebars } from 'lib';
import template from '../templates/noColumns.hbs';

/**
 * Some description for initializer
 * @name NoColumnsView
 * @memberof module:core.list.views
 * @class NoColumnsView
 * @extends Marionette.View
 * @constructor
 * @description View используемый по умолчанию для отображения списка без колонок
 * */
export default Marionette.View.extend({
    className: 'dev-no-columns-view',
    template: Handlebars.compile(template)
});
