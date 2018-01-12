import core from 'comindware/core';

//Get Localized by localization constant
const localizedText = Localizer.get('CORE.DEMO.CASES.OTHER.LOCALIZATIONSERVICE');

//Resolve localized text
const multilangMsg = {
    en: 'Localized text',
    de: 'Lokalisierten Text',
    ru: 'Локализованный текст'
};
const resolvedText = Localizer.resolveLocalizedText(multilangMsg);

//Get localized plural text
//Example: core.utils.helpers.getPluralForm(1, 'car,cars') -> 'car'
//         core.utils.helpers.getPluralForm(10, 'car,cars') -> 'cars'
let single = 1,
    many = 10,
    singularText = `${single} ${core.utils.helpers.getPluralForm(single, 'car,cars')}`,
    pluralText = `${many} ${core.utils.helpers.getPluralForm(many, 'car,cars')}`;

const View = Marionette.ItemView.extend({
    template: Handlebars.compile(`${'<div class="localization__header">Get localized text in JS:</div>' +
        '<div><span class="l-item">Localized Text: </span>'}${localizedText}</div>` +
        `<div><span class="l-item">Resolved Text: </span>${resolvedText}</div>` +
        `<div><span class="l-item">Singular Text: </span>${singularText}</div>` +
        `<div><span class="l-item">Plural Text: </span>${pluralText}</div>` +

        //Get localized text in template
        '<div class="localization__header">Get localized text in template:</div>' +
        '<div><span class="l-item">Localized Text:</span> {{localize "CORE.DEMO.CASES.OTHER.LOCALIZATIONSERVICE"}}</div>' +
        '<div><span class="l-item">Resolved Text:</span> {{localizedText multilangMsg}}</div>'),
    templateHelpers() {
        return {
            multilangMsg
        };
    }
});

export default new View();
