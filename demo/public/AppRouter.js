
export default Marionette.AppRouter.extend({
    appRoutes: {
        '': 'index',
        'demo/:sectionId/:groupId/:caseId': 'showCase'
    }
});
