import BaseMembersGridView from './BaseMembersGridView';

export default BaseMembersGridView.extend({
    initialize(options) {
        this.collection = options.membersCollection || options.model.get('selected');
        this.handleSearch = true;
        BaseMembersGridView.prototype.initialize.call(this, options);
    },

    className: 'member-split-grid selected-members'
});
