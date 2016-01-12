define(['comindware/core'],
    function (core) {
        'use strict';

        return function () {
            //Get Localized by localization constant
            var localizedText = Localizer.get('CORE.DEMO.CASES.OTHER.LOCALIZATIONSERVICE');

            //Resolve localized text
            var multilangMsg = {
                en: 'Localized text',
                de: 'Lokalisierten Text',
                ru: 'Локализованный текст'
            };
            var resolvedText = Localizer.resolveLocalizedText(multilangMsg);

            //Get localized plural text
            //Example: core.utils.helpers.getPluralForm(1, 'car,cars') -> 'car'
            //         core.utils.helpers.getPluralForm(10, 'car,cars') -> 'cars'
            var single = 1,
                many = 10,
                singularText = single + ' ' + core.utils.helpers.getPluralForm(single, 'car,cars'),
                pluralText = many + ' ' + core.utils.helpers.getPluralForm(many, 'car,cars');

            var View = Marionette.ItemView.extend({
                template: Handlebars.compile('<div class="localization__header">Get localized text in JS:</div>' +
                                             '<div><span class="l-item">Localized Text: </span>' + localizedText + '</div>' +
                                             '<div><span class="l-item">Resolved Text: </span>' + resolvedText + '</div>' +
                                             '<div><span class="l-item">Singular Text: </span>' + singularText + '</div>' +
                                             '<div><span class="l-item">Plural Text: </span>' + pluralText + '</div>' +

                                        //Get localized text in template
                                             '<div class="localization__header">Get localized text in template:</div>' +
                                             '<div><span class="l-item">Localized Text:</span> {{localize "CORE.DEMO.CASES.OTHER.LOCALIZATIONSERVICE"}}</div>' +
                                             '<div><span class="l-item">Resolved Text:</span> {{localizedText multilangMsg}}</div>'),
                templateHelpers: function () {
                    return {
                        multilangMsg: multilangMsg
                    };
                }
            });

            return new View();
        }
    });
