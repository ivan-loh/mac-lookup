# mac-lookup

[![NPM](https://nodei.co/npm/mac-lookup.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/mac-lookup/)

[![Build Status](https://travis-ci.org/ivan-loh/mac-lookup.svg?branch=master)](https://travis-ci.org/ivan-loh/mac-lookup) [![Dependencies Status](https://david-dm.org/ivan-loh/mac-lookup.svg)](https://david-dm.org/ivan-loh/mac-lookup.svg)

A [node](http://nodejs.org)  module to fetch, parse, and lookup entries from the IEEE's OUI database. Adapted from [node-ieee-oui-lookup](https://github.com/mrose17/node-ieee-oui-lookup).



Install
-------

```js
npm install mac-lookup
```



Usage
-----

```js
var mac = require('mac-lookup');
```

To lookup a MAC prefix:
```js
mac.lookup('00:00:00', function (err, name) {
  if (err) throw err;
  // name will be null if not found.
  console.log('00:00:00 -> ' + name);
});
```

If you think the internal DB is outdated, you can rebuild it from the latest [file](http://standards.ieee.org/develop/regauth/oui/oui.txt) with:
```js
mac.rebuild(function (err) {
  if (err) throw err;
  console.log('rebuild completed');
});
```

Iterate thru the entire db
```js

function done() { console.log('done'); }

mac.each(function (err, result) {
  console.log('oui',  result.oui);
  console.log('name', result.name);
}, done);

```