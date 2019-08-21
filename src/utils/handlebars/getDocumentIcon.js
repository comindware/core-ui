import ExtensionIconService from '../../form/editors/impl/document/services/ExtensionIconService';

export default iconPrefixer => context => {
    const icon = ExtensionIconService.getIconForDocument(context?.data?.root);
    return iconPrefixer(icon);
};
