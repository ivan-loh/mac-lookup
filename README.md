node-ieee-oui-lookup
====================

A [node](http://nodejs.org)  module to fetch, parse, and lookup entries from the IEEE's OUI database. Adapted from [node-ieee-oui-lookup](https://github.com/mrose17/node-ieee-oui-lookup).


Install
-------

    npm install mac-lookup

Usage
-----

    var mac = require('mac-lookup');

To lookup a MAC prefix:

    mac.lookup('00-00-00', function (err, name) { ... });

name will be null if it's not found.

To rebuild the mac address internal db:

    mac.rebuild(function (err) { ... });


Example
-------

    mac.lookup('00:01:02', function(err, name) {
      if (err)
        console.log('00:01:02: ' + err.message);
      else
        console.log('00:01:02 -> ' + name);
    });
