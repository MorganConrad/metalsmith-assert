var test = require('tape');
var msassert = require('../assert.js');

// setup - need to recreate these each time
function createFiles() {
   return {
      "file1.md" : {
         title: "title of file1.md",
         contents: new Buffer('Contents for file1.md   Lorem ipsum dolor'),
         img: "file1.svg"
      },
      "file2.html" : {
         title: "title of file2.html",
         contents: new Buffer('Contents for file2.html Lorem ipsum dolor'),
         img: "file2.svg"
      }
   }
};

// need this
function done(err) { if (err) throw err; }

var passesOnBoth = {
   "title exists" : { actual: "title"}
}

var failsOn1PassesOn2 = {
   "titleis2": { assert: "equal", actual: "title", expected: "title of file2.html" }
}

var failsOn2PassesOn1 = [{ assert: "notEqual", actual: ".", expected: "Contents for file2.html Lorem ipsum dolor" }];

var func_pass = [{ assert: "equal",
                   actual: function(data) { return data.title.length + data.img.length; },
                   expected: function(data, filePath) { return 18 + filePath.length; }
                }];

var func_fail = [{ assert: "equal",
                  actual: function(data) { return data.title.length + data.img.length + 99; },
                  expected: function(data, filePath) { return 18 + filePath.length; }
                   }];

test('basic', function(t) {
   var files = createFiles();
   t.doesNotThrow(function() { msassert( passesOnBoth, { quiet: true } )(files, null, done) } );
   t.doesNotThrow(function() { msassert( func_pass, { quiet: true } )(files, null, done) } );

   t.throws( function() { msassert( failsOn1PassesOn2, { quiet: true })(files, null, done) }, /titleis2/);
   t.throws( function() { msassert( failsOn2PassesOn1, { quiet: true })(files, null, done) }, /test 0/);
   t.throws( function() { msassert( func_fail, { quiet: true })(files, null, done) }, /file2/);

   t.end();
});


test('filefilter', function(t) {
   var files = createFiles();

   // test Regex and string
   t.doesNotThrow(function() { msassert( failsOn2PassesOn1, { quiet: true, fileFilter : /md$/})(files, null, done) });

   t.doesNotThrow(function() { msassert( failsOn1PassesOn2, { quiet: true, fileFilter: 'html$'})(files, null, done) });
   // test user provided function
   t.doesNotThrow(function() { msassert(failsOn2PassesOn1,
                                     { quiet: true,
                                       fileFilter: function(filePath){ return 'file1.md' === filePath}
                                    })(files, null, done) });

   t.end();
});


test('disable', function(t) {
   var files = createFiles();
   t.doesNotThrow(function() { msassert( failsOn1PassesOn2, { disable: true } )(files, null, done) } );

   t.end();
})
