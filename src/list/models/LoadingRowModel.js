
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
