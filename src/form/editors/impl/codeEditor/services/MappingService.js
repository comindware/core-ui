import constants from '../Constants';
import FunctionTooltipView from '../views/FunctionTooltipView';

const types = constants.types;
const classes = constants.classes;
const HTTP_PREFIX = /http:\/\//;

export default {
    mapOntologyModelToAutoCompleteArray(ontologyModel) {
        this.autoCompleteModel = new Backbone.Model();

        const functions1 = ontologyModel.get('functions');
        if (functions1) {
            const functionsArray = [];
            functions1.forEach(func => {
                const item = {};
                const parameters = func.parameters || [];
                item.text = func.name;
                item.returns = func.returns;
                item.description = HTTP_PREFIX.test(func.description) ? Localizer.get('CORE.FORM.EDITORS.CODE.EMPTYDESCRIPTION') : func.description;
                item.className = classes.function;
                item.type = types.function;
                item.hint = (cm, data, completion) => {
                    cm.replaceRange(completion.syntax, data.from, data.to);
                    cm.execCommand('goCharLeft');
                };
                item.syntax = `${item.text}()`;

                parameters.forEach(parameter => {
                    if (HTTP_PREFIX.test(parameter.description)) {
                        parameter.description = Localizer.get('CORE.FORM.EDITORS.CODE.EMPTYDESCRIPTION');
                    }
                });
                const justAdded = functionsArray.find(autoCompleteItem => autoCompleteItem.text === func.name);
                if (justAdded) {
                    justAdded.overloads.push({
                        parameters,
                        text: func.name,
                        returns: func.returns
                    });
                } else {
                    if (!item.overloads) {
                        item.overloads = [];
                    }
                    item.overloads.push({
                        parameters,
                        text: func.name,
                        returns: func.returns
                    });
                    functionsArray.push(item);
                }
            });
            this.autoCompleteModel.set({ functions: functionsArray });
        }

        const users = ontologyModel.get('users');
        if (users) {
            const usersArray = [];
            users.forEach(user => {
                const item = {};
                item.text = user.name;
                item.syntax = user.syntax;
                item.className = classes.user;
                item.type = types.user;
                item.hint = (cm, data, completion) => {
                    cm.replaceRange(completion.syntax, data.from, data.to);
                };
                usersArray.push(item);
            });
            this.autoCompleteModel.set({ users: usersArray });
        }

        const literals = ontologyModel.get('literals');
        if (literals) {
            const literalsArray = [];
            literals.forEach(literal => {
                const item = {};
                item.text = literal.name;
                item.syntax = literal.syntax;
                item.arguments = literal.arguments;
                item.returns = literal.returns;
                item.format = literal.format;
                item.description = literal.description;
                item.className = classes.literal;
                item.type = types.literal;
                item.hint = (cm, data, completion) => {
                    cm.replaceRange(completion.syntax, data.from, data.to);
                    cm.execCommand('goCharLeft');
                };
                literalsArray.push(item);
            });
            this.autoCompleteModel.set({ literals: literalsArray });
        }

        const operators = ontologyModel.get('operators');
        if (operators) {
            const operatorsArray = [];
            operators.forEach(operator => {
                const item = {};
                item.text = operator.name;
                item.syntax = operator.syntax;
                item.arguments = operator.arguments;
                item.description = operator.description;
                item.className = classes.operator;
                item.type = types.operator;
                item.hint = (cm, data, completion) => {
                    cm.replaceRange(completion.syntax, data.from, data.to);
                };
                operatorsArray.push(item);
            });
            this.autoCompleteModel.set({ operators: operatorsArray });
        }

        const attributes = ontologyModel.get('attributes');
        if (attributes) {
            const attributesArray = [];
            attributes.forEach(attribute => {
                const item = {};
                item.text = attribute.alias;
                item.syntax = item.text;
                item.className = classes.attribute;
                item.type = types.attribute;
                item.hint = (cm, data, completion) => {
                    cm.replaceRange(completion.syntax, data.from, data.to);
                };
                attributesArray.push(item);
            });
            this.autoCompleteModel.set({ attributes: attributesArray });
        }

        const templates = ontologyModel.get('templates');
        if (templates) {
            const templatesArray = [];
            templates.forEach(template => {
                const item = {};
                item.text = template.name; //alias, necessary rename this field to the backend
                item.syntax = item.text;
                item.className = classes.template;
                item.type = types.template;
                item.hint = (cm, data, completion) => {
                    cm.replaceRange(completion.syntax, data.from, data.to);
                };
                templatesArray.push(item);
            });
            this.autoCompleteModel.set({ templates: templatesArray });
        }
        return this.autoCompleteModel;
    },

    getTooltipView(type) {
        switch (type) {
            case types.function:
                return FunctionTooltipView;
            default:
                return null;
        }
    }
};
