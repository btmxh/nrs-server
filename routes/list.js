var express = require('express');
var papa = require('papaparse');
var fs = require('fs')
var router = express.Router();
var request = require('cached-request')(require('request'))
request.setValue('ttl', 10000);

/* GET home page. */
router.get('/', function(req, res, next) {
  request.get({
    url: 'https://github.com/ngoduyanh/nrs-impl-kt/releases/download/latest-master/nrs.csv',
  }, (err, r, data) => {
    data = papa.parse(data, {
      header: true,
      skipEmptyLines: true
    });
    res.render('list/index', {
      data: data.data,
      fields: data.meta.fields
    });
  });
});

module.exports = router;