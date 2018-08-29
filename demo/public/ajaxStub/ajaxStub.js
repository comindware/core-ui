export default {
    makeStub() {
        function ajax_response(response) {
            return function(request) {
                switch (request.url) {
                    case '/api/UploadAttachment': {
                        let count = 0;

                        while (true) {
                            if (request.data.has(`file${count + 1}`)) {
                                count ++;
                            } else {
                                return request.success(JSON.stringify({ fileIds: _.times(count, () =>_.guid()) }));
                            }
                        }
                    }
                    default: {
                        request.success(response);
                    }
                }
            };
        }

        $.ajax = ajax_response('{ "title": "My dummy JSON" }');
    }
};
