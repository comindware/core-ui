/**
 * Developer: Kristina
 * Date: 24/12/2014
 * Copyright: 2009-2014 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* Useful and general methods for work with Date and Time put here*/

define([],
    function () {
        'use strict';

        var defaultOptions = {
            ms: 60 * 1000,
            workHours: 8
        };

        /*
        * TODO: fix me! method signatures are inconsistent (!), method names are hard to understand. Create separate DURATION type.
        * */
        return {
            dateToServerFormat: function(date){
                return moment(date).format('YYYY-MM-DDTHH:mm:ss');
            },

            serverTimestampToStr: function(milliseconds) {
                var seconds = milliseconds / 1000,
                    hours = parseInt(seconds/ (60*60)),
                    minutes = 60 * (seconds/ (60*60) - hours);

                return (hours ? hours + 'h' : '') +
                         (minutes ? minutes + 'm' : '');
            },

            parseServerDuration: function(duration){
                if (!duration) return [0,0,0];
                var tDuration = duration.replace("P", '').replace('T', '');
                var tDays = parseInt( tDuration.substring(0, tDuration.indexOf('D')) ) || 0;
                tDuration = tDuration.substring( tDuration.indexOf('D') + 1 );
                var tHours =  parseInt( tDuration.substring(0, tDuration.indexOf('H')) ) || 0;
                tDuration = tDuration.substring( tDuration.indexOf('H') + 1 );
                var tMinutes =  parseInt( tDuration.substring(0, tDuration.indexOf('M')) ) || 0;
                return [tDays, tHours, tMinutes];
            },

            durationToServerFormat:  function(duration){
                var serverFormat = "P";
                if (duration.days)
                    serverFormat += duration.days + 'D';
                if(duration.hours || duration.minutes)
                    serverFormat += 'T';
                if (duration.hours)
                    serverFormat += duration.hours + 'H';
                if (duration.minutes)
                    serverFormat += duration.minutes + 'M';
                return serverFormat;
            },

            timestampToObjTakingWorkHours: function (value) {
                if (value !== null) {
                    var v = value || 0;
                    v = v / defaultOptions.ms;
                    return {
                        days: Math.floor(v / 60 / defaultOptions.workHours),
                        hours: Math.floor((v / 60) % defaultOptions.workHours),
                        minutes: Math.floor(v % 60)
                    };
                }
            },

            objToTimestampTakingWorkHours: function (object) {
                return object ? (object.days * 60 * defaultOptions.workHours + object.hours * 60 + object.minutes) * defaultOptions.ms : object === 0 ? 0 : null;
            }
        };
    });