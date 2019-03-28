import icons from '../../form/editors/impl/iconEditor/icons';

export default ({ style = 'solid' } = {}) => {
    const iconStyle = {
        solid: 'fas',
        regular: 'far',
        light: 'fal',
        brands: 'fab'
    };

    const getPrefix = iconInfo => (iconInfo.styles.includes('brands') ? iconStyle.brands : iconStyle[style]);

    const prefixes = Object.entries(icons).reduce((prefixe, [ iconName, iconInfo ]) => {
        prefixe[iconName] = getPrefix(iconInfo);

        return prefixe;
    }, {});

    // multiple classes must be declared like 'spinner pulse'
    return iconClass => ` ${prefixes[iconClass] || iconStyle[style]} ${iconClass?.replace(/(^|\s)/g, ' fa-')} `;
};
