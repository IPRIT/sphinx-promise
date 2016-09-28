'use strict';

var assert  = require('assert')
  , Sphinx  = require('../dist/js/sphinx-promise')
  , util    = require('util')
  , expect  = require('chai').expect;

describe('Sphinx', function() {
  describe('#setConfig()', function() {
    it('should set config object through constructor and be equal the original config', function() {
      let config = {
        host: 'localhost'
      };
      var sphinx = new Sphinx(config);
      assert.deepEqual({
        host: 'localhost',
        port: 9312
      }, sphinx.config);
    });
  
    it('should set config object and be equal the same object from the class constructor', function() {
      let config = {
        host: 'localhost',
        port: '9312'
      };
      var sphinx = new Sphinx();
      sphinx.setConfig(config);
      assert.deepEqual({
        host: 'localhost',
        port: '9312'
      }, sphinx.config);
    });
  });
  
  describe('#query()', function() {
    it('should send a query with default config and get a result with length equal 2', function() {
      var sphinx = new Sphinx();
      var query = '2056';
      return sphinx.query(query).then(result => {
        expect(result).to.have.property('matches').with.length(2);
      });
    });
  
    it('should send a query with filters and get a result with length equals 1', function() {
      var sphinx = new Sphinx();
      var query = '2';
      var filters = [{
        attr: 'authorid',
        values: [ 394 ]
      }];
      return sphinx.query(query, { filters }).then(result => {
        expect(result).to.have.property('matches').with.length(1);
      });
    });
  
    it('should send a query with options and get a result with length equals 6', function() {
      var sphinx = new Sphinx();
      var query = 'love';
      var filters = [{
        attr: 'authorid',
        values: [ 854, 1557 ]
      }, {
        attr: 'categoryid',
        values: [ 2 ],
        exclude: false
      }];
      let [ index, comment ] = [ 'editions', 'Test query' ];
      return sphinx.query(query, { index, comment, filters }).then(result => {
        expect(result).to.have.property('matches').with.length(6);
      });
    });
  });
  
  describe('#runQueries()', function() {
    it('should send multiple queries as queries chain and get a correct result', function() {
      var sphinx = new Sphinx();
      let queries = [{
        query: '2056'
      }, {
        query: '2',
        filters: [{
          attr: 'authorid',
          values: [ 394 ]
        }]
      }, {
        query: 'love',
        filters: [{
          attr: 'authorid',
          values: [ 854, 1557 ]
        }, {
          attr: 'categoryid',
          values: [ 2 ],
          exclude: false
        }],
        index: 'editions',
        comment: 'Test query 2'
      }];
      let correspondentIndexes = queries.map(sphinx.addQuery.bind( sphinx ));
      let expectedValues = [ 2, 1, 6 ];
      return sphinx.runQueries().then(results => {
        expect(results).to.have.length(3);
        correspondentIndexes.forEach(index => {
          let result = results[ index ];
          expect(result).to.have.property('matches').with.length(expectedValues[ index ]);
        });
        return results;
      }).spread((...args) => {
        expect(args).to.have.length(3);
        correspondentIndexes.forEach(index => {
          let result = args[ index ];
          expect(result).to.have.property('matches').with.length(expectedValues[ index ]);
        });
        return args;
      }).map((result, index) => {
        expect(result).to.have.property('matches').with.length(expectedValues[ index ]);
      });
    });
  });
  
  describe('#_setLimits()', function() {
    it('should send a query with limits and get correct matches\' length', function() {
      var sphinx = new Sphinx();
      let query = {
        query: 'love',
        filters: [{
          attr: 'authorid',
          values: [ 854 ]
        }, {
          attr: 'categoryid',
          values: [ 2 ],
          exclude: false
        }],
        index: '*',
        comment: 'Test query 3',
        limits: {
          offset: 1,
          limit: 4
        }
      };
      return sphinx.query(query).then(result => {
        expect(result).to.have.property('matches').with.length(4);
        expect(result).to.have.property('total_found', 6);
      });
    });
  });
  
  describe('#getIdsFromResult()', function() {
    it('should send a query and receive only matched ids', function() {
      var sphinx = new Sphinx();
      var query = 'love';
      var filters = [{
        attr: 'authorid',
        values: [ 854, 1557 ]
      }, {
        attr: 'categoryid',
        values: [ 2 ],
        exclude: false
      }];
      let [ index, comment ] = [ 'editions', 'Test query 4' ];
      let resultAsIds = true;
      return sphinx.query(query, { index, comment, filters, resultAsIds }).then(result => {
        expect(result).to.have.not.property('matches');
        expect(result).to.have.length(6);
      });
    });
  });
  
  describe('#setDebugMode()', function() {
    it('should send a query, output logs in console and get correct results', function() {
      var sphinx = new Sphinx();
      sphinx.setDebugMode();
      var query = 'love';
      var filters = [{
        attr: 'authorid',
        values: [ 854, 1557 ]
      }];
      let [ index, comment ] = [ '*', 'Test query 5' ];
      let resultAsIds = true;
      return sphinx.query(query, { index, comment, filters, resultAsIds }).then(result => {
        expect(result).to.have.length(8);
      });
    });
  });
});