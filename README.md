node-ieee-oui-lookup
====================

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
