export const fileIconClasses = {
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

export const documentRevisionStatuses = {
    UNDEFINED: 'Undefined',
    PROCESSING: 'Processing',
    REJECTED: 'Rejected'
};

export const embeddedTypes = {
    txt: 'text/plain',
    jpg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    bmp: 'image/bmp',
    zip: 'application/zip',
    rar: 'application/vnd.rar',
    ppt: 'application/vnd.ms-powerpoint',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    pdf: 'application/pdf'
};

export default {
    fileIconClasses,
    savedDocumentPrefix: 'document',
    embeddedTypes,
    graphicFileExtensions,
    videoFileExtensions,
    documentRevisionStatuses
};
