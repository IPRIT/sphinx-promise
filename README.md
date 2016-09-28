# sphinx-promise [![NPM version][npm-image]][npm-url] [![dependencies Status][depstat-image]][depstat-url] [![devDependencies Status Status][deVdepstat-image]][deVdepstat-url]

Graceful native [bluebird](http://bluebirdjs.com/docs/getting-started.html)-promise-based javascript implementation of the standard [Sphinx](http://sphinxsearch.com/) API for fulltext searching based on top of [sphinxapi](https://www.npmjs.com/package/sphinxapi)

![](https://4.bp.blogspot.com/-55kzheOMWfg/VzYvr6MC4rI/AAAAAAAAAP8/fZFAnstd93cqNr7f8E7ESN9TpnmgbrWoACLcB/s1600/%25D1%2581%25D0%25BA%25D0%25B0%25D1%2587%25D0%25B0%25D0%25BD%25D0%25BD%25D1%258B%25D0%25B5%2B%25D1%2584%25D0%25B0%25D0%25B9%25D0%25BB%25D1%258B%2B%25282%2529.png)  ![](http://www.tivix.com/uploads/images/logo_1.focus-none.max-256x256_6cCD0N8.png)


## Install

* Install module from npm:
```
$ npm install --save sphinx-promise
```

* [Setup](http://sphinxsearch.com/docs/current.html#confgroup-source) your sphinx configuration file and run it

## Usage

Include:

```js
var Sphinx = require('sphinx-promise');
```
or if you prefer es6/7 syntax:

```js
import Sphinx from 'sphinx-promise';
```

Create instance:
```js
const sphinx = new Sphinx(); // it uses default host (localhost) & port (9312)
```
or if you wanna set up your server configuration add:
```js
const sphinx = new Sphinx({
	host: 'localhost', // default sphinx host
	port: 9312 // default sphinx TCP port
});
```
or
```js
const sphinx = new Sphinx();
sphinx.setConfig({
	host: 'localhost',
	port: 9312
});
```

### Basic usage:

```js
let query = 'word | anotherword';

sphinx.query(query).then(result => {
	console.log(result);
}).catch(console.error.bind(console));
```
or in es7:
```js
let query = 'word | anotherword';

let result = await sphinx.query(query);
console.log(result);
```

### Setting up filters
You can learn how to [set up a filter](http://sphinxsearch.com/docs/current.html#api-func-setfilter) from [the official documentation](http://sphinxsearch.com/docs/current.html).

```js
let query = 'computer';
let filters = [{
	attr: 'authorid', // attribute's name
	values: [ 2, 12, 34 ], // multi-valued type in Sphinx
	exclude: false // optional parameter, default is false
}];

sphinx.query(query, { filters }).then(result => {
	console.log(result.matches); // array of objects with document's ids
});
```
or multiple filters:
```js
let query = 'love';
let filters = [{
	attr: 'authorid', // attribute's name
	values: [ 2, 12, 34 ], // multi-valued type in Sphinx
	exclude: false // optional parameter, default is false
}, {
	attr: 'categoryid',
	values: [ 1321 ]
}];

sphinx.query(query, { filters }).then(result => {
	console.log(result.matches); // array of objects with document's ids
});
```
you can include query string into your option's object just like here:
```js
sphinx.query({ query, filters }).then(result => {
	console.log(result.matches); // array of objects with document's ids
});
```
Another query example with specifying`index`or `comment`(for logs):
```js
let index = 'editions'; // indexes, default is '*'
let comment = 'Debug query'; // you can find the string in your query logs

sphinx.query({ query, filters, index, comment }).then(result => {
	console.log(result.matches); // array of objects with document's ids
});
```
If you want get only array of ids from a result, just add the `resultAsIds: true` boolean parameter.
```js
sphinx.query({ query, filters, resultAsIds: true }).then(result => {
	console.log(result); // `result` is array of ids now
});
```

### Chain queries
This module supports chains of queries on top of promises as well.

Basic usage of `addQuery` & `runQueries`:
```js
let queries = [{
	query: 'cats'
}, {
	query: 'cars',
	filters: [{
	    attr: 'authorid',
	    values: [ 394 ]
	}]
}, {
	query: 'sleepy foxes',
	filters: [{
	    attr: 'authorid',
	    values: [ 854, 1557 ]
	}, {
	    attr: 'categoryid',
	    values: [ 2 ],
	    exclude: false
	}],
	index: 'main, delta',
	comment: 'Test query'
}];

queries.forEach(query => sphinx.addQuery(query));
```
`Sphinx#addQuery` returns an index from array that will be returned after `Sphinx#runQueries` execution.

To get results just invoke `runQueries` function:
```js
sphinx.runQueries().then(results => {
	// `results` are array in the appropriate order
})
```
More complex example:
```js
sphinx.runQueries().tap(results => {
	console.log('Results length:', results.length); // just log the length of result & go on
}).map(result => {
	return sphinx.getIdsFromResult(result); // get an array of ids from single result
}).spread((first, second, third) => {
	// `first`, `second` & `third` are "smeared" results now
	// each argument is an array of ids
})
```
### Setting up limits & match mode

```js
const sphinx = new Sphinx();
const params = {
    index: 'books',
	limits: {
	    offset: 0, // default is 0
	    limit: 100 // default is 20 as documented
	},
	matchMode: Sphinx.SPH_MATCH_ANY
}

/**
 * e. g. getting user from db, search books by user's name
 * and then collate books by their ids
 */
async function getUsersBooks(userId) {
    let user = await User.findOne(userId);
    let result = await sphinx.query(user.name, params);
    let ids = sphinx.getIdsFromResult(result); // or include `resultAsIds: true` in options
    return Books.findAll({
        where: {
            id: {
                $in: ids
            }
        }
    });
}

try {
    let books = await getUsersBooks(1);
} catch (error) {
    console.error(error); // catching errors
}
```

## Todo

* Implement other methods such as `setSelect`, `addFilterString`, `addFilterRange` etc.
* Add a full description about each method from [documentation](http://sphinxsearch.com/docs/current.html).

## Tests

```js
$ mocha
```

## Also

sphinxapi [https://github.com/Inist-CNRS/node-sphinxapi](https://github.com/Inist-CNRS/node-sphinxapi)


## License

[MIT](https://github.com/IPRIT/sphinx-promise/LICENCE.md) © 2016 Alexander Belov


[npm-url]: https://www.npmjs.com/package/sphinx-promise
[npm-image]: https://img.shields.io/npm/v/sphinx-promise.svg

[depstat-url]: https://david-dm.org/IPRIT/sphinx-promise
[depstat-image]: https://img.shields.io/david/IPRIT/sphinx-promise.svg

[deVdepstat-url]: https://david-dm.org/IPRIT/sphinx-promise?type=dev
[deVdepstat-image]: https://img.shields.io/david/dev/IPRIT/sphinx-promise.svg
