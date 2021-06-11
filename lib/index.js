(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.PromisePolyfill = factory());
}(this, (function () { 'use strict';

  function _typeof(obj) {
    "@babel/helpers - typeof";

    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  var PENDING = 'pending';
  var FULFILLED = 'fulfilled';
  var REJECTED = 'rejected';

  function MyPromise(executor) {
    this.status = PENDING;
    this.value = void 0;
    this.reason = void 0;
    this.onResolvedCallback = [];
    this.onRejectedCallback = [];
    var ctx = this;

    function resolve(value) {
      queueMicrotask(function () {
        if (ctx.status === PENDING) {
          ctx.status = FULFILLED;
          ctx.value = value;

          for (var i = 0; i < ctx.onResolvedCallback.length; i++) {
            ctx.onResolvedCallback[i](ctx.value);
          }
        }
      });
    }

    function reject(reason) {
      queueMicrotask(function () {
        if (ctx.status === PENDING) {
          ctx.status = REJECTED;
          ctx.reason = reason;

          for (var i = 0; i < ctx.onRejectedCallback.length; i++) {
            ctx.onRejectedCallback[i](ctx.reason);
          }
        }
      });
    }

    try {
      executor(resolve, reject);
    } catch (err) {
      reject(err);
    }
  }

  function resolvePromise(promise, x, resolve, reject) {
    if (promise === x) return reject(new TypeError('Cycle Chain Detected in promise'));

    if (x instanceof MyPromise) {
      if (x.status === PENDING) {
        return x.then(function (v) {
          return resolvePromise(promise, v, resolve, reject);
        }, reject);
      } else {
        return x.then(resolve, reject);
      }
    }

    if (x !== null && _typeof(x) === 'object' || typeof x === 'function') {
      var thenOrThrowCalled = false;

      try {
        var then = x.then;

        if (typeof then === 'function') {
          then.call(x, function rs(v) {
            if (thenOrThrowCalled) return;
            thenOrThrowCalled = true;
            return resolvePromise(promise, v, resolve, reject);
          }, function rj(r) {
            if (thenOrThrowCalled) return;
            thenOrThrowCalled = true;
            return reject(r);
          });
        } else {
          return resolve(x);
        }
      } catch (err) {
        if (thenOrThrowCalled) return;
        thenOrThrowCalled = true;
        return reject(err);
      }
    } else {
      return resolve(x);
    }
  }

  MyPromise.prototype.then = function (onFulfilled, onRejected) {
    var ctx = this;
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : function (value) {
      return value;
    };
    onRejected = typeof onRejected === 'function' ? onRejected : function (reason) {
      throw reason;
    };

    if (ctx.status === PENDING) {
      var promise = new MyPromise(function (resolve, reject) {
        ctx.onResolvedCallback.push(function (value) {
          try {
            var x = onFulfilled(value);
            return resolvePromise(promise, x, resolve, reject);
          } catch (err) {
            return reject(err);
          }
        });
        ctx.onRejectedCallback.push(function (reason) {
          try {
            var x = onRejected(reason);
            return resolvePromise(promise, x, resolve, reject);
          } catch (err) {
            return reject(err);
          }
        });
      });
      return promise;
    }

    if (ctx.status === FULFILLED) {
      var _promise = new MyPromise(function (resolve, reject) {
        queueMicrotask(function () {
          try {
            var x = onFulfilled(ctx.value);
            return resolvePromise(_promise, x, resolve, reject);
          } catch (err) {
            return reject(err);
          }
        });
      });

      return _promise;
    }

    if (ctx.status === REJECTED) {
      var _promise2 = new MyPromise(function (resolve, reject) {
        queueMicrotask(function () {
          try {
            var x = onRejected(ctx.reason);
            return resolvePromise(_promise2, x, resolve, reject);
          } catch (err) {
            return reject(err);
          }
        });
      });

      return _promise2;
    }
  };

  return MyPromise;

})));
