String.prototype.escape = function() {
    return this.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
}
  
String.prototype.unescape = function() {
    return this.replace(/\\\\/g, '\\').replace(/"/g, '"')
}
  
String.prototype.addAffix = function(char=',') {
    return this[this.length - 1] === char ? this : this ? this + char : this
}
  
String.prototype.trimStart = function(char='') {
    let e = char == null || char == '' ? 's' : char
    let reg = new RegExp(`^${e}*`)
    return this.replace(reg, '')
}
  
String.prototype.trimEnd = function(char='') {
    let e = char == null || char == '' ? 's' : char  
    let i = this.length
    let reg = new RegExp(e)
    while(reg.test(this.charAt(--i))) {}
    return this.substr(0, i + 1)
}

String.prototype.replaceAll = function(char, replaceChar) {
    return this.split('').reduce((s, e) => {
        s += e === char ? replaceChar : e
        return s
    }, '')
}

  