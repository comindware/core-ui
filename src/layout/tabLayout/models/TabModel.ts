export default Backbone.Model.extend({
    defaults: {
        enabled: true,
        visible: true
    },

    isShow(): boolean {
        return this.get('visible') && !this.get('isHidden');
    }
});
