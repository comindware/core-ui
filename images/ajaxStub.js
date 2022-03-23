export default {
    makeStub() {
        function ajax_response(response) {
            return function(request) {
                switch (request.url) {
                    case '/api/UploadAttachment': {
                        let count = 0;

                        while (true) {
                            if (request.data.has(`file${count + 1}`)) {
                                count++;
                            } else {
                                const promise = new Promise((resolve, reject) => {
                                    setTimeout(() => {
                                        request.success(JSON.stringify({ fileIds: _.times(count, () => _.guid()) }));
                                    }, 5000);
                                });
                                return promise;
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
