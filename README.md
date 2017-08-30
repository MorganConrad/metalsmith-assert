[![Build Status](https://secure.travis-ci.org/MorganConrad/metalsmith-assert.png)](http://travis-ci.org/MorganConrad/metalsmith-assert)
[![License](http://img.shields.io/badge/license-MIT-A31F34.svg)](https://github.com/MorganConrad/metalsmith-assert)
[![NPM Downloads](http://img.shields.io/npm/dm/metalsmith-assert.svg)](https://www.npmjs.org/package/metalsmith-assert)
[![Known Vulnerabilities](https://snyk.io/test/github/morganconrad/metalsmith-assert/badge.svg)](https://snyk.io/test/github/morganconrad/metalsmith-assert)


# metalsmith-assert
A [Metalsmith](http://www.metalsmith.io/) plugin for testing the file objects with Node's [assert](https://nodejs.org/api/assert.html) module.  

### Usage

Install as usual,  `npm install metalsmith-assert`.

Javascript:  `use(metalsmith-assert(assertions, options))`

CLI: You'll lose a few options since it can't support functions.

By default, **metalsmith-assert** will console.log all AssertionErrors and a summary line.
It then calls `done(error)` with the last AssertionError (if any) or `null` if all is well.

#### Assertions

**assertions** should be an object containing objects of the following format:

    testname : {  // used for the message
      assert:     // which method of assert to call, default -> "ok".  See below.
      actual:     // if a string, the use fileData[actual],
                  // special case: if '.', use fileData.contents.toString()
                  // else call actual(fileData, filePath, metalsmith)
      expected:   // if a string use it
                  // else call expected(fileData, filePath, metalsmith)
                  // note: this field is ignored if assert is "ok"
    }

##### Legal values for assert method are all methods from [assert](https://nodejs.org/api/assert.html) that take "actual" as the first argument.

 - deepEqual(actual, expected, ...)
 - deepStrictEqual(actual, expected, ...)
 - equal(actual, expected, ...)
 - notDeepEqual(actual, expected, ...)
 - notDeepStrictEqual(actual, expected, ...)
 - notEqual(actual, expected, ...)
 - notStrictEqual(actual, expected, ...)
 - ok(actual, ...) (the default method)
 - strictEqual(actual, expected, ...)

**Be precise in your spelling and capitalization.**  You can also use an array of objects, in which case the testname will be the less informative "test N".


#### Options (all default to null/false)

**options.quiet**  Don't log individual failures, nor the summary of passed/failed.

**options.continueBuildOnError** Always call `done(null)` even if there was a failure.

 - If you enable _both_ quiet and continueBuildOnError this module is useless.  :-)

**options.disable** a quick way to turn metalsmith-assert off - it will immediately call done().

**options.fileFilter** determines which files will be included
 - if missing, include all files.
 - if a string or Regex, only include matching filePaths.
 - if a user-provided-function, include the file when `filter(filePath, data, metalsmith)` returns true.  
 _e.g._ If you want to use [multimatch](https://www.npmjs.com/package/multimatch), pass something like `function(filePath) { return multimatch([filePath], ["blogs/**", ...])[0] };`


### Examples

To verify that every file has a title, has a tag === "vacation", and the img is a svg file

    .use(metalsmith-assert({
          "title exists" : { actual: "title"},
          "tag === vacation" : { assert: "equal", actual: "tag", expected: "vacation" },
          "image is svg" : { actual: function(data) { return /\.svg$/.test(data.img); }
        } ) )



### Notes, Todos, and Caveats

Be precise in your spelling and capitalization!
