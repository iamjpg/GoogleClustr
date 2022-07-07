const copy = require('copy');

copy('./dist/**/*', 'www', function (err, file) {
  // exposes the vinyl `file` created when the file is copied
});
