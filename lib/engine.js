function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } } function _next(value) { step("next", value); } function _throw(err) { step("throw", err); } _next(); }); }; }

const fs = require('fs-extra');

const params = require('./params');

const engine =
/*#__PURE__*/
function () {
  var _ref = _asyncToGenerator(function* (argv, config) {
    const cwd = config.cwd,
          templates = config.templates,
          logger = config.logger;
    const args = yield params(templates, argv);
    const generator = args.generator,
          action = args.action,
          actionfolder = args.actionfolder;
    logger.log(args.dry ? '(dry mode)' : '');

    if (!generator) {
      throw new Error('please specify a generator.');
    }

    if (!action) {
      throw new Error(`please specify an action for ${generator}.`);
    }

    logger.log(`Loaded templates: ${templates.replace(cwd + '/', '')}`);

    if (!(yield fs.exists(actionfolder))) {
      throw new Error(`cannot find action '${action}' for generator '${generator}' (looked for ${generator}/${action} in ${templates}).`);
    } // lazy loading these dependencies gives a better feel once
    // a user is exploring hygen (not specifying what to execute)


    const execute = require('./execute');

    const render = require('./render');

    yield execute((yield render(args)), args, config);
  });

  return function engine(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();

module.exports = engine;