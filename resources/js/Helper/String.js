String.prototype.wrapSquareBrackets = function() {
    return `[${this}]`
}

String.prototype.wrapBrackets = function() {
    return `(${this})`
}

String.prototype.wrap = function(start = '', end = '') {
    return `${start}${this}${end}`
}

String.prototype.ucfirst = function() {
    return `${this[0].toUpperCase()}${this.slice(1)}`
}