import { documentRevisionStatuses, fileIconClasses } from '../meta';

export default {
    getIconForDocument({ isLoading, name, extension, type, status } = {}) {
        if (status === documentRevisionStatuses.REJECTED) {
            return 'exclamation-circle';
        }
        if (status === documentRevisionStatuses.PROCESSING) {
            return 'history';
        }
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
