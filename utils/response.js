exports.response = function (err, response, res, media = 0) {
    var status = 200;
    var errors = {
        400: "bad_request",
        401: "forbidden",
        403: "unauthorized",
        500: "internal_server_error"
    };
    if (err) {
        console.log("err: " + err);
        console.log("err is_numeric:", !isNaN(parseFloat(err)) && isFinite(err));
        if (!isNaN(parseFloat(err)) && isFinite(err)) {
            status = err;
            response = {
                error: errors[status],
                error_description: response
            };
        } else {
            status = 400;
            response = {
                error: errors[status],
                error_description: err
            };
        }
    }
    res.status(status ? status : 200);
    if (media && status==200) {
        res.set('Content-Type', 'image/jpeg');
        res.send(response);
    } else {
        res.send(JSON.stringify(response));
}
};
