import helpers from 'utils/helpers';

let dataProvider;
let avatarGetter;

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
    initialize(options) {
        dataProvider = options.dataProvider;
        avatarGetter = options.avatarGetter;
    },

    listUsers() {
        return dataProvider.listUsers();
    },

    listGroups() {
        return dataProvider.listGroups();
    },

    getAvatar({ id, name, abbreviation, avatarUrl, size } = {}) {
        const abbr = abbreviation || this.getAbbreviation(name);
        const url = avatarUrl || avatarGetter?.({ id, size });

        if (avatarGetter) {
            return `<img src="${url}" onerror="this.parentNode.innerHTML='${abbr}'"></img>`;
        }
        return abbr;
    },

    getAbbreviation(fullName) {
        if (!fullName) {
            return '';
        }

        const words = fullName.split(/[, _]/);
        switch (words.length) {
            case 0:
                return '';
            case 1:
                return this._getWordAbbreviation(words[0], true);
            default:
                return this._getWordAbbreviation(words[0], words[1].length === 0) + this._getWordAbbreviation(words[1], words[0].length === 0);
        }
    },

    _getWordAbbreviation(word, takeTwo) {
        if (word.length === 0) {
            return '';
        }

        return word.substring(0, word.length > 1 && takeTwo ? 2 : 1);
    }
};
