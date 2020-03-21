class Token {
  constructor(raw) {
    this.init(raw)
  }
  init(raw) {
    this.buffer = []
    this.pos = -1
    let map = { '{': 'begin_brace', '}': 'end_brace', '[': 'begin_bracket', ']': 'end_bracket', '\\': 'backslash', '"': 'quote', ',': 'comma', ':': 'colon' }
    let tmp = ''
    for (let i = 0; i < raw.length; i++) {
      const ch = raw[i]
      if (map[ch]) {
        if (tmp.trim()) {
          this.buffer.push({ value: tmp.trim(), type: 'string' })
          tmp = ''
        }
        this.buffer.push({ value: ch, type: map[ch] })
      } else {
        tmp += ch
      }
    }
  }
  hasMore() { return this.pos < this.buffer.length }
  next() { return this.buffer[++this.pos] }
  predict() { return this.buffer[Math.min(this.buffer.length, this.pos + 1)] }
  peek() { return this.buffer[Math.max(0, this.pos - 1)] }
  beforePeek () { return this.pos - 1 < 0 ? null : this.buffer[this.pos - 2] }
  back() { this.pos = Math.max(0, --this.pos) }
}
export default class Nbt {
  static deep = 0
  static parse(raw) {
    Nbt.deep = 0
    Nbt.tokens = new Token(raw)
    return Nbt.tokens.peek().type === 'begin_bracket' ? Nbt.parseArray() : Nbt.parseObject()
  }
  static unescape(raw) {
    return raw.replace('\\\\', '\\').replace('\\\"', '"')
  }
  static escape(raw) {
    return raw.replace('\\', '\\\\').replace('\\"', '\"')
  }
  static parseArray(flag) {
    let result = []
    let token = Nbt.tokens.next()
    let has = true
    while(1) {
      if (has) {
        if (Nbt.tokens.predict().type === 'end_bracket') {
          Nbt.tokens.next()
          break
        } else {
          result.push(Nbt.parseValue(flag))
        }
        has = false
      }
      token = Nbt.tokens.next()
      if (token.type === 'comma') {
        if (Nbt.tokens.predict().type === 'end_bracket') 
          throw new Error(`unexpect comma as ',' !`)
        has = true
        continue
      }
      if (token.type === 'end_bracket') {
        break
      }
      if (token.type === 'quote') {
        break
      }
      throw new Error(`unexpect type of ${token.type} !`)
    }
    return result
  }
  static trim() {
    if (!Nbt.deep) return
    let deep = Nbt.deep * 2 - 1
    while (deep-- > 0) {
      if (Nbt.tokens.next().type !== 'backslash') {
        throw new Error(`unexpect type of ${Nbt.tokens.peek()}!, lack of backslah`)
      }
    }
    if (Nbt.tokens.next().type !== 'quote') {
      throw new Error(`unexpect type of ${Nbt.tokens.peek()}!, expect is quote`)
    }
  }
  static parseKey() {
    Nbt.trim()
    let token = Nbt.tokens.next()
    if (token.type === 'string') {
      Nbt.trim()
      return token.value
    }
    throw new Error(`unexpect type of ${token.type}!, expect is string`)
  }
  static parseValue(flag) {
    let token = Nbt.tokens.predict()
    if (token.type === 'begin_brace') {
      return Nbt.parseObject(flag)
    }
    if (token.type === 'begin_bracket') {
      return Nbt.parseArray(flag)
    }
    if (token.type === 'quote') {
      return Nbt.parseString()
    }
    if (token.type === 'string') {
      return Nbt.tokens.next().value
    }
    if (flag && token.type === 'backslash') {
      Nbt.tokens.next()
      return Nbt.parseString(true)
    }
    return Nbt.parseKey()
  }
  static parseObject(flag) {
    let result = {}
    let token = Nbt.tokens.next()
    let has = true
    while(1) {
      // 空对象，直接退出
      if (Nbt.tokens.predict().type === 'end_brace') {
        Nbt.tokens.next()
        break
      }
      if (has) {
        let key = Nbt.parseKey()
        if (Nbt.tokens.next().type !== 'colon') {
          throw new Error(`unexpect comma as ${Nbt.tokens.peek().type} !, expect is colon`)
        }
        let value = Nbt.parseValue(flag)
        result[key] = value
        has = false
      }
      if (!Nbt.tokens.predict()) {
        break
      }
      token = Nbt.tokens.next()
      if (token.type === 'comma') {
        if (Nbt.tokens.predict().type === 'end_brace') {
          throw new Error(`unexpect comma as ',' !`)
        }
        has = true
        continue
      }
      if (token.type === 'end_bracket') {
        Nbt.tokens.back()
        break
      }
      if (token.type === 'end_brace') {
        const nextToken = Nbt.tokens.predict()
        if (flag) {
          if (nextToken.type !== 'quote' && nextToken.type !== 'end_brace' && nextToken.type !== 'end_bracket') {
            throw new Error(`unexpect comma as ${Nbt.tokens.peek().type} !, expect is quote or brace`)
          }
          Nbt.tokens.next()
          break
        }
        if (nextToken) {
          if (nextToken.type === 'comma') {
            break
          }
          if (nextToken.type === 'end_bracket') {
            break
          }
          if (nextToken.type === 'end_brace') {
            break
          }
        }
        Nbt.tokens.next()
        break
      }
      throw new Error(`unexpect type of ${token.type} !`)
    }
    flag && --Nbt.deep
    return result
  }
  static parseString(flag) {
    Nbt.tokens.next()
    if (Nbt.tokens.predict().type === 'begin_brace') {
      // deep累计
      Nbt.deep++
      // string object, need escape
      return Nbt.parseObject(true)
    }
    if (Nbt.tokens.predict().type === 'begin_bracket') {
      // deep累计
      Nbt.deep++
      // string array, need escape
      return Nbt.parseArray(true)
    } 
    // 普通string
    let result = ''
    let stack = []
    let token = Nbt.tokens.next()
    while (1) {
      if (!token) {
        throw new Error(`lack of closed quote`)
      }
      if (flag && token.type === 'backslash') {
        // 检测结束
        if (Nbt.tokens.predict().type === 'quote' && stack.length === 0) {
          Nbt.tokens.next()
          return result
        }
        // 检测转义
        for (let i = Nbt.deep; i > 0; i--) {
          if (Nbt.tokens.next().type !== 'backslash') { 
            throw new Error(`lack of backslash`)
          }
        }
        stack.push('\\')
        token = Nbt.tokens.next()
        if (token.type === 'backslash') {
          stack.pop()
        } else if (token.type === 'quote') {
          if (stack.length) {
            return result
          }
        } else {
          result += stack.join('')
          stack = []
          continue
        }
        throw new Error(`lack of closed quote or backslash`)
      }
      if (token.type === 'quote') {
        return result
      }
      result += token.value
      token = Nbt.tokens.next()
    }
  }
}