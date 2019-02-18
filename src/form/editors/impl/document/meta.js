const cutOffTo = (string, toStr) => 
    (string?.includes(toStr) ?
    string.slice(0, string.indexOf(toStr)) :
    '');

const getExtensionFromName = name => cutOffTo(name, '.');

const fileIconClasses = {
    image: 'jpeg jpg jif jfif png gif tif tiff bmp',
    'file-word': 'docx doc rtf',
    'file-excel': 'xls xlsx xlsm xlsb',
    'file-pdf': 'pdf'
};

export default {
    fileIconClasses,

    getExtIcon({ isLoading, name, extension, type }) {
        if (isLoading) {
            return 'spinner pulse';
        }

        const ext = extension ||
                    type ||
                    getExtensionFromName(name);
        let icon;

        if (ext) {
            icon = Object.keys(fileIconClasses).find(key =>
                fileIconClasses[key].includes(ext.toLowerCase())
            );
        }

        return icon || 'file';
    },

    savedDocumentPrefix: 'document'
};
