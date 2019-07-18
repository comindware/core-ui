export const iconNames = {
    collapse: 'chevron-right',
    expand: 'chevron-down'
};

export const getIconAndPrefixerClasses = (classWithoutPrefixer: string) => {
    const iconClass = Handlebars.helpers.iconPrefixer(classWithoutPrefixer);
    return iconClass.split(' ').filter((className: string) => className);
};

export const setModelHiddenAttribute = (model, isHidden?: boolean) => {
    if (model.get('required')) {
        return;
    }

    const newIsHidden = isHidden == null ? !model.get('isHidden') : isHidden;

    model.set('isHidden', newIsHidden);
};

export default {
    iconNames,
    getIconAndPrefixerClasses,
    setModelHiddenAttribute
};
