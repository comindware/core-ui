/**
 * Developer: Stepan Burguchev
 * Date: 8/14/2015
 * Copyright: 2009-2015 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* global define, require, Handlebars, Backbone, Marionette, $, _, Localizer */

define([], () => {
    'use strict';

    return {
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
                'Nichole Tran',
                'Roderick Craig',
                'Damon Little',
                'Tommie Cain',
                'Julia Reed',
                'Yvonne Guzman',
                'Amos Herrera',
                'Charlie Osborne',
                'Angel Morrison',
                'Leah Guerrero',
                'Israel Brock',
                'Kerry Miles',
                'Lindsey Huff',
                'Rosa Simon',
                'Marcus Rodriguez',
                'Priscilla Sherman',
                'Marlene Fields',
                'Warren Clark',
                'Andy Lucas',
                'Naomi Cooper',
                'Alfredo Williams',
                'Dexter Harrington',
                'Conrad Jones',
                'Florence Mcguire',
                'Karl Wright',
                'Simon Keller',
                'Milton Norris',
                'Marty Norman',
                'Eddie Fleming',
                'Louise Peters',
                'Jack Goodwin',
                'Bert Wolfe',
                'Donnie Austin',
                'Darnell Mack',
                'Winifred Jenkins',
                'Marilyn Lynch',
                'Lucy Sutton',
                'Joseph Lewis',
                'Randy Bryan',
                'Rufus Higgins',
                'Tiffany Long',
                'Hannah Strickland',
                'Colin Gross',
                'Ira Mendez',
                'Agnes Figueroa',
                'Claudia Cox',
                'Judith Schmidt',
                'Carole Martin',
                'Ramona Snyder',
                'Lindsay Weber',
                'Leslie Sharp',
                'Joel Mccoy',
                'Cecilia Harris',
                'Caleb Cross',
                'Martin Gonzalez',
                'Omar Newton',
                'Harvey Obrien',
                'Todd Nguyen',
                'Dustin Curtis',
                'Ruby Morgan',
                'Mandy Burke',
                'Abraham Bennett',
                'Ramiro Brown',
                'Mildred Watts',
                'Raymond Kelley',
                'Luis Patton',
                'Marsha Soto',
                'Helen Allen',
                'Jessie Willis',
                'James Scott',
                'Franklin Hale',
                'Elmer Alvarez',
                'Marianne Carson',
                'Maxine Brooks',
                'Stephanie Mason',
                'Lee Simmons',
                'Amanda Moody',
                'Becky Henderson',
                'Benny Watkins',
                'Frederick Ellis',
                'Mario Ballard',
                'Misty Townsend',
                'Wilson Thompson',
                'Randolph Mccarthy',
                'Garry Palmer',
                'Spencer Benson',
                'Eduardo Stephens',
                'Alice Moran',
                'Clyde Ortiz',
                'Desiree Stone'
            ];
            return names.map((name, i) => {
                const id = `user.${i + 1}`;
                const nameSplit = name.split(' ');
                return {
                    id,
                    name,
                    userName: (nameSplit[0][0] + nameSplit[1]).toLowerCase(),
                    abbreviation: nameSplit[0][0] + nameSplit[1][0],
                    avatarUrl: `/avatars?id=${id}`,
                    url: `#People/${i + 1}`
                };
            });
        }
    };
});
