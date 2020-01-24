import defaultIconsMeta from '../../form/editors/impl/iconEditor/icons.json';

type options = {
    iconsMeta: any
};

export default ({ iconsMeta = defaultIconsMeta }: options = { iconsMeta }): Function => {
    const getIconUnicode = (iconName: string): string => {
        const icon = iconsMeta[iconName];
        if (!icon) {
            console.warn(`iconsMeta has no '${iconName}' icon`);
            return '';
        }
        return `&#x${icon.unicode};`;
    };
    const getIconsUnicodes = (iconNames: string): string =>
        iconNames
            .split(' ')
            .map(getIconUnicode)
            .join(' ');

    return getIconsUnicodes;
};
