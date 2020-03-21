export function isSimpleType(type: string) {
    return ['byte', 'int', 'bool', 'short', 'double', 'long', 'float', 'string', 'select'].includes(type)
}