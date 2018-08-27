import icons from '../../form/editors/impl/iconEditor/icons';

export default (options) => {
    const iconService = options.iconService;
    const style = (iconService && iconService.style) || 'solid';
    
    const iconStyle = {
        solid: 'fas',
        regular: 'far',
        light: 'fal',
        brands: 'fab'
    };

    const getPrefix = iconInfo => iconInfo.styles.includes('brands') ? iconStyle.brands : iconStyle[style];

    const prefixes = Object.entries(icons).reduce((prefixes, iconArray) => {
        const iconName = iconArray[0];
        const iconInfo = iconArray[1];
        prefixes[iconName] = getPrefix(iconInfo)
        return prefixes;
    }, {});

    return iconClass => ` ${prefixes[iconClass] || iconStyle[style]} fa-${iconClass} `;
}
