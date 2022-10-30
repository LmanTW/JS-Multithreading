const { THREAD, STATE } = require('./index')

//一個相比js原來的Worker更方便的Library

let thread = new THREAD()

thread.listen((msg) => {
  console.log(msg)
})

thread.file('./file.js')