//@flow
export default Backbone.Model.extend({
    getChildren() {
        return this.get(this.get('childrenAttribute'));
    },

    getParent() {
        if (!this.collection) {
            return null;
        }
        return this.collection.parent;
    },

    selected: false,
    isContainer: false,
    hovered: false,

    hover() {
        this.hovered = true;
        this.trigger('hovered');
    },

    unhover() {
        this.hovered = false;
        this.trigger('unhovered');
    },

    select() {
        this.selected = true;
        this.trigger('selected');
    },

    deselect() {
        this.selected = false;
        this.trigger('deselected');
    }
});
