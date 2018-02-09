
import template from '../templates/loadingRow.hbs';

/**
 * Some description for initializer
 * @name LoadingRowView
 * @memberof module:core.list.views
 * @class LoadingRowView
 * @extends Marionette.View
 * @constructor
 * @description View показывает loader при подгрузке контента
 * */
export default Marionette.View.extend({
    className: 'dev-loading-row',

    template: Handlebars.compile(template)
});
