libs = require('./libs')

module.exports = Object.assign(
  {
    'Collection': require('spark-collection')
  },
  libs,
  require('spark-properties'),
  require('spark-binding')
)