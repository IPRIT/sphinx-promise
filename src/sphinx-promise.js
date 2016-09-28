/* @preserve
 * The MIT License (MIT)
 *
 * Copyright (c) 2016-2017 Alexander Belov
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 */

import Promise from 'bluebird';
import SphinxClient from 'sphinxapi';
import { typeCheck as isType } from 'type-check';
import deap from 'deap';


/**
 * Limits constants
 * @see http://sphinxsearch.com/docs/current.html#api-func-setlimits
 */
const DEFAULT_OFFSET      = 0;
const DEFAULT_LIMIT       = 20;
const DEFAULT_MAX_MATCHES = 1000;
const DEFAULT_CUTOFF      = 0;


class Sphinx extends SphinxClient {
  
  config = {};
  isDebugMode = false;
  
  
  /**
   * @static
   * @see http://sphinxsearch.com/docs/current.html#matching-modes
   */
  static SPH_MATCH_ALL        = SphinxClient.SPH_MATCH_ALL;
  static SPH_MATCH_ANY        = SphinxClient.SPH_MATCH_ANY;
  static SPH_MATCH_PHRASE     = SphinxClient.SPH_MATCH_PHRASE;
  static SPH_MATCH_BOOLEAN    = SphinxClient.SPH_MATCH_BOOLEAN;
  static SPH_MATCH_EXTENDED   = SphinxClient.SPH_MATCH_EXTENDED;
  static SPH_MATCH_EXTENDED2  = SphinxClient.SPH_MATCH_EXTENDED2;
  static SPH_MATCH_FULLSCAN   = SphinxClient.SPH_MATCH_FULLSCAN;
  
  
  /**
   * @param {String} host
   * @param {Number | String} port
   * @constructor
   */
  constructor({ host = 'localhost', port = 9312 } = {}) {
    super();
    this.setConfig({ host, port });
  }
  
  
  /**
   * Sets searchd host name and TCP port.
   *
   * @description
   * All subsequent requests will use the new host and port settings.
   * Default host and port are 'localhost' and 9312, respectively.
   *
   * @param {String} host
   * @param {Number | String} port
   */
  setConfig({ host = 'localhost', port = 9312 } = {}) {
    if (!isType('String', host) || !isType('Number | String', port)) {
      throw new TypeError('Invalid config object');
    }
    this.config = { host, port };
    this.SetServer(host, Number(port));
  }
  
  
  /**
   * Sets distributed retry count and delay.
   *
   * @description
   * On temporary failures searchd will attempt up to retryOption#count retries per agent.
   * retryOption#delay is the delay between the retries, in milliseconds. Retries are disabled by default.
   * Note that this call will not make the API itself retry on temporary failure; it only tells searchd to do so.
   * Currently, the list of temporary failures includes all kinds of connect() failures and maxed out (too busy)
   * remote agents.
   *
   * @param {{count: Number, delay?: Number}} retryOption
   */
  setRetriesOption(retryOption = {}) {
    let { count, delay = 0 } = retryOption;
    if (!isType('Number', count) || !isType('Number', delay)) {
      throw new TypeError('Invalid RetryOption object');
    }
    this.SetRetries(count, delay);
  }
  
  
  /**
   * Connects to searchd server, runs given search query with current settings, obtains and returns the result set.
   * @see http://sphinxsearch.com/docs/current.html#api-func-query
   *
   * @param {String | Object} queryString - given query string
   * @param {{
   *    query?: String,
   *    index?: String,
   *    comment?: String,
   *    filters?: Array,
   *    limits?: Object,
   *    matchMode?: Number,
   *    resultAsIds?: Boolean
   * }} options
   */
  query(queryString = "", options = {}) {
    [ queryString, options ] = this._ensureQueryArgs(queryString, options);
    let { index, comment, filters = [], limits, resultAsIds, matchMode } = options;
    this._resetFilters();
    this._addFilters(filters);
    this._setLimits(limits);
    this._setMatchMode(matchMode);
    return Promise.promisify(this.Query.bind( this ))(queryString, index, comment)
      .then(result => resultAsIds ? this.getIdsFromResult(result) : result)
      .tap(result => this.isDebugMode && console.info(result));
  }
  
  
  /**
   * Add a new query to the chain
   *
   * @see http://sphinxsearch.com/docs/current.html#api-func-addquery
   *
   * @param {String | Object} queryString - given query string
   * @param {{
   *    query?: String,
   *    index?: String,
   *    comment?: String,
   *    filters?: Array,
   *    limits?: Object,
   *    matchMode?: Number
   * }} options
   * @return {Number} a correspondent index from the array that will be returned
   */
  addQuery(queryString = "", options = {}) {
    [ queryString, options ] = this._ensureQueryArgs(queryString, options);
    let { index, comment, filters = [], limits, matchMode } = options;
    this._resetFilters();
    this._addFilters(filters);
    this._setLimits(limits);
    this._setMatchMode(matchMode);
    return this.AddQuery(queryString, index, comment);
  }
  
  
  /**
   * @param {Array<Object>} filters
   * @private
   */
  _addFilters(filters = []) {
    filters.forEach(this._addFilter.bind( this ));
  }
  
  
  /**
   * @see http://sphinxsearch.com/docs/current.html#api-func-setlimits
   *
   * @param {Number} offset
   * @param {Number} limit
   * @param {Number} maxMatches
   * @param {Number} cutoff
   * @private
   */
  _setLimits({ offset = DEFAULT_OFFSET, limit = DEFAULT_LIMIT
    , maxMatches = DEFAULT_MAX_MATCHES, cutoff = DEFAULT_CUTOFF } = {}) {
    this.SetLimits(offset, limit, maxMatches, cutoff);
  }
  
  
  /**
   * Set default limits for all queries
   *
   * @private
   */
  _resetLimits() {
    this._setLimits();
  }
  
  /**
   * @see http://sphinxsearch.com/docs/current.html#api-func-setfilter
   *
   * @param {String} attr
   * @param {Array<Number>} values
   * @param {Boolean?} exclude
   * @private
   */
  _addFilter({ attr, values, exclude = false } = {}) {
    if (!isType('[Number]', values)) {
      throw new TypeError('Values must be an array of numbers');
    }
    this.SetFilter(attr, values, exclude);
  }
  
  
  /**
   * @see http://sphinxsearch.com/docs/current.html#api-func-resetfilters
   *
   * @private
   */
  _resetFilters() {
    this.ResetFilters();
  }
  
  
  /**
   * @see http://sphinxsearch.com/docs/current.html#api-func-runqueries
   */
  runQueries() {
    return Promise.promisify(this.RunQueries.bind( this ))();
  }
  
  
  /**
   * Sets full-text query matching mode, as described in Section 5.1, “Matching modes” from docs.
   * Parameter must be a constant specifying one of the known modes.
   * @see http://sphinxsearch.com/docs/current.html#api-func-setmatchmode
   *
   * @param {Number} mode
   */
  _setMatchMode(mode) {
    this.SetMatchMode(mode);
  }
  
  /**
   * Get ids from `macthes` array
   *
   * @param {Object} result
   * @return {Array<Number>}
   */
  getIdsFromResult(result = {}) {
    if (!isType('Object', result)) {
      throw new TypeError('Result must be an object');
    } else if (!result.hasOwnProperty('matches')) {
      return [];
    }
    return result.matches.map(match => match && match.id)
      .filter(id => isType('Number', id));
  }
  
  
  /**
   * Enables debug mode
   *
   * @param {Boolean} mode
   */
  setDebugMode(mode = true) {
    this.isDebugMode = mode;
  }
  
  
  /**
   * Ensure arguments for query function
   * @param {String | Object} queryString
   * @param {Object} options
   * @return {Array<String | Object>}
   * @private
   */
  _ensureQueryArgs(queryString, options) {
    if (isType('Object', queryString)) {
      if (!isType('String', queryString.query)) {
        throw new TypeError('Query must be a string');
      }
      options = queryString;
      queryString = options.query;
      delete options.query;
    }
    let defaultOptions = {
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
    return [ queryString, deap.merge(options, defaultOptions) ];
  }
  
  
  /**
   * @param {String} str
   * @return {Promise.<TResult>|*}
   * @private
   */
  async _test(str = 'works') {
    console.log('Waiting...');
    await Promise.delay(500);
    console.log('Done!');
    return Promise.delay(500).then(() => console.log('Resolved:', str));
  }
}

module.exports = Sphinx;