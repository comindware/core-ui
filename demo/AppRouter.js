export default Marionette.AppRouter.extend({
    appRoutes: {
        '': 'showCase',
        ':sectionId/:groupId/:caseId': 'showCase'
    }
});
