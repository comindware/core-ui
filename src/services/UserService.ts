type DataProvider = {
    listUsers: Function,
    listGroups: Function
};

type UserServiceOptions = {
    dataProvider: DataProvider
};

let dataProvider: DataProvider;

/**
 * @name UserService
 * @memberof module:core.services
 * @class User service provides access to information about loaded users (synchronously).
 * @constructor
 * @param {Object} options Options object.
 * @param {Object} options.dataProvider A data provider object that must contain method <code>listUsers()</code>.
 * The method returns an array of objects of the following signature: <code>{ id, name, userName, abbreviation, avatarUrl, url }</code>.
 * For example: <code>{ id: 'user.1', name: 'Jack Crook', userName: 'jcrook', abbreviation: 'JC', avatarUrl: '/avatars?id=user.1', url: '#People/1' }</code>
 * */

export default {
    initialize(options: UserServiceOptions) {
        dataProvider = options.dataProvider;
    },

    listUsers() {
        return dataProvider.listUsers();
    },

    listGroups() {
        return dataProvider.listGroups();
    }
};
