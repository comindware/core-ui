/*eslint-ignore*/

import core from 'coreApi';
import 'jasmine-jquery';

describe('Editors', () => {
    describe('Mention editor', () => {
        it('should be initialized', () => {
            const model = new Backbone.Model({
                //avatar: '14167968',
                fullName: 'Foo Bar'
            });

            const view = new core.form.editors.MentionEditor({
                model,
                key: 'avatar',
                autocommit: true,
                fullName: model.get('fullName'),
                autoUpload: true, // or use method 'upload' instead
                refreshPreviewAfterUpload: true,
                controller: new core.form.editors.avatar.controllers.DemoAvatarEditorController({
                    defaultURL: '/resources/images/defaultAvatar.png'
                })
            });
            window.app
                .getView()
                .getRegion('contentRegion')
                .show(view);

            expect(true).toEqual(true);
        });
    });
});
