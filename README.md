# es6-promise-polyfill

[es6-promise-polyfill](https://github.com/bowlofnoodles/es6-promise-polyfill)

`umd`模块规范，支持`node`，浏览器或者直接引用`js`使用`PromisePolyfill`全局变量。

## 安装

``` bash
npm install --save es-promise-polyfill
# or
yarn add es-promise-polyfill
```

## 使用

+ es module

``` javascript
import Promise from 'es-promise-polyfill'

// 跟es6语法使用方法一样
new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve(true);
  }, 1000);
}).then(res => {
  console.log(res);
});
```

+ commonJS

``` javascript
const Promise = require('es-promise-polyfill');

// 跟es6语法使用方法一样
new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve(true);
  }, 1000);
}).then(res => {
  console.log(res);
});
```

+ 非模块化环境

下载[lib/index.min.js](https://github.com/bowlofnoodles/es6-promise-polyfill/blob/main/lib/index.min.js)，然后在script标签引用。

``` html
<script src="your path to save index.min.js"></script>
```

``` javascript
// 使用全局变量 PromisePolyfill，然后跟es6语法使用方法一样
new PromisePolyfill((resolve, reject) => {
  setTimeout(() => {
    resolve(true);
  }, 1000);
}).then(res => {
  console.log(res);
});
```

