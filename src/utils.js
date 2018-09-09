const chalk = require('chalk');

const messages = {
  noNameAttribute:
    'Some factory does not have NAME attribute. We recommend setting it in order to identify this factory later.',
  checkChangedOnUnexisting:
    'Unable to check if object has changed as it does not exist in the database',
  attributesFromDatabaseOnUnexisting:
    'Unable to retrieve attributes from database as object does not exist in the database',
};

const warning = message => console.log(chalk.bold.redBright(message));

exports.messages = messages;
exports.warning = warning;
