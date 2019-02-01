export default Backbone.Model.extend({
    parse(data) {
        if (typeof data === 'string') {
            return { name: data, subname: data, id: data };
        }
        return data;
    }
});
