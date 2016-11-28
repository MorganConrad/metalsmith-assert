var nodeAssert = require('assert');

module.exports = metalsmithAssert;

/**
 * Metalsmith plugin that prints the objects
 *
 * @param {Object} opts
 * @return {Function}
 */

function metalsmithAssert(assertions, options) {

   if (Array.isArray(assertions)) {
      var convertToHash = {};
      for (var i=0; i<assertions.length; i++)
         convertToHash["test " + i] = assertions[i];

      assertions = convertToHash;
   }

  options = normalize(options);

  return function(files, metalsmith, done) {

     if (options.disable)
        return done();

     var filesTested = 0;
     var failed = 0;
     var passed = 0;
     var lastError;
     try {
        Object.keys(files).forEach(function(filePath) {
           var fileData = files[filePath];
           if (options.fileFilter(filePath, fileData, metalsmith)) {
               filesTested++;
               Object.keys(assertions).forEach(function(testname) {
                  var v = assertions[testname];
                  var method = v['assert'] || 'ok';
                  var actual = v['actual'];
                  if (typeof actual === 'string') {
                     actual = (actual === '.') ? fileData.contents.toString() : fileData[actual];
                  }
                  else {
                     actual = actual(fileData, filePath, metalsmith);
                  }

                  var expected = v['expected'];
                  if (typeof expected === "function")
                     expected = expected(fileData, filePath, metalsmith);

                  var message = v['message'] || testname;
                  var message = filePath + ': test failed: ' + message;

                  try {
                     if ('ok' === method)
                        nodeAssert[method](actual, message);
                     else
                        nodeAssert[method](actual, expected, message);
                     passed++;
                  }
                  catch (e) {
                     if (!options.quiet)
                        console.log(e);
                     lastError = e;
                     failed++;
                  }

               });
            }
         });

         if (!options.quiet)
            console.log("metalsmith-assert processed " + filesTested + " files.  Passed tests = " + passed + "   Failed tests = " + failed);
         if (!options.continueBuildOnError)
            done(lastError);
         else
            done();

     }
     catch (err) {
        done(err);
     }
  };
}



/**
 * Normalize an `options` dictionary.
 *
 * @param {Object} options
 */

 function normalize(options){
   options = options || { };
   options.fileFilter = fileFilter(options.fileFilter);
   return options;
};


/* calculate file filter function */
function fileFilter(filter) {
  if (filter) {
     if (Array.isArray(filter)) {
        var mm = require('multimatch');
        return function(filePath) { return mm([filePath],filter); };
     }
     else if (typeof filter === 'string') {
        var regex = new RegExp(filter);
        return function(filePath) { return regex.test(filePath); }
     }
     else if (filter instanceof RegExp)
        return function(filePath) { return filter.test(filePath); }
     else   // must be a function itself
        return filter;
   }
   else // none, return "pass all"
      return function() { return true; };

}
