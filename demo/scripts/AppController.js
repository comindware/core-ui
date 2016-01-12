define(
	['Application', 'comindware/core', './app/CasesConfig', './app/views/NavigationView', './app/views/ModuleView'],
	function(Application, core, casesConfig, NavigationView, ModuleView) {
		'use strict';
		
		function findDefaultGroup(sectionId) {
            var section = _.find(casesConfig.sections, function(section) {
                return sectionId.toLowerCase() === section.id.toLowerCase();
            });
            var defaultGroupId = section.groups[0].id;
            return _.find(section.groups, function(group) {
                return defaultGroupId.toLowerCase() === group.id.toLowerCase();
            });
        }
		
		function getModuleUrlByName(options) {
            var url = 'demo/core/:section/:group/:case';
            var result = [];
            var lastIndex = 0;
            var match;
            var re = /:[^/]+(?=\/|$)/g;
            while (true) {
                match = re.exec(url);
                if (!match) {
                    break;
                }
                result.push(url.substring(lastIndex, match.index));
                var param = match[0].substring(1);
                var opt = options[param];
                if (!opt) {
                    core.utils.helpers.throwFormatError('Missing url options `' + param + '`.');
                }
                result.push(opt);
                lastIndex = match.index + param.length + 1;
            }
            result.push(url.substring(lastIndex));
            var resultUrl = result.join('');
            if (resultUrl[0] !== '#') {
                resultUrl = '#' + resultUrl;
            }
            return resultUrl;
        }
		
		var casesCollection = new Backbone.Collection(_.map(casesConfig.sections, function (section) {
            var group = findDefaultGroup(section.id);
            var url = getModuleUrlByName({
                section: section.id,
                group: group.id,
                case: group.cases ? group.cases[0].id : 'default'
            });
            return _.extend({
                url: url
            }, section);
        }));
		
		return Marionette.Object.extend({
			index: function() {
				Application.contentRegion.show(new NavigationView({
                	collection: casesCollection
            	}));
			},
			showCase: function(sectionId, groupId, caseId) {
				Application.contentRegion.show(new ModuleView({
					activeSectionId: sectionId,
					activeGroupId: groupId,
					activeCaseId: caseId
				}));
			}
		});
	}
);