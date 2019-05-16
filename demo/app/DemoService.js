import config from './DemoConfig';

function findDefaultGroup(sectionId) {
    const section = config.sections.find(section => sectionId.toLowerCase() === section.id.toLowerCase());
    const defaultGroupId = section.groups[0].id;

    return section.groups.find(group => defaultGroupId.toLowerCase() === group.id.toLowerCase());
}

export default {
    getModuleUrlByName(options) {
        return `#${options.section}/${options.group}/${options.case}`;
    },

    getSections() {
        return config.sections.map(section => {
            const group = findDefaultGroup(section.id);
            const url = this.getModuleUrlByName({
                section: section.id,
                group: group.id,
                case: group.cases ? group.cases[0].id : 'default'
            });
            return {
                id: section.id,
                displayName: section.displayName,
                url
            };
        });
    },

    getGroups(sectionId) {
        const section = config.sections.find(s => s.id.toLowerCase() === sectionId.toLowerCase());

        return section.groups.map(group => {
            const url = this.getModuleUrlByName({
                section: section.id,
                group: group.id,
                case: group.cases ? group.cases[0].id : 'default'
            });
            return {
                id: group.id,
                displayName: group.displayName,
                url
            };
        });
    },

    getCases(sectionId, groupId) {
        const section = config.sections.find(s => s.id === sectionId);
        const group = section.groups.find(g => g.id.toLowerCase() === groupId.toLowerCase());

        return (
            group.cases &&
            group.cases.map(c => {
                const url = this.getModuleUrlByName({
                    section: sectionId,
                    group: groupId,
                    case: c.id
                });
                return {
                    id: c.id,
                    displayName: c.displayName,
                    description: c.description,
                    url,
                    sectionId,
                    groupId
                };
            })
        );
    },

    getCase(sectionId, groupId, caseId) {
        const cases = this.getCases(sectionId, groupId);
        if (cases) {
            const activeCase = cases.find(c => c.id.toLowerCase() === caseId.toLowerCase());
            if (activeCase) {
                return activeCase;
            }
        }

        const activeSection = config.sections.find(section => section.id === sectionId);
        const activeGroup = activeSection.groups.find(group => group.id.toLowerCase() === groupId.toLowerCase());
        const url = this.getModuleUrlByName({
            section: sectionId,
            group: groupId,
            case: 'default'
        });
        return {
            id: null,
            displayName: activeGroup.displayName,
            description: activeGroup.description,
            url,
            sectionId,
            groupId,
            attributesConfig: activeGroup.attributesConfig
        };
    }
};
