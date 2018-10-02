import icons from '../../form/editors/impl/iconEditor/icons';

export default options => {
    const iconService = options.iconService;
    const style = (iconService && iconService.style) || 'solid';

    const iconStyle = {
        solid: 'fas',
        regular: 'far',
        light: 'fal',
        brands: 'fab'
    };

    const getPrefix = iconInfo => (iconInfo.styles.includes('brands') ? iconStyle.brands : iconStyle[style]);

    const prefixes = Object.entries(icons).reduce((prefixe, iconArray) => {
        const iconName = iconArray[0];
        const iconInfo = iconArray[1];
        prefixe[iconName] = getPrefix(iconInfo);

        return prefixe;
    }, {});

    return iconClass => ` ${prefixes[iconClass] || iconStyle[style]} fa-${iconClass} `;
};
