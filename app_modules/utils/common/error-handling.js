function eh() {
    var api = {vargs};

    /**
     * [vargs description]
     * @param  {string} funcName Name of function
     * @param  {various} the arguments
     */
    function vargs(funcName) {
        var valid = true;
        _.each(arguments, function(a){
            if (!a) valid = false;
        });

        if (!valid) throw(funcName + ' has unnasigned mandatory arguments');
    }

    return api;
}

export default eh();