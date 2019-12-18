const log4js = require('log4js');
log4js.configure({
  appenders: {
    console: {
      type: 'console',
    },
    log_file: {
      type: 'file',
      filename: 'logs/logs.log',
      maxLogSize: 104800,
      backups: 10
    }
  },
  categories: {default: {appenders: ['console', 'log_file'], level: 'all'}}
});
const logger=log4js.getLogger('log_file');

// logger.trace('Entering cheese testing');
// logger.debug('Got cheese.');
// logger.info('Cheese is Comté.');
// logger.warn('Cheese is quite smelly.');
// logger.error('Cheese is too ripe!');
// logger.fatal('Cheese was breeding ground for listeria.');
// logger.trace('Entering cheese testing');
module.exports=logger;
