import LocalizationService from '../../services/LocalizationService';

export default function(options) {
    options = {
        type: 'code',
        message: LocalizationService.get('CORE.FORM.VALIDATION.CODE')
    };

    return function code(val: string) {
        const error = {
            type: options.type,
            message: options.message
        };
        let totalCommentsChars = 0;
        const content = val;
        const totalCharsWithoutComments = content
            .replace(/(\/\*[\w\'\s\r\n\*]*\*\/)|(\/\/[^\r\n]*)|(\<![\-\-\s\w\>\/]*\>)/g, '')
            .replace(/\s/g, '')
            .replace(/\r\n/g, '').length;
        const result = val.match(/(\/\*[\w\'\s\r\n\*]*\*\/)|(\/\/[^\r\n]*)|(\<![\-\-\s\w\>\/]*\>)/g);
        if (result) {
            result.forEach(el => {
                let temp = '';
                switch (el.slice(0, 2)) {
                    case '//':
                        temp = el.replace(/\s/g, '');
                        totalCommentsChars += temp.slice(2, temp.length).length;
                        break;
                    case '/*':
                        temp = el.replace(/\s/g, '');
                        totalCommentsChars += temp.slice(2, temp.length - 2).length;
                        break;
                    case '<!':
                        temp = el.replace(/\s/g, '');
                        totalCommentsChars += temp.slice(4, temp.length - 3).length;
                        break;
                }
            });
        }
        if (val) {
            if (totalCharsWithoutComments / totalCommentsChars > 4) {
                return error;
            }
        }
    };
}
