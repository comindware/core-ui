import core from 'coreApi';

export var UserModel = Backbone.Model.extend({});

export var TaskModel = Backbone.Model.extend({
    initialize() {
        _.extend(this, new core.list.models.behaviors.ListItemBehavior(this));
    }
});

export function addChanceMixins(chance) {
    chance.mixin({
        user(predefinedAttributes) {
            return new UserModel({
                id: (predefinedAttributes && predefinedAttributes.id) || _.uniqueId(),
                name: (predefinedAttributes && predefinedAttributes.name) || chance.name()
            });
        }
    });

    const users = _.times(10, () => chance.user());
    const titles = _.times(100, () => chance.sentence({ min: 4, max: 10 }));

    chance.mixin({
        task(predefinedAttributes) {
            return {
                id: (predefinedAttributes && predefinedAttributes.id) || _.uniqueId(),
                title: (predefinedAttributes && predefinedAttributes.title) || titles[chance.integer({ min: 0, max: titles.length - 1 })],
                assignee: (predefinedAttributes && predefinedAttributes.assignee) || users[chance.integer({ min: 0, max: users.length - 1 })]
            };
        }
    });

    return {
        users
    };
}

export var dataProvider = {
    listUsers() {
        const names = [
            'Kerry Torres',
            'Terry Ross',
            'Natasha Becker',
            'Doyle Ball',
            'Teresa Wilkins',
            'Maggie Bowen',
            'Patricia Silva',
            'Carol Crawford',
            'Lillie Thomas',
            'Alfred Allison',
            'Nichole Tran'
        ];
        return names.map((name, i) => {
            const id = `user.${i + 1}`;
            const nameSplit = name.split(' ');
            return {
                id,
                name,
                userName: (nameSplit[0][0] + nameSplit[1]).toLowerCase(),
                abbreviation: nameSplit[0][0] + nameSplit[1][0],
                avatarUrl: null,
                url: `#People/${i + 1}`
            };
        });
    }
};
