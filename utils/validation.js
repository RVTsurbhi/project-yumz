
exports.customValidator = function (body, callback) {
    var checkBlankData = checkBlankValues(body);
    if (checkBlankData.length) {
        callback(400, checkBlankData);
    } else {
        var validate = checkValidations(body);
        if (validate.length) {
            callback(400, validate);
        } else {
            callback(null);
        }
    }
}

function checkBlankValues(obj) {
    var blankArray = [];
    for (key in obj) {
        if (obj[key].required == 1) {
            if (obj[key].value === '') {
                blankArray.push(key + " is empty string");
            } else if (obj[key].value === undefined) {
                blankArray.push(key + " is undefined");
            } else if (obj[key].value === null) {
                blankArray.push(key + " is null");
            } else if (!obj[key].value && obj[key].value != 0) {
                blankArray.push(key + " is not defined");
            } else if (obj[key].is_array && !checkBlankArray(obj[key].value)) {
                blankArray.push(key + " is empty array");
            }
        }
    }
    return blankArray;
}

exports.checkBlankValues = checkBlankValues;

function checkValidations(obj) {
    var err = [];
    for (key in obj) {
        if (obj[key].is_email == 1 && !validateEmail(obj[key].value)) {
            err.push(key + " is not valid email.");
        } else if (obj[key].is_string == 1 && !validateString(obj[key].value)) {
            err.push(key + " is not valid string.");
        } else if (obj[key].is_mobile == 1 && !validateMobile(obj[key].value)) {
            err.push(key + " is not valid mobile.");
        } else if (obj[key].is_number == 1 && !isNumeric(obj[key].value)) {
            err.push(key + " is not valid number.");
        } else if (obj[key].is_zipcode == 1 && !validateZip(obj[key].value)) {
            err.push(key + " is not valid zipcode.");
        } else if (obj[key].is_tin == 1 && !validateTin(obj[key].value)) {
            err.push(key + " is not valid tin number.");
        } else if (obj[key].is_date == 1 && !validateDate(obj[key].value)) {
            err.push(key + " is not valid date.");
        } else if (obj[key].is_object == 1 && !validateObject(obj[key].value)) {
            err.push(key + " is not valid object.");
        } else if (obj[key].is_device_type == 1 && !validateDeviceType(obj[key].value)) {
            err.push(key + " is not valid device Type.");
        } else if (obj[key].is_array && !validateArray(obj[key].value)) {
            err.push(key + " is not valid array.");
        }
    }
    return err;
}

exports.checkValidations = checkValidations;

function validateEmail(email) {
    
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if(email===null || re.test(email)){
        return true;
    }else{
        return false;
    }
}

function validateString(password) {
    if (password===null || typeof password === 'string') {
        return true;
    } else {
        return false;
    }
}

function validateTin(tin) {
    if (tin.trim().length == 9) {
        return true;
    } else {
        return false;
    }
}

function validateDeviceType(device_type) {
    if (device_type == 0 || device_type == 1 || device_type == 2) {
        return true;
    } else {
        return false;
    }
}

function validateObject(yourVariable) {
    if (typeof yourVariable === 'string') {
        try {
            yourVariable = JSON.parse(yourVariable);
            console.log("parsed");
        } catch (e) {
            console.log("JSON parse error: ", e);
        }
    }
    if (yourVariable !== null && typeof yourVariable === 'object') {
        return true;
    } else {
        return false;
    }
}

function validateArray(yourVariable) {
    if (typeof yourVariable === 'string') {
        try {
            yourVariable = JSON.parse(yourVariable);
            console.log("parsed");
        } catch (e) {
            console.log("JSON parse error: ", e);
        }
    }
    if (yourVariable !== null && typeof yourVariable === 'object' && Array.isArray(yourVariable)) {
        return true;
    } else {
        return false;
    }
}

function checkBlankArray(yourVariable) {
    if (typeof yourVariable === 'string') {
        try {
            yourVariable = JSON.parse(yourVariable);
            console.log("parsed");
            return false;
        } catch (e) {
            console.log("JSON parse error: ", e);
        }
    }
    if (validateArray(yourVariable) && !yourVariable.length) {
        return false;
    }else{
        return true;
    }
}

function validateDate(date) {
    if (date.split('-').length == 3) {
        return true;
    } else {
        return false;
    }
}

function validateMobile(mobile) {
    var regex = '^([+0-9]*?)*-([0-9]*?)$';
    var match = mobile.match(regex);
    var mobile_number = mobile.split("-");
    var mobile_first = mobile_number[0];
    var mobile_second = mobile_number[1];
    if (!match) {
        return false;
    } else if (mobile_number.length > 2) {
        return false;
    } else if (mobile.trim().length == 0) {
        return false;
    } else if (!mobile_first || mobile_first.charAt(0) != "+") {
        return false;
    } else if (!mobile_second || mobile_second.length < 9) {
        return false;
    } else if (!mobile_first || mobile_first.length == 1) {
        return false;
    } else if (!mobile_second || mobile_second.length > 15) {
        return false;
    } else {
        return true;
    }
}

function validateZip(zipcode) {
    if (zipcode.toString().trim().length == 0) {
        return false;
    } else if (zipcode.toString().length < 4 || zipcode.toString().length > 8) {
        return false;
    } else {
        return true;
    }
}

function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}
