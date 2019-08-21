import { fileIconClasses } from '../meta';

export default {
    getIconForDocument({ isLoading, name, extension, type } = {} ) {
        if (isLoading) {
            return 'spinner pulse';
        }

        const ext = extension || type || name?.replace(/.*\./g, '');
        let icon;

        if (ext) {
            icon = Object.keys(fileIconClasses).find(key => fileIconClasses[key].includes(ext.toLowerCase()));
        }

        return icon || 'file';
    }
};
