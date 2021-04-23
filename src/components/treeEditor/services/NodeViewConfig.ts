const requiredIconClass = 'lock';
const requiredClassName = 'editor_readonly';

const getConfig = (template: string, className: string) => ({
    template: Handlebars.compile(template),

    className() {
        return `${className} ${this.model.get('required') ? requiredClassName : ''}`;
    },

    id() {
        return _.uniqueId('treeEditor_');
    },

    __getNodeName() {
        return typeof this.options.getNodeName === 'function' ? this.options.getNodeName(this.model) : this.model.get('name') || '';
    },

    __getIconClass(isHidden = this.model.get('isHidden')) {
        if (this.model.get('required')) {
            return requiredIconClass;
        }

        return isHidden ? this.options.closedEyeIconClass : this.options.eyeIconClass;
    }
});

export default getConfig;
