'use strict';

require('./index.js')
  .rebuild(function (err) {
    if (err) { console.error(err); }
    console.log('rebuild completed');
  });
