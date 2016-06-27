/**
 * Developer: Stepan Burguchev
 * Date: 6/27/2016
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

"use strict";

import core from 'coreApi';

export var UserModel = Backbone.Model.extend({});

export var TaskModel = Backbone.Model.extend({
    initialize: function () {
        _.extend(this, new core.list.models.behaviors.ListItemBehavior(this));
    }
});

export function addChanceMixins (chance) {
    chance.mixin({
        'user': function (predefinedAttributes) {
            return new UserModel({
                id: (predefinedAttributes && predefinedAttributes.id) || _.uniqueId(),
                name: (predefinedAttributes && predefinedAttributes.name) || chance.name()
            });
        }
    });

    const users = _.times(10, function () { return chance.user(); });
    const titles = _.times(100, function () { return chance.sentence({ min: 4, max: 10 }); });

    chance.mixin({
        'task': function (predefinedAttributes) {
            return {
                id: (predefinedAttributes && predefinedAttributes.id) || _.uniqueId(),
                title: (predefinedAttributes && predefinedAttributes.title) || titles[chance.integer({min: 0, max: titles.length - 1})],
                assignee: (predefinedAttributes && predefinedAttributes.assignee) || users[chance.integer({ min: 0, max: users.length - 1 })]
            };
        }
    });

    return {
        users
    };
}
