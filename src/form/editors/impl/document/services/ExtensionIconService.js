const fileIconClasses = {
    image: 'jpeg jpg jif jfif png gif tif tiff bmp',
    word: 'docx doc rtf',
    excel: 'xls xlsx xlsm xlsb',
    pdf: 'pdf'
};

export default {
    getIconForDocument(isLoading, extension) {
        if (isLoading) {
            return 'spinner pulse';
        }
        let icon;

        if (extension) {
            Object.keys(fileIconClasses).forEach(key => {
                if (fileIconClasses[key].indexOf(extension.toLowerCase()) !== -1) {
                    icon = key;
                }
            });
        }

        return icon || 'file';
    }
};
