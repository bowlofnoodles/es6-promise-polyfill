const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';

const queueMicrotask = typeof queueMicrotask === 'undefined' ? setTimeout : queueMicrotask;

function PromisePolyfill(executor) {
  this.status = PENDING;
  this.value = void 0;
  this.reason = void 0;
  this.onResolvedCallback = [];
  this.onRejectedCallback = [];
  const ctx = this;

  function resolve(value) {
    queueMicrotask(function () {
      if (ctx.status === PENDING) {
        ctx.status = FULFILLED;
        ctx.value = value;
        for (let i = 0; i < ctx.onResolvedCallback.length; i++) {
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
        for (let i = 0; i < ctx.onRejectedCallback.length; i++) {
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

  if (x instanceof PromisePolyfill) {
    if (x.status === PENDING) {
      return x.then(function (v) {
        return resolvePromise(promise, v, resolve, reject);
      }, reject);
    } else {
      return x.then(resolve, reject);
    }
  }

  if ((x !== null && typeof x === 'object') || typeof x === 'function') {
    let thenOrThrowCalled = false;
    try {
      let then = x.then;
      if (typeof then === 'function') {
        then.call(
          x,
          function rs(v) {
            if (thenOrThrowCalled) return;
            thenOrThrowCalled = true;
            return resolvePromise(promise, v, resolve, reject);
          },
          function rj(r) {
            if (thenOrThrowCalled) return;
            thenOrThrowCalled = true;
            return reject(r);
          }
        );
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

PromisePolyfill.prototype.then = function (onFulfilled, onRejected) {
  const ctx = this;
  onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value;
  onRejected =
    typeof onRejected === 'function'
      ? onRejected
      : reason => {
          throw reason;
        };

  if (ctx.status === PENDING) {
    let promise = new PromisePolyfill(function (resolve, reject) {
      ctx.onResolvedCallback.push(function (value) {
        try {
          let x = onFulfilled(value);
          return resolvePromise(promise, x, resolve, reject);
        } catch (err) {
          return reject(err);
        }
      });

      ctx.onRejectedCallback.push(function (reason) {
        try {
          let x = onRejected(reason);
          return resolvePromise(promise, x, resolve, reject);
        } catch (err) {
          return reject(err);
        }
      });
    });
    return promise;
  }
  if (ctx.status === FULFILLED) {
    let promise = new PromisePolyfill(function (resolve, reject) {
      queueMicrotask(function () {
        try {
          let x = onFulfilled(ctx.value);
          return resolvePromise(promise, x, resolve, reject);
        } catch (err) {
          return reject(err);
        }
      });
    });
    return promise;
  }
  if (ctx.status === REJECTED) {
    let promise = new PromisePolyfill(function (resolve, reject) {
      queueMicrotask(function () {
        try {
          let x = onRejected(ctx.reason);
          return resolvePromise(promise, x, resolve, reject);
        } catch (err) {
          return reject(err);
        }
      });
    });
    return promise;
  }
};

const PROMISE = typeof Promise === 'undefined' ? PromisePolyfill : Promise;

export default PROMISE;