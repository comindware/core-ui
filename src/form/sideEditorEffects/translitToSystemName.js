import systemNameValidator from '../validators/systemNameValidator';
import passToEmptyEditor from './passToEmptyEditor';

const translit = new Map([
    ['А', 'A'],  ['а', 'a'],  ['Б', 'B'],   ['б', 'b'],  ['В', 'V'],   ['в', 'v'],   ['Г', 'G'],  ['г', 'g'],
    ['Д', 'D'],  ['д', 'd'],  ['Е', 'E'],   ['е', 'e'],  ['Ё', 'Yo'],  ['ё', 'yo'],  ['Ж', 'Zh'], ['ж', 'zh'],
    ['З', 'Z'],  ['з', 'z'],  ['И', 'I'],   ['и', 'i'],  ['Й', 'Y'],   ['й', 'y'],   ['К', 'K'],  ['к', 'k'],
    ['Л', 'L'],  ['л', 'l'],  ['М', 'M'],   ['м', 'm'],  ['Н', 'N'],   ['н', 'n'],   ['О', 'O'],  ['о', 'o'],
    ['П', 'P'],  ['п', 'p'],  ['Р', 'R'],   ['р', 'r'],  ['С', 'S'],   ['с', 's'],   ['Т', 'T'],  ['т', 't'],
    ['У', 'U'],  ['у', 'u'],  ['Ф', 'F'],   ['ф', 'f'],  ['Х', 'Kh'],  ['х', 'kh'],  ['Ц', 'Ts'], ['ц', 'ts'],
    ['Ч', 'Ch'], ['ч', 'ch'], ['Ш', 'Sh'],  ['ш', 'sh'], ['Щ', 'Sch'], ['щ', 'sch'], ['Ъ', '"'],  ['ъ', '"'],
    ['Ы', 'Y'],  ['ы', 'y'],  ['Ь', "'"],   ['ь', "'"],  ['Э', 'E'],   ['э', 'e'],   ['Ю', 'Yu'], ['ю', 'yu'],
    ['Я', 'Ya'], ['я', 'ya'], [' ', '_'],   ['Ä', 'A'],  ['ä', 'a'],   ['É', 'E'],   ['é', 'e'],  ['Ö', 'O'],
    ['ö', 'o'],  ['Ü', 'U'],  ['ü', 'u'],   ['ß', 's']
]);

function translite(unfiltredText) {
    if (!unfiltredText) {
        return '';
    }

    const translitToSystemName = Object.create(null);

    translit.forEach((value, key) => {
        const err = systemNameValidator()(value);
        translitToSystemName[key] = err ? '' : value;
    });

    const regText = unfiltredText.replace(/(?=[\W])[^а-яё]/gi, '');
    const arrText = [];
    let i;

    if (!regText) {
        return '';
    }

    for (i = 0; i < regText.length; i++) {
        arrText.push(regText[i]);
    }

    arrText.forEach((char, j) => {
        arrText[j] = char.replace(/[а-яё]/gi, ruChar => translitToSystemName[ruChar] || '');
    });

    for (i = 0; i < arrText.length; i++) {
        if (parseInt(arrText[i])) {
            arrText.splice(i, 1);
            i--;
        } else {
            return arrText.toString().replace(/,/gi, '');
        }
    }
}

export default function(options) {
    options.value = translite(this.getValue());
    passToEmptyEditor.call(this, options);
}
