const general = {
    dotify, undotify, decodeHtml, formatNumberInput, removeStartZeros
};

function dotify(x) {
    if (!x && x !== 0) return;
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return parts.join(".");
}

function undotify(x) {
    if (typeof x === 'string') return x.replace(/\./g, '');
}

function decodeHtml(html) {
    var txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
}

function formatNumberInput(el, min, max) {
    const value = el.val();
    let input = removeStartZeros(value);
    if (input === '') return;

    let num = parseFloat(input);
    if (isNaN(num)) num = 0;
    if (typeof min === 'number' && num < min) num = min;

    if (typeof max === 'number' && num > max) num = max;

    if (value !== num.toString()) {
        el.val(num);
    }

    return num;
}

function removeStartZeros(str) {
    while(str.charAt(0) === '0') {
        str = str.substr(1);
    }
    return str;
}

export default general;