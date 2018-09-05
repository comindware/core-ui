export default Backbone.Model.extend({
    matchText(text) {
        const name = this.get('name');
        const userName = this.get('userName');
        return (name && name.toLowerCase().indexOf(text) !== -1) || (userName && userName.toLowerCase().indexOf(text) !== -1);
    }
});
