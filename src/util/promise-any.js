/**
 * Simple polyfill for AggregateError if it doesn't exist.
 */
const _AggregateError = typeof AggregateError !== 'undefined'
  ? AggregateError
  : function AggregateError(errors, message) {
    const error = new Error(message);
    error.name = 'AggregateError';
    error.errors = errors;
    return error;
  };

/**
 * Ensures Promise.any exists, or provides a polyfill.
 */
if (typeof Promise.any !== 'function') {
  Promise.any = function (promises) {
    return new Promise((resolve, reject) => {
      promises = Array.from(promises);
      const len = promises.length;
      let errors = [];
      let rejectedCount = 0;

      if (len === 0) {
        return reject(new _AggregateError(errors, 'All promises were rejected'));
      }

      promises.forEach((promise, index) => {
        Promise.resolve(promise)
          .then((value) => {
            resolve(value);
          })
          .catch((error) => {
            errors[index] = error;
            rejectedCount++;
            if (rejectedCount === len) {
              reject(new _AggregateError(errors, 'All promises were rejected'));
            }
          });
      });
    });
  };
}

export default Promise.any;
