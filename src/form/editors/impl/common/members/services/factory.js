
import MembersCollection from '../collections/MembersCollection';
import MembersListView from '../views/MembersListView';
import UserService from 'services/UserService';
import 'lib';
import 'utils';

export default {
    createMembersCollection() {
        const membersCollection = new MembersCollection();
        membersCollection.reset(UserService.listUsers());
        return membersCollection;
    },

    createMembersListView(options) {
        return new MembersListView(options);
    },

    getMembersListView() {
        return MembersListView;
    }
};
