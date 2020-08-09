import constants from '../Constants';
import FunctionTooltipView from '../views/FunctionTooltipView';

const types = constants.types;
const classes = constants.classes;
const HTTP_PREFIX = /http:\/\//;

export default {
    __getMappedFunctions(array) {
        if (array) {
            const functions = array;
            const functionsArray = [];
            functions.forEach(func => {
                const item = {};
                const parameters = func.parameters || [];
                item.text = func.name;
                item.returns = func.returns;
                item.description = HTTP_PREFIX.test(func.description) ? Localizer.get('CORE.FORM.EDITORS.CODE.EMPTYDESCRIPTION') : func.description;
                item.className = classes.function;
                item.icons = func.icons;
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
            return functionsArray;
        }
    },

    __getMappedUsers(users) {
        if (users) {
            const usersArray = [];
            users.forEach(user => {
                const item = {};
                item.text = user.name;
                item.syntax = user.syntax;
                item.icons = user.icons;
                item.className = classes.user;
                item.type = types.user;
                item.hint = (cm, data, completion) => {
                    cm.replaceRange(completion.syntax, data.from, data.to);
                };
                usersArray.push(item);
            });
            return usersArray;
        }
    },

    __getMappedLiterals(literals) {
        if (literals) {
            const literalsArray = [];
            literals.forEach(literal => {
                const item = {};
                const text = literal.name;
                item.text = literal.IsWrapQuots ? `"${text}"` : text;
                item.syntax = literal.syntax;
                item.icons = literal.icons;
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
            return literalsArray;
        }
    },

    __getMappedOperators(operators) {
        if (operators) {
            const operatorsArray = [];
            operators.forEach(operator => {
                const item = {};
                const text = operator.name;
                item.text = operator.IsWrapQuots ? `"${text}"` : text;
                item.syntax = operator.syntax;
                item.arguments = operator.arguments;
                item.icons = operator.icons;
                item.description = operator.description;
                item.className = classes.operator;
                item.type = types.operator;
                item.hint = (cm, data, completion) => {
                    cm.replaceRange(completion.syntax, data.from, data.to);
                };
                operatorsArray.push(item);
            });
            return operatorsArray;
        }
    },

    __getMappedAttributes(attributes) {
        if (attributes) {
            const attributesArray = [];
            attributes.forEach(attribute => {
                const item = {};
                const text = attribute.alias;
                item.text = attribute.IsWrapQuots ? `"${text}"` : text;
                item.syntax = item.text;
                item.icons = Core.meta.contextIconType[attribute.type.toLowerCase()];
                item.className = classes.attribute;
                item.type = attribute.type || types.attribute;
                item.hint = (cm, data, completion) => {
                    cm.replaceRange(completion.syntax, data.from, data.to);
                };
                attributesArray.push(item);
            });
            return attributesArray;
        }
    },

    __getMappedTemplates(templates) {
        if (templates) {
            const templatesArray = [];
            templates.forEach(template => {
                const item = {};
                const text = template.text || template.name;
                item.text = template.IsWrapQuots ? `"${text}"` : text;
                item.displayText = text;
                item.syntax = item.text;
                item.icons = Core.meta.contextIconType[template.type.toLowerCase()] || template.icons;
                item.className = classes.template;
                item.type = types.template;
                item.hint = (cm, data, completion) => {
                    cm.replaceRange(completion.syntax, data.from, data.to);
                };
                templatesArray.push(item);
            });
            return templatesArray;
        }
    },

    mapOntologyArrayToAutoCompleteArray(array, type) {
        let mappedArray = [];
        switch (type) {
            case constants.autoCompleteContext.functions:
                mappedArray = this.__getMappedFunctions(array);
                break;
            case constants.autoCompleteContext.users:
                mappedArray = this.__getMappedUsers(array);
                break;
            case constants.autoCompleteContext.literals:
                mappedArray = this.__getMappedLiterals(array);
                break;
            case constants.autoCompleteContext.operators:
                mappedArray = this.__getMappedOperators(array);
                break;
            case constants.autoCompleteContext.attributes:
                mappedArray = this.__getMappedAttributes(array);
                break;
            case constants.autoCompleteContext.templates:
                mappedArray = this.__getMappedTemplates(array);
                break;
            default:
                mappedArray = [];
        }

        return mappedArray;
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
