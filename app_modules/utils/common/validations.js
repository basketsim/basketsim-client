import emailValidator from 'email-validator';

function validations() {
    var api = {lengthBetween, email};

    /* DATA VALIDATION */
    function lengthBetween(str, min, max) {
        var status = {
            valid: true,
            error: null
        };

        if (str.length < min) {
            status = {
                valid: false,
                error: 'must contain more than ' + min + ' characters'
            }
        }

        if (str.length > max) {
            status = {
                valid: false,
                error: 'must contain less than ' + max + ' characters'
            }
        }

        return status;
    }

    function email(emailStr) {
        var status = {
            valid: true,
            error: null
        };

        var validEmail = emailValidator.validate(emailStr);

        if (!validEmail) {
            status = {
                valid: false,
                error: 'Email is not valid'
            }
        }

        return status;
    }

    return api;
}

export default validations();