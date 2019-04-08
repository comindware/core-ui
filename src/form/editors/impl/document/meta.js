const cutOffTo = (string, toStr) => (string?.includes(toStr) ? string.slice(0, string.indexOf(toStr)) : '');

const getExtensionFromName = name => cutOffTo(name, '.');

const fileIconClasses = {
    image: 'jpeg jpg jif jfif png gif tif tiff bmp',
    'file-word': 'docx doc rtf',
    'file-excel': 'xls xlsx xlsm xlsb',
    'file-pdf': 'pdf'
};

export const graphicFileExtensions = ['gif', 'png', 'bmp', 'jpg', 'jpeg', 'jfif', 'jpeg2000', 'exif', 'tiff', 'ppm', 'pgm', 'pbm', 'pnm', 'webp', 'bpg', 'bat'];
export const videoFileExtensions = [
    '3g2',
    '3gp',
    'amv',
    'asf',
    'avi',
    'drc',
    'flv',
    'flv',
    'f4v',
    'f4p',
    'f4a',
    'f4b',
    'gif',
    'gifv',
    'm4v',
    'mkv',
    'mng',
    'mov',
    'qt',
    'mp4',
    'm4p',
    'm4v',
    'mpg',
    'mp2',
    'mpeg',
    'mpe',
    'mpv',
    'mpg',
    'mpeg',
    'm2v',
    'MTS',
    'M2TS',
    'mxf',
    'nsv',
    'ogv',
    'ogg',
    'rm',
    'rmvb',
    'roq',
    'svi',
    'vob',
    'webm',
    'wmv',
    'yuv'
];

export default {
    fileIconClasses,

    getExtIcon({ isLoading, name, extension, type }) {
        if (isLoading) {
            return 'spinner pulse';
        }

        const ext = extension || type || getExtensionFromName(name);
        let icon;

        if (ext) {
            icon = Object.keys(fileIconClasses).find(key => fileIconClasses[key] === ext.toLowerCase());
        }

        return icon || 'file';
    },

    savedDocumentPrefix: 'document'
};
