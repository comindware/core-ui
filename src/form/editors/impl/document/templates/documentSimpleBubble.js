import meta from '../meta';

export default function(attributes) {
    const icon = meta.getExtIcon(attributes);
    return `<i class="bubble-doc_icon {{iconPrefixer '${icon}'}}"></i><span class="bubble-doc_text">{{name}}</span>`;
}
