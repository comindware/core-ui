/**
 * Developer: Oleg Verevkin
 * Date: 02/18/2016
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

define(
    [
        'comindware/core',
        'demoPage/views/EditorCanvasView'
    ],
    function(core, EditorCanvasView) {
        'use strict';
        
        return function() {
            var model = new Backbone.Model({
                //avatar: '14167968',
                fullName: 'Foo Bar'
            });

            return new EditorCanvasView({
                editor: new core.form.editors.AvatarEditor({
                    model: model,
                    key: 'avatar',
                    autocommit: true,
                    fullName: model.get('fullName'),
                    autoUpload: true, // or use method 'upload' instead
                    refreshPreviewAfterUpload: true,
                    controller: new core.form.editors.avatar.controllers.DemoAvatarEditorController({
                        defaultURL: '/resources/images/defaultAvatar.png'
                    })
                }),

                presentation: '"{{avatar}}"'
            });
        };
    }
);
