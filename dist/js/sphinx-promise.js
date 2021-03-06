'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _sphinxapi = require('sphinxapi');

var _sphinxapi2 = _interopRequireDefault(_sphinxapi);

var _typeCheck = require('type-check');

var _deap = require('deap');

var _deap2 = _interopRequireDefault(_deap);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new _bluebird2.default(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return _bluebird2.default.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } 

var DEFAULT_OFFSET = 0;
var DEFAULT_LIMIT = 20;
var DEFAULT_MAX_MATCHES = 1000;
var DEFAULT_CUTOFF = 0;

var Sphinx = function (_SphinxClient) {
  _inherits(Sphinx, _SphinxClient);

  function Sphinx() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref$host = _ref.host,
        host = _ref$host === undefined ? 'localhost' : _ref$host,
        _ref$port = _ref.port,
        port = _ref$port === undefined ? 9312 : _ref$port;

    _classCallCheck(this, Sphinx);

    var _this = _possibleConstructorReturn(this, (Sphinx.__proto__ || Object.getPrototypeOf(Sphinx)).call(this));

    _this.config = {};
    _this.isDebugMode = false;

    _this.setConfig({ host: host, port: port });
    return _this;
  }





  _createClass(Sphinx, [{
    key: 'setConfig',
    value: function setConfig() {
      var _ref2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          _ref2$host = _ref2.host,
          host = _ref2$host === undefined ? 'localhost' : _ref2$host,
          _ref2$port = _ref2.port,
          port = _ref2$port === undefined ? 9312 : _ref2$port;

      if (!(0, _typeCheck.typeCheck)('String', host) || !(0, _typeCheck.typeCheck)('Number | String', port)) {
        throw new TypeError('Invalid config object');
      }
      this.config = { host: host, port: port };
      this.SetServer(host, Number(port));
    }


  }, {
    key: 'setRetriesOption',
    value: function setRetriesOption() {
      var retryOption = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var count = retryOption.count,
          _retryOption$delay = retryOption.delay,
          delay = _retryOption$delay === undefined ? 0 : _retryOption$delay;

      if (!(0, _typeCheck.typeCheck)('Number', count) || !(0, _typeCheck.typeCheck)('Number', delay)) {
        throw new TypeError('Invalid RetryOption object');
      }
      this.SetRetries(count, delay);
    }


  }, {
    key: 'query',
    value: function query() {
      var _this2 = this;

      var queryString = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      var _ensureQueryArgs2 = this._ensureQueryArgs(queryString, options);

      var _ensureQueryArgs3 = _slicedToArray(_ensureQueryArgs2, 2);

      queryString = _ensureQueryArgs3[0];
      options = _ensureQueryArgs3[1];
      var _options = options,
          index = _options.index,
          comment = _options.comment,
          _options$filters = _options.filters,
          filters = _options$filters === undefined ? [] : _options$filters,
          limits = _options.limits,
          resultAsIds = _options.resultAsIds,
          matchMode = _options.matchMode;

      this._resetFilters();
      this._addFilters(filters);
      this._setLimits(limits);
      this._setMatchMode(matchMode);
      return _bluebird2.default.promisify(this.Query.bind(this))(queryString, index, comment).then(function (result) {
        return resultAsIds ? _this2.getIdsFromResult(result) : result;
      }).tap(function (result) {
        return _this2.isDebugMode && console.info(result);
      });
    }


  }, {
    key: 'addQuery',
    value: function addQuery() {
      var queryString = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      var _ensureQueryArgs4 = this._ensureQueryArgs(queryString, options);

      var _ensureQueryArgs5 = _slicedToArray(_ensureQueryArgs4, 2);

      queryString = _ensureQueryArgs5[0];
      options = _ensureQueryArgs5[1];
      var _options2 = options,
          index = _options2.index,
          comment = _options2.comment,
          _options2$filters = _options2.filters,
          filters = _options2$filters === undefined ? [] : _options2$filters,
          limits = _options2.limits,
          matchMode = _options2.matchMode;

      this._resetFilters();
      this._addFilters(filters);
      this._setLimits(limits);
      this._setMatchMode(matchMode);
      return this.AddQuery(queryString, index, comment);
    }


  }, {
    key: '_addFilters',
    value: function _addFilters() {
      var filters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

      filters.forEach(this._addFilter.bind(this));
    }


  }, {
    key: '_setLimits',
    value: function _setLimits() {
      var _ref3 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          _ref3$offset = _ref3.offset,
          offset = _ref3$offset === undefined ? DEFAULT_OFFSET : _ref3$offset,
          _ref3$limit = _ref3.limit,
          limit = _ref3$limit === undefined ? DEFAULT_LIMIT : _ref3$limit,
          _ref3$maxMatches = _ref3.maxMatches,
          maxMatches = _ref3$maxMatches === undefined ? DEFAULT_MAX_MATCHES : _ref3$maxMatches,
          _ref3$cutoff = _ref3.cutoff,
          cutoff = _ref3$cutoff === undefined ? DEFAULT_CUTOFF : _ref3$cutoff;

      this.SetLimits(offset, limit, maxMatches, cutoff);
    }


  }, {
    key: '_resetLimits',
    value: function _resetLimits() {
      this._setLimits();
    }


  }, {
    key: '_addFilter',
    value: function _addFilter() {
      var _ref4 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          attr = _ref4.attr,
          values = _ref4.values,
          _ref4$exclude = _ref4.exclude,
          exclude = _ref4$exclude === undefined ? false : _ref4$exclude;

      values = values || values;
      if ((0, _typeCheck.typeCheck)('[Number]', values)) {
        this.SetFilter(attr, values, exclude);
      }if ((0, _typeCheck.typeCheck)('Number', values)) {
        this.SetFilter(attr, [values], exclude);
      } else {
        this.SetFilterString(attr, values, exclude);
      }
    }


  }, {
    key: '_resetFilters',
    value: function _resetFilters() {
      this.ResetFilters();
    }


  }, {
    key: 'runQueries',
    value: function runQueries() {
      return _bluebird2.default.promisify(this.RunQueries.bind(this))();
    }


  }, {
    key: '_setMatchMode',
    value: function _setMatchMode(mode) {
      this.SetMatchMode(mode);
    }


  }, {
    key: 'getIdsFromResult',
    value: function getIdsFromResult() {
      var result = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      if (!(0, _typeCheck.typeCheck)('Object', result)) {
        throw new TypeError('Result must be an object');
      } else if (!result.hasOwnProperty('matches')) {
        return [];
      }
      return result.matches.map(function (match) {
        return match && match.id;
      }).filter(function (id) {
        return (0, _typeCheck.typeCheck)('Number', id);
      });
    }


  }, {
    key: 'setDebugMode',
    value: function setDebugMode() {
      var mode = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

      this.isDebugMode = mode;
    }


  }, {
    key: '_ensureQueryArgs',
    value: function _ensureQueryArgs(queryString, options) {
      if ((0, _typeCheck.typeCheck)('Object', queryString)) {
        if (!(0, _typeCheck.typeCheck)('String', queryString.query)) {
          throw new TypeError('Query must be a string');
        }
        options = queryString;
        queryString = options.query;
        delete options.query;
      }
      var defaultOptions = {
        index: '*',
        comment: '',
        filters: [],
        limits: {
          offset: DEFAULT_OFFSET,
          count: DEFAULT_LIMIT
        },
        matchMode: Sphinx.SPH_MATCH_EXTENDED2,
        resultAsIds: false
      };
      return [queryString, _deap2.default.merge(options, defaultOptions)];
    }


  }, {
    key: '_test',
    value: function () {
      var _ref5 = _asyncToGenerator( regeneratorRuntime.mark(function _callee() {
        var str = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'works';
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                console.log('Waiting...');
                _context.next = 3;
                return _bluebird2.default.delay(500);

              case 3:
                console.log('Done!');
                return _context.abrupt('return', _bluebird2.default.delay(500).then(function () {
                  return console.log('Resolved:', str);
                }));

              case 5:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function _test() {
        return _ref5.apply(this, arguments);
      }

      return _test;
    }()
  }]);

  return Sphinx;
}(_sphinxapi2.default);

Sphinx.SPH_MATCH_ALL = _sphinxapi2.default.SPH_MATCH_ALL;
Sphinx.SPH_MATCH_ANY = _sphinxapi2.default.SPH_MATCH_ANY;
Sphinx.SPH_MATCH_PHRASE = _sphinxapi2.default.SPH_MATCH_PHRASE;
Sphinx.SPH_MATCH_BOOLEAN = _sphinxapi2.default.SPH_MATCH_BOOLEAN;
Sphinx.SPH_MATCH_EXTENDED = _sphinxapi2.default.SPH_MATCH_EXTENDED;
Sphinx.SPH_MATCH_EXTENDED2 = _sphinxapi2.default.SPH_MATCH_EXTENDED2;
Sphinx.SPH_MATCH_FULLSCAN = _sphinxapi2.default.SPH_MATCH_FULLSCAN;


module.exports = Sphinx;

!(function(global) {
  "use strict";

  var Op = Object.prototype;
  var hasOwn = Op.hasOwnProperty;
  var undefined; 
  var $Symbol = typeof Symbol === "function" ? Symbol : {};
  var iteratorSymbol = $Symbol.iterator || "@@iterator";
  var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
  var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

  var inModule = typeof module === "object";
  var runtime = global.regeneratorRuntime;
  if (runtime) {
    if (inModule) {
      module.exports = runtime;
    }
    return;
  }

  runtime = global.regeneratorRuntime = inModule ? module.exports : {};

  function wrap(innerFn, outerFn, self, tryLocsList) {
    var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
    var generator = Object.create(protoGenerator.prototype);
    var context = new Context(tryLocsList || []);

    generator._invoke = makeInvokeMethod(innerFn, self, context);

    return generator;
  }
  runtime.wrap = wrap;

  function tryCatch(fn, obj, arg) {
    try {
      return { type: "normal", arg: fn.call(obj, arg) };
    } catch (err) {
      return { type: "throw", arg: err };
    }
  }

  var GenStateSuspendedStart = "suspendedStart";
  var GenStateSuspendedYield = "suspendedYield";
  var GenStateExecuting = "executing";
  var GenStateCompleted = "completed";

  var ContinueSentinel = {};

  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}

  var IteratorPrototype = {};
  IteratorPrototype[iteratorSymbol] = function () {
    return this;
  };

  var getProto = Object.getPrototypeOf;
  var NativeIteratorPrototype = getProto && getProto(getProto(values([])));
  if (NativeIteratorPrototype &&
      NativeIteratorPrototype !== Op &&
      hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
    IteratorPrototype = NativeIteratorPrototype;
  }

  var Gp = GeneratorFunctionPrototype.prototype =
    Generator.prototype = Object.create(IteratorPrototype);
  GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
  GeneratorFunctionPrototype.constructor = GeneratorFunction;
  GeneratorFunctionPrototype[toStringTagSymbol] =
    GeneratorFunction.displayName = "GeneratorFunction";

  function defineIteratorMethods(prototype) {
    ["next", "throw", "return"].forEach(function(method) {
      prototype[method] = function(arg) {
        return this._invoke(method, arg);
      };
    });
  }

  runtime.isGeneratorFunction = function(genFun) {
    var ctor = typeof genFun === "function" && genFun.constructor;
    return ctor
      ? ctor === GeneratorFunction ||
        (ctor.displayName || ctor.name) === "GeneratorFunction"
      : false;
  };

  runtime.mark = function(genFun) {
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
    } else {
      genFun.__proto__ = GeneratorFunctionPrototype;
      if (!(toStringTagSymbol in genFun)) {
        genFun[toStringTagSymbol] = "GeneratorFunction";
      }
    }
    genFun.prototype = Object.create(Gp);
    return genFun;
  };

  runtime.awrap = function(arg) {
    return { __await: arg };
  };

  function AsyncIterator(generator) {
    function invoke(method, arg, resolve, reject) {
      var record = tryCatch(generator[method], generator, arg);
      if (record.type === "throw") {
        reject(record.arg);
      } else {
        var result = record.arg;
        var value = result.value;
        if (value &&
            typeof value === "object" &&
            hasOwn.call(value, "__await")) {
          return Promise.resolve(value.__await).then(function(value) {
            invoke("next", value, resolve, reject);
          }, function(err) {
            invoke("throw", err, resolve, reject);
          });
        }

        return Promise.resolve(value).then(function(unwrapped) {
          result.value = unwrapped;
          resolve(result);
        }, reject);
      }
    }

    var previousPromise;

    function enqueue(method, arg) {
      function callInvokeWithMethodAndArg() {
        return new Promise(function(resolve, reject) {
          invoke(method, arg, resolve, reject);
        });
      }

      return previousPromise =
        previousPromise ? previousPromise.then(
          callInvokeWithMethodAndArg,
          callInvokeWithMethodAndArg
        ) : callInvokeWithMethodAndArg();
    }

    this._invoke = enqueue;
  }

  defineIteratorMethods(AsyncIterator.prototype);
  AsyncIterator.prototype[asyncIteratorSymbol] = function () {
    return this;
  };
  runtime.AsyncIterator = AsyncIterator;

  runtime.async = function(innerFn, outerFn, self, tryLocsList) {
    var iter = new AsyncIterator(
      wrap(innerFn, outerFn, self, tryLocsList)
    );

    return runtime.isGeneratorFunction(outerFn)
      ? iter 
      : iter.next().then(function(result) {
          return result.done ? result.value : iter.next();
        });
  };

  function makeInvokeMethod(innerFn, self, context) {
    var state = GenStateSuspendedStart;

    return function invoke(method, arg) {
      if (state === GenStateExecuting) {
        throw new Error("Generator is already running");
      }

      if (state === GenStateCompleted) {
        if (method === "throw") {
          throw arg;
        }

        return doneResult();
      }

      context.method = method;
      context.arg = arg;

      while (true) {
        var delegate = context.delegate;
        if (delegate) {
          var delegateResult = maybeInvokeDelegate(delegate, context);
          if (delegateResult) {
            if (delegateResult === ContinueSentinel) continue;
            return delegateResult;
          }
        }

        if (context.method === "next") {
          context.sent = context._sent = context.arg;

        } else if (context.method === "throw") {
          if (state === GenStateSuspendedStart) {
            state = GenStateCompleted;
            throw context.arg;
          }

          context.dispatchException(context.arg);

        } else if (context.method === "return") {
          context.abrupt("return", context.arg);
        }

        state = GenStateExecuting;

        var record = tryCatch(innerFn, self, context);
        if (record.type === "normal") {
          state = context.done
            ? GenStateCompleted
            : GenStateSuspendedYield;

          if (record.arg === ContinueSentinel) {
            continue;
          }

          return {
            value: record.arg,
            done: context.done
          };

        } else if (record.type === "throw") {
          state = GenStateCompleted;
          context.method = "throw";
          context.arg = record.arg;
        }
      }
    };
  }

  function maybeInvokeDelegate(delegate, context) {
    var method = delegate.iterator[context.method];
    if (method === undefined) {
      context.delegate = null;

      if (context.method === "throw") {
        if (delegate.iterator.return) {
          context.method = "return";
          context.arg = undefined;
          maybeInvokeDelegate(delegate, context);

          if (context.method === "throw") {
            return ContinueSentinel;
          }
        }

        context.method = "throw";
        context.arg = new TypeError(
          "The iterator does not provide a 'throw' method");
      }

      return ContinueSentinel;
    }

    var record = tryCatch(method, delegate.iterator, context.arg);

    if (record.type === "throw") {
      context.method = "throw";
      context.arg = record.arg;
      context.delegate = null;
      return ContinueSentinel;
    }

    var info = record.arg;

    if (! info) {
      context.method = "throw";
      context.arg = new TypeError("iterator result is not an object");
      context.delegate = null;
      return ContinueSentinel;
    }

    if (info.done) {
      context[delegate.resultName] = info.value;

      context.next = delegate.nextLoc;

      if (context.method !== "return") {
        context.method = "next";
        context.arg = undefined;
      }

    } else {
      return info;
    }

    context.delegate = null;
    return ContinueSentinel;
  }

  defineIteratorMethods(Gp);

  Gp[toStringTagSymbol] = "Generator";

  Gp[iteratorSymbol] = function() {
    return this;
  };

  Gp.toString = function() {
    return "[object Generator]";
  };

  function pushTryEntry(locs) {
    var entry = { tryLoc: locs[0] };

    if (1 in locs) {
      entry.catchLoc = locs[1];
    }

    if (2 in locs) {
      entry.finallyLoc = locs[2];
      entry.afterLoc = locs[3];
    }

    this.tryEntries.push(entry);
  }

  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal";
    delete record.arg;
    entry.completion = record;
  }

  function Context(tryLocsList) {
    this.tryEntries = [{ tryLoc: "root" }];
    tryLocsList.forEach(pushTryEntry, this);
    this.reset(true);
  }

  runtime.keys = function(object) {
    var keys = [];
    for (var key in object) {
      keys.push(key);
    }
    keys.reverse();

    return function next() {
      while (keys.length) {
        var key = keys.pop();
        if (key in object) {
          next.value = key;
          next.done = false;
          return next;
        }
      }

      next.done = true;
      return next;
    };
  };

  function values(iterable) {
    if (iterable) {
      var iteratorMethod = iterable[iteratorSymbol];
      if (iteratorMethod) {
        return iteratorMethod.call(iterable);
      }

      if (typeof iterable.next === "function") {
        return iterable;
      }

      if (!isNaN(iterable.length)) {
        var i = -1, next = function next() {
          while (++i < iterable.length) {
            if (hasOwn.call(iterable, i)) {
              next.value = iterable[i];
              next.done = false;
              return next;
            }
          }

          next.value = undefined;
          next.done = true;

          return next;
        };

        return next.next = next;
      }
    }

    return { next: doneResult };
  }
  runtime.values = values;

  function doneResult() {
    return { value: undefined, done: true };
  }

  Context.prototype = {
    constructor: Context,

    reset: function(skipTempReset) {
      this.prev = 0;
      this.next = 0;
      this.sent = this._sent = undefined;
      this.done = false;
      this.delegate = null;

      this.method = "next";
      this.arg = undefined;

      this.tryEntries.forEach(resetTryEntry);

      if (!skipTempReset) {
        for (var name in this) {
          if (name.charAt(0) === "t" &&
              hasOwn.call(this, name) &&
              !isNaN(+name.slice(1))) {
            this[name] = undefined;
          }
        }
      }
    },

    stop: function() {
      this.done = true;

      var rootEntry = this.tryEntries[0];
      var rootRecord = rootEntry.completion;
      if (rootRecord.type === "throw") {
        throw rootRecord.arg;
      }

      return this.rval;
    },

    dispatchException: function(exception) {
      if (this.done) {
        throw exception;
      }

      var context = this;
      function handle(loc, caught) {
        record.type = "throw";
        record.arg = exception;
        context.next = loc;

        if (caught) {
          context.method = "next";
          context.arg = undefined;
        }

        return !! caught;
      }

      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        var record = entry.completion;

        if (entry.tryLoc === "root") {
          return handle("end");
        }

        if (entry.tryLoc <= this.prev) {
          var hasCatch = hasOwn.call(entry, "catchLoc");
          var hasFinally = hasOwn.call(entry, "finallyLoc");

          if (hasCatch && hasFinally) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            } else if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else if (hasCatch) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            }

          } else if (hasFinally) {
            if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else {
            throw new Error("try statement without catch or finally");
          }
        }
      }
    },

    abrupt: function(type, arg) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc <= this.prev &&
            hasOwn.call(entry, "finallyLoc") &&
            this.prev < entry.finallyLoc) {
          var finallyEntry = entry;
          break;
        }
      }

      if (finallyEntry &&
          (type === "break" ||
           type === "continue") &&
          finallyEntry.tryLoc <= arg &&
          arg <= finallyEntry.finallyLoc) {
        finallyEntry = null;
      }

      var record = finallyEntry ? finallyEntry.completion : {};
      record.type = type;
      record.arg = arg;

      if (finallyEntry) {
        this.method = "next";
        this.next = finallyEntry.finallyLoc;
        return ContinueSentinel;
      }

      return this.complete(record);
    },

    complete: function(record, afterLoc) {
      if (record.type === "throw") {
        throw record.arg;
      }

      if (record.type === "break" ||
          record.type === "continue") {
        this.next = record.arg;
      } else if (record.type === "return") {
        this.rval = this.arg = record.arg;
        this.method = "return";
        this.next = "end";
      } else if (record.type === "normal" && afterLoc) {
        this.next = afterLoc;
      }

      return ContinueSentinel;
    },

    finish: function(finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.finallyLoc === finallyLoc) {
          this.complete(entry.completion, entry.afterLoc);
          resetTryEntry(entry);
          return ContinueSentinel;
        }
      }
    },

    "catch": function(tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;
          if (record.type === "throw") {
            var thrown = record.arg;
            resetTryEntry(entry);
          }
          return thrown;
        }
      }

      throw new Error("illegal catch attempt");
    },

    delegateYield: function(iterable, resultName, nextLoc) {
      this.delegate = {
        iterator: values(iterable),
        resultName: resultName,
        nextLoc: nextLoc
      };

      if (this.method === "next") {
        this.arg = undefined;
      }

      return ContinueSentinel;
    }
  };
})(
  (function() { return this })() || Function("return this")()
);

//# sourceMappingURL=sphinx-promise.js.map
