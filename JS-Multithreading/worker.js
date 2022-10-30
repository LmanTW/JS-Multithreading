const { parentPort } = require('node:worker_threads')

const { checkRequire } = require('./require')

parentPort.addListener('message', (msg) => {
  if (msg.type === 'addFunction') {
    //添加函數
    msg.function = checkRequire(msg.function)
    if (msg.function.substring(0, 8) === 'function' || msg.function.substring(0, 14) === 'async function') {
      let start, end
      for (let run = 9; run < msg.function.length; run++) {
        if (msg.function.substring(run, run+1) !== ' ') {
          start = run
          break
        }
      }
      for (let run = start; run < msg.function.length; run++) {
        if (msg.function.substring(run, run+1) === ' ' || msg.function.substring(run, run+1) === '(') {
          end = run
          break
        }
      }
      parentPort.postMessage({ type: 'callback', coreId: msg.coreId, workId: msg.workId, data: conversionFunction(eval?.(`${msg.function};${msg.function.substring(start, end)}(${msg.value})`)) })
    } else {
      parentPort.postMessage({ type: 'callback', coreId: msg.coreId, workId: msg.workId, data: conversionFunction(eval?.(`(${msg.function})(${msg.value})`)) })
    }
  } else if (msg.type === 'addFile') {
    //添加檔案
    msg.file = checkRequire(msg.file)
    parentPort.postMessage({ type: 'callback', coreId: msg.coreId, workId: msg.workId, data: eval?.(msg.file) })
  }
})

//轉換函示至字串
function conversionFunction (data) {
  if (typeof data === 'object' && !Array.isArray(data)) {
    let allKey = Object.keys(data)
    for (let run = 0; run < allKey.length; run++) {
      data[allKey[run]] = conversionFunction(data[allKey[run]])
    }
  } else if (typeof data === 'object' && Array.isArray(data)) {
    for (let run = 0; run < data.length; run++) {
      data[run] = conversionFunction(data[run])
    }
  } else if (typeof data === 'function') {
    data = {
      dataType: 'function',
      function: data.toString()
    }
  }
  return data
}