/**
 * File: import/import.js
 * Desc: A program that reads and imports media files into mongodb
 */

"use strict"

var dir = require("node-dir")
  , fs = require("fs")
  , mm = require("musicmetadata")
  , mdb = require("mongodb")
  , parseArgs = require("minimist")
  , path = require("path")

/**
 * Main
 */
var argv = parseArgs( process.argv.slice(2)
                    , { "boolean": [ "d", "debug" ] }
                    )

var debug = argv["d"] !== false || argv["debug"] !== false
if (debug) console.log("Debug enabled.")

var dirArg = argv._.length >= 1
           ? argv._[0]
           : process.cwd()

if (debug) {
  console.log("Beginning recursive descent from " + dirArg)
}

dir.files(dirArg, handleFiles)

/**
 * Iterates through `files` and adds each MP3 and FLAC file
 * to a mongodb database.
 */
function handleFiles(err, files) {
  if (err) throw err
  files.forEach(function (file) {
    fs.lstat(file, function (err, stats) {
      if (err) throw err
      if (!stats.isFile()) return
      var ext = path.extname(file)
      if (ext === ".mp3" || ext === ".flac") handleMedia(file)
    })
  })
}

/**
 * Adds `file` to a mongodb instance.
 */
function handleMedia(file) {
  var parser = mm(fs.createReadStream(file), function (err, metadata) {
    if (err) throw err
    if (debug) console.log("Prepping to add " + metadata)
  })
}
