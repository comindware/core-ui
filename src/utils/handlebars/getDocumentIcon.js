import meta from '../../form/editors/impl/document/meta';

export default iconPrefixer => context => {
    const icon = meta.getExtIcon(context?.data?.root);
    return iconPrefixer(icon);
};
