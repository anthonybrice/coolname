/**
 * File: import/import.js
 * Desc: A program that reads and imports media files into mongodb
 */

"use strict"

var dir = require("node-dir")
  , mm = require("musicmetadata")
  , mdb = require("mongodb")
  , parseArgs = require("minimist")

var argv = parseArgs( process.argv.slice(2)
                    , { "boolean": [ "d", "debug" ] }
                    )

var debug = argv["d"] !== undefined || argv["debug"] !== undefined
if (debug) console.log("Debug enabled.")

var dirArg = argv._.length >= 1
           ? argv._[0]
           : process.cwd()

function handleMedia(file) {
  if (debug) console.log(file + " is media")
}

if (debug) {
  console.log("Beginning recursive descent from " + dirArg)
}

dir.files(dirArg, function (err, files) {
  if (err) throw err
  if (debug) console.log(files)
})
