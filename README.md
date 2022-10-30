# **JS-Multithreading**

一個可以簡單實現JavaScript多線程的Library。

## **範例**
```js
const { THREAD } = require('./JS-Multithreading/index')
let thread = new THREAD()
thread.function((value) => {
  console.log(value) //Hello
}, 'Hello')
```

# **內容**

* [THREAD](#thread)
  * [THREAD.function()](#threadfunction)
  * [THREAD.file()](#threadfile)
  * [THREAD.listen()](#threadlisten)
  * [THREAD.postMessage()](#threadpostmessage)
  * [THREAD.close()](#threadclose)
* [STATE()](#state)
* [port](#port)
  * [port.listen()](#portlisten)
  * [port.postMessage()](#portpostmessage)

# THREAD
```js
const { THREAD } = require('./JS-Multithreading/index')
let thread = new THREAD()
```

## THREAD.function()
```js
await thread.function(func, value) //在線程中執行函數

//範例
thread.function((value) => {
  console.log(value+value) //2
}, 1)
```

* `func <function>`｜要執行的函數 (必要參數)
* `value`｜要傳輸給函數的參數 ([可傳輸的類型](#可傳輸的類型))

在函數中你可以return東西到主線程，但請注意，返回的內容必須為[可傳輸的類型](#可傳輸的類型)
```js
async function test () {
  console.log(await thread.function((value) => {
    return 123
  })) //123
}
test()
```

## THREAD.file()
```js
thread.file(path) //在線程中執行檔案
```

* `path`｜要執行的檔案的路徑

## THREAD.listen()
```js
thread.listen(callback) //在線程中聆聽訊息
```

* `callback <function>`｜收到訊息後觸發的函數

## THREAD.postMessage()
```js
thread.postMessage(content) //在線程中發送訊息
```

* `content`｜要發送的訊息內容

訊息的內容必須要符合[結構化克隆算法](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm)

## THREAD.close()
```js
thread.close() //關閉線程
```

關閉線程後，原本在線程中未return的東西主線程將不會收到。

# STATE()
```js
STATE()

//返回的內容
{
  threadsQuantity //線程的數量
}
```

# port
```js
const { port } = require('./JS-Multithreading/index')
```

## port.listen()
```js
port.listen(callback) //在線程中聆聽訊息
```

* `callback <function>`｜收到訊息後觸發的函數

## port.postMessage()
```js
port.postMessage(content) //在線程中發送訊息
```

訊息的內容必須要符合[結構化克隆算法](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm)

* `content`｜要發送的訊息內容

# 可傳輸的類型

* [boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)
* [string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
* [number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)
* [array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)
* [object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)
* [function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function)

(class會被偵測為object)