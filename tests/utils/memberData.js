export const data = {
    available: [
        { id: 'account.3', type: 'users' }, 
        { id: 'account.4', type: 'users' }
    ],
    selected: [
        { id: 'account.7', type: 'users' },
        { id: 'account.8', type: 'users' },
        { id: 'group.9', type: 'groups' }
    ]
};

export const memberData = {
    filterFnParameters: {
        users: 'users',
        groups: 'groups'
    },
    memberTypes: {
        users: 'users',
        groups: 'groups'
    },

    getMembers: () => new Promise(res => {
        setTimeout(() => res(data), 100);
    })
};

export default {
    data,
    memberData
};
