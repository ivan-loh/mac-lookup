# mac-lookup

[![NPM](https://nodei.co/npm/mac-lookup.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/mac-lookup/)

[![Build Status](https://travis-ci.org/scr1p7ed/mac-lookup.svg?branch=master)](https://travis-ci.org/scr1p7ed/mac-lookup)

<span class="badge-npmversion">
  <a href="https://npmjs.org/package/mac-lookup" title="View this project on NPM"><img src="https://img.shields.io/npm/v/mac-lookup.svg" alt="NPM version" /></a>
</span>
<span class="badge-npmdownloads">
  <a href="https://npmjs.org/package/mac-lookup" title="View this project on NPM"><img src="https://img.shields.io/npm/dm/mac-lookup.svg" alt="NPM downloads" /></a>
</span>

A [node](http://nodejs.org)  module to fetch, parse, and lookup entries from the IEEE's OUI database. Adapted from [node-ieee-oui-lookup](https://github.com/mrose17/node-ieee-oui-lookup).



Install
-------

```js
npm install mac-lookup
```


Usage
-----

```js
// Config is optional
var config = {
  sql: './oui.db',
  txt: './oui.txt',
  url: 'http://linuxnet.ca/ieee/oui.txt'
}

var mac = require('mac-lookup')(config);

// if defining a custom config, make sure to rebuild at least once to generate sqlite3 db
mac.rebuild();

// ...
```

To lookup a MAC prefix:
```js
mac.lookup('00:00:00', function (err, name) {
  if (err) throw err;
  // name will be null if not found.
  console.log('00:00:00 -> ' + name);
});
```

You can also look up the full mac address with or without full dash, dot, or colon notation:
```js
mac.lookup('0000.0000.0000',function (err, name) {
  if (err) throw err;
  // name will be null if not found.
  console.log('0000.0000.0000 -> ' + name);
});)
```

If you think the internal DB is outdated, you can rebuild it from the latest [file](http://linuxnet.ca/ieee/oui.txt) with:
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


#### Additional Notes
our csv file for ouis are obtained from here
```
wget https://standards.ieee.org/develop/regauth/oui/oui.csv
```
