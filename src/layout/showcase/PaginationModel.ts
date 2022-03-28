export default Backbone.Model.extend({
    pagesTotal() {
        if (!isFinite(this.get('recordsPerPage'))) {
            return 1;
        }
        return Math.ceil(this.get('recordsTotal') / this.get('recordsPerPage'));
    }
});
