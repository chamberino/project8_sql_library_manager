var express = require('express');
var router = express.Router();

/* GET sandbox listing. */
router.get('/', function(req, res, next) {
  const names = [
    {First: 'Paul', Last: 'Jones'},
    {First: 'David', Last: 'Smith'},
    {First: 'Jason', Last: 'Camp'},
    {First: 'Bella', Last: 'Jones'}
  ]
  res.render('sandbox', {names});
});

module.exports = router;
