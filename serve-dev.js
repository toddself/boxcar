const http = require('http')
const browserify = require('browserify')
const st = require('sheetify/transform')
const es2020 = require('es2020')
const yoyoify = require('yo-yoify')

http.createServer((req, res) => {
  if (/bundle.js/.test(req.url)) {
    browserify('./demo.js', {debug: true})
      .transform(st)
      .transform(yoyoify)
      .transform(es2020)
      .bundle()
      .pipe(res)
  } else {
    res.end('<!doctype html><title>test</title><body><script src="/bundle.js"></script>')
  }
}).listen(8000, () => console.log('Listening on http://localhost:8000'))

process.on('uncaughtException', (err) => console.log(err, err.stacktrace))
