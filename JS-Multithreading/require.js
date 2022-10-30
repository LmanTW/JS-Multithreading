module.exports = { checkRequire }

//檢查require
function checkRequire (string) {
  for (let run = 0; run < string.length; run++) {
    if (string.substring(run, run+7) === 'require') {
      let name, stringType
      for (let run2 = run+9; run2 < string.length; run2++) {
        if ((string.substring(run+8, run+9) === "'" && string.substring(run2, run2+1) === "'") || (string.substring(run+8, run+9) === '"' && string.substring(run2, run2+1) === '"') || (string.substring(run+8, run+9) === "`" && string.substring(run2, run2+1) === "`")) {
          stringType = string.substring(run+8, run+9)
          name = string.substring(run+9, run2)
          break
        }
      }
      if (name === undefined) {
        let line
        for (let run2 = run; run2 < string.length; run2++) {
          if (string.substring(run2, run2+1) === ';' || string.substring(run2, run2+1) === '\n') {
            line = string.substring(run, run2)
          }
        }
        if (line === undefined) {
          line = string
        }
        throw new Error(`${line} <- 提供的參數必須只能為字串(不能為變數)`)
      } else {
        string = string.replaceAll(`require(${stringType}${name}${stringType})`, requireContent(name))
      }
    }
  }
  return string
}

//取得require的內容
function requireContent (id) {
  let content = require(id)
  if (Array.isArray(content)) {
    content = arrayToString(content)
  } else if (typeof content === 'object') {
    content = objectToString(content)
  } else {
    content = valueToString(content)
  }
  return content
}


//陣列至字串
function arrayToString (array) {
  for (let run = 0; run < array.length; run++) {
    array[run] = valueToString(array[run])
  }
  return `[${array}]`
}

//物件至字串
function objectToString (object) {
  let string = ''
  for (let key in object) {
    string += `${key}:${valueToString(object[key])}`
  }
  return `{${string}}`
}

//值
function valueToString (value) {
  if (Array.isArray(value)) {
    return arrayToString(value)
  } else if (typeof value === 'object') {
    return objectToString(value)
  } else if (typeof value === 'symbol') {
    return value.toString()
  } else if (typeof value === 'string') {
    return `'${value}'`
  } else {
    return `${value}`
  }
}