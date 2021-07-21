class xPromise {
  #status = "pending";
  /**
   *
   * @param {function} fn
   */
  constructor(fn) {
    this.resolveCallback = [];
    this.rejectCallback = [];

    const resolve = this._resolve.bind(this);
    const reject = this._reject.bind(this);
    fn(resolve, reject);
  }

  _resolve(value) {
    if (this.#status === "pending") {
      this.#status = "fulfilled";
      this.value = value;
      this.resolveCallback.forEach((fn) => {
        fn(this.value);
      });
    }
  }

  _reject(reson) {
    if (this.#status === "pending") {
      this.#status = "rejected";
      this.reson = reson;
      this.rejectCallback.forEach((fn) => {
        fn(this.reson);
      });
    }
  }

  /**
   *
   * @param {xPromise} promiseArray
   */
  static all(promiseArray) {
    return new xPromise((resolve, reject) => {
      const result = Array(promiseArray.length);
      let isReject = false;
      promiseArray.forEach((promise, index) => {
        promise.then(
          (v) => {
            if (isReject) return false;
            result[index] = v;
            if (result.length - 1 === index) {
              resolve(result);
            }
          },
          (e) => {
            isReject = true;
            reject(e);
          }
        );
      });
    });
  }

  static resolve(value) {
    return new xPromise((resolve, reject) => {
      resolve(value);
    });
  }

  static reject(reson) {
    return new xPromise((resolve, reject) => {
      reject(reson);
    });
  }

  resolvePromise(r, resolve, reject) {
    if (r instanceof xPromise) {
      r.then(
        (v) => {
          resolve(v);
        },
        (e) => {
          reject(e);
        }
      );
    } else {
      resolve(r);
    }
  }

  then(onFulfilled, onRejected) {
    onFulfilled =
      typeof onFulfilled === "function"
        ? onFulfilled
        : function (f) {
            return f;
          };
    onRejected =
      typeof onRejected === "function"
        ? onRejected
        : function (r) {
            throw r;
          };

    return new xPromise((resolve, reject) => {
      const onReject = (e) => {
        const fn = () => {
          try {
            const r = onRejected(e);
            this.resolvePromise(r, resolve, reject);
          } catch (e) {
            reject(e);
          }
        };
        process.nextTick(fn);
      };

      const onFulfill = (v) => {
        const fn = () => {
          try {
            const r = onFulfilled(v);
            this.resolvePromise(r, resolve, reject);
          } catch (e) {
            reject(e);
          }
        };
        process.nextTick(fn);
      };

      if (this.#status === "pending") {
        this.resolveCallback.push(onFulfill);
        this.rejectCallback.push(onReject);
      }

      if (this.#status === "fulfilled") {
        onFulfill(this.value);
      }

      if (this.#status === "rejected") {
        onReject(this.reson);
      }
    });
  }

  catch(onRejected) {
    return new xPromise((resolve, reject) => {
      const onReject = (e) => {
        const fn = () => {
          try {
            const r = onRejected(e);
            this.resolvePromise(r, resolve, reject);
          } catch (e) {
            reject(e);
          }
        };
        process.nextTick(fn);
      };

      if (this.#status === "pending") {
        this.rejectCallback.push(onReject);
        this.resolveCallback.push((v) => {
          resolve(v);
        });
      }
    });
  }
}
console.log("start");
const sleep = (ms) => {
  return new xPromise((r) => {
    setTimeout(() => {
      r();
    }, ms);
  });
};
const start = async () => {
  const e = await sleep(1000).then(() => {
    throw 'error'
  }).catch((e) => {
    return e + ' - catch'
  })
  console.log(e)
};
start();
// new xPromise(resolve => {
//     resolve(1)
// }).then().then(() => 2).then(v => {
//     console.log(v)
// })
// console.time('xPromise')
// new xPromise(resolve => {
//     setTimeout(() => {
//         resolve(1)
//     })
// }).then(v => {
//     console.log('then 1')
//     return new xPromise(r => {
//         setTimeout(() => {
//             r(100)
//         }, 1000)
//     })
// }).then(v => {
//     console.log('then 2', v)
//     console.timeEnd('xPromise')
// }).catch(e => {
//     console.log('catch', e)
//     return 100
// }).then(v => {
//     console.log('then 3', v)
// }, e => {
//     console.log('error', e)
// })
// console.time('promise')
// const promise1 = new xPromise((resolve, reject) => {
//     setTimeout(() => {
//         reject(new Error('Fail1'))
//     }, 2500)
// })
// const promise2 = new xPromise(resolve => {
//     setTimeout(() => {
//         resolve('promise2')
//     }, 1000)
// })
// xPromise.all([
//     promise2,
//     promise1,
// ]).then(v => {
//     console.log(v.join(','))
// }).catch(e => {
//     console.log(e)
//     return 100
// }).then(v => {
//     console.log('then', v)
// })
// xPromise.reject(new Error('Fail2')).then(v => {
//     console.log(v)
// }).catch(e => {
//     console.log(e)
// })
// new xPromise((resolve, reject) => {
//     console.log('xPromise')
//     setImmediate(() => {
//         resolve(1)
//     })
// }).then(v => {
//     console.log('then 1:', v)
//     b.a()
//     return 2
// }).then(v => {
//     console.log('then 2:', v)
// }).catch(e => {
//     console.log('catch', e)
// })
console.log("end");
