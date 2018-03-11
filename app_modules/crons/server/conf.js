function config () {
    var api = {shouldRunCrons};

    function shouldRunCrons() {
        return false;
    }

    return api;
}
export default config();