const slug = require('slug');

exports.slugTextConverter = text => slug(text).trim();
