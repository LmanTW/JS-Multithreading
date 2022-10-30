const { Worker } = require('node:worker_threads')
const fs = require('fs')

let threads = {}

//取得隨機數
function getRandom (min,max) {
  return Math.floor(Math.random()*max)+min
}

//生成ID
function generateID (allKey) {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz12345678901234567890'
  let random = `${letters[getRandom(0, letters.length)]}${letters[getRandom(0, letters.length)]}${letters[getRandom(0, letters.length)]}${letters[getRandom(0, letters.length)]}${letters[getRandom(0, letters.length)]}${letters[getRandom(0, letters.length)]}${letters[getRandom(0, letters.length)]}${letters[getRandom(0, letters.length)]}${letters[getRandom(0, letters.length)]}${letters[getRandom(0, letters.length)]}${letters[getRandom(0, letters.length)]}${letters[getRandom(0, letters.length)]}${letters[getRandom(0, letters.length)]}${letters[getRandom(0, letters.length)]}${letters[getRandom(0, letters.length)]}${letters[getRandom(0, letters.length)]}${letters[getRandom(0, letters.length)]}${letters[getRandom(0, letters.length)]}${letters[getRandom(0, letters.length)]}${letters[getRandom(0, letters.length)]}`
  while (allKey.includes(random)) {
    random = `${letters[getRandom(0, letters.length)]}${letters[getRandom(0, letters.length)]}${letters[getRandom(0, letters.length)]}${letters[getRandom(0, letters.length)]}${letters[getRandom(0, letters.length)]}${letters[getRandom(0, letters.length)]}${letters[getRandom(0, letters.length)]}${letters[getRandom(0, letters.length)]}${letters[getRandom(0, letters.length)]}${letters[getRandom(0, letters.length)]}${letters[getRandom(0, letters.length)]}${letters[getRandom(0, letters.length)]}${letters[getRandom(0, letters.length)]}${letters[getRandom(0, letters.length)]}${letters[getRandom(0, letters.length)]}${letters[getRandom(0, letters.length)]}${letters[getRandom(0, letters.length)]}${letters[getRandom(0, letters.length)]}${letters[getRandom(0, letters.length)]}${letters[getRandom(0, letters.length)]}`
  }
  return random
}

class THREAD {
  constructor () {
    let id = generateID(Object.keys(threads))
    threads[id] = {}
    this.id = id,
    this.worker = new Worker('./worker.js', { workerData: id })
    this.works = {}
    //聆聽worker的訊息
    this.worker.addListener('message', (msg) => {
      if (msg.type === 'callback' && threads[msg.threadId] !== undefined) {
        this.works[msg.workId].callback(conversionStringToFunction(msg.data))
      }
    })
  }
  //執行函示
  async function (func, value) {
    if (threads[this.id] === undefined) {
      throw new Error(`找不到線程 (${this.id})`)
    } else if (func === undefined) {
      throw new Error('參數 func 為必要參數')
    } else if (typeof func !== 'function') {
      throw new Error('參數 func 必須為函數')
    } else {
      return new Promise((resolve, reject) => {
        let workId = generateID(Object.keys(this.works))
        this.works[workId] = {
          callback: (data) => {
            resolve(data)
          }
        }
        if (Array.isArray(value)) {
          value = arrayToString(value)
        } else if (typeof value === 'object') {
          value = objectToString(value)
        } else {
          value = valueToString(value)
        }
        this.worker.postMessage({ type: 'addFunction', threadId: this.id, workId, function: func.toString(), value })
      })
    }
  }
  //執行檔案
  file (path, callback) {
    if (threads[this.id] === undefined) {
      throw new Error(`找不到線程 (${this.id})`)
    } else if (path === undefined) {
      throw new Error('參數 path 為必要參數')
    } else if (typeof path !== 'string') {
      throw new Error('參數 path 必須為字串')
    } else if (callback !== undefined && typeof callback !== 'function') {
      throw new Error('參數 callback 必須為函數')
    } else {
      let workId = generateID(Object.keys(this.works))
      this.works[workId] = {
        callback: (data) => {
          if (callback !== undefined) {
            callback()
          }
        }
      }
      this.worker.postMessage({ type: 'addFile', threadId: this.id, workId, file: fs.readFileSync(path, 'utf8') })
      return new class {
        constructor () {
          
        }
      }
    }
  }
  //聆聽訊息
  listen (callback) {
    if (threads[this.id] === undefined) {
      throw new Error(`找不到線程 (${this.id})`)
    } else if (callback === undefined) {
      throw new Error('參數 callback 為必要參數')
    } else if (typeof callback !== 'function') {
      throw new Error('參數 path 必須為字串')
    } else {
      this.worker.addListener('message', (msg) => {
        if (msg.type === 'portMessage' && msg.threadId === this.id) {
          callback(msg.content)
        }
      })
    }
  }
  //發送訊息
  postMessage (content) {
    if (threads[this.id] === undefined) {
      throw new Error(`找不到線程 (${this.id})`)
    } else if (content === undefined) {
      throw new Error('參數 content 為必要參數')
    } else {
      this.worker.postMessage({ type: 'portMessage', threadId: this.id, content })
    }
  }
  //關閉線程
  close () {
    if (threads[this.id] === undefined) {
      throw new Error(`找不到線程 (${this.id})`)
    } else {
      delete threads[this.id]
    }
  }
}

//取得狀態
function STATE () {
  return {
    threadsQuantity: Object.keys(threads).length
  }
}

class port {
  //聆聽訊息
  static listen (callback) {
    if (callback === undefined) {
      throw new Error('參數 callback 為必要參數')
    } else if (typeof callback !== 'function') {
      throw new Error('參數 path 必須為字串')
    } else {
      const { parentPort, workerData } = require('node:worker_threads')
      parentPort.addListener('message', (msg) => {
        if (msg.type === 'portMessage' && msg.threadId === workerData) {
          callback(msg.content)
        }
      })
    }
  }
  //發送訊息
  static postMessage (content) {
    if (content === undefined) {
      throw new Error('參數 content 為必要參數')
    } else {
      const { parentPort, workerData } = require('node:worker_threads')
      parentPort.postMessage({ type: 'portMessage', threadId: workerData, content })
    }
  }
}

//將資料中的函數從字串轉回函數
function conversionStringToFunction (data) {
  if (data !== undefined && data.dataType === 'function') {
    let start, end
      for (let run = 9; run < data.function.length; run++) {
        if (data.function.substring(run, run+1) !== ' ') {
          start = run
          break
        }
      }
      for (let run = start; run < data.function.length; run++) {
        if (data.function.substring(run, run+1) === ' ' || data.function.substring(run, run+1) === '(') {
          end = run
          break
        }
      }
    const functionName = data.function.substring(start, end)
    const functionContent = data.function
    data = (...args) => {
      if (functionContent.substring(0, 8) === 'function' || functionContent.substring(0, 14) === 'async function') {
        return eval(`${functionContent};${functionName}(${args.toString()})`)
      } else {
        return eval(`(${functionContent})(${args.toString()})`)
      }
    }
  } else if (typeof data === 'object' && !Array.isArray(data)) {
    let allKey = Object.keys(data)
    for (let run = 0; run < allKey.length; run++) {
      data[allKey[run]] = conversionStringToFunction(data[allKey[run]])
    }
  } else if (Array.isArray(data)) {
    for (let run = 0; run < data.length; run++) {
      data[run] = conversionStringToFunction(data[run])
    }
  }
  return data
}

//陣列至字串
function arrayToString (array) {
  for (let run = 0; run < array.length; run++) {
    if (typeof array[run] === 'object') {
      array[run] = objectToString(array[run])
    } else if (typeof array[run] === 'string') {
      array[run] = `'${array[run]}'`
    } else {
      array[run] = `${array[run]}`
    }
  }
  return `[${array}]`
}

//物件至字串
function objectToString (object) {
  let string = ''
  for (let key in object) {
    string += `${key}:${valueToString(object[key])},`
  }
  if (string.substring(string.length-1, string.length) === ',') {
    string = string.substring(0, string.length-1)
  }
  return `{${string}}`
}

//值
function valueToString (value) {
  if (Array.isArray(value)) {
    return arrayToString(value)
  } else if (typeof value === 'object') {
    return objectToString(value)
  } else if (typeof value === 'string') {
    return `'${value}'`
  } else {
    return `${value}`
  }
}

module.exports = { THREAD, STATE, port }