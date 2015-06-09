/**
 * File: import/import.js
 * Desc: A program that reads and imports media files into mongodb
 */

"use strict"

var fs = require("fs")
  , path = require("path")
  , mm = require("musicmetadata")
  , mdb = require("mongodb")
  , parseArgs = require("minimist")

var argv = parseArgs(process.argv.slice(2),
                    { "boolean": [ "d", "debug" ] } )

var debug = argv["d"] !== undefined || argv["debug"] !== undefined
if (debug) console.log("Debug enabled.")

var dir = argv._.length >= 1
        ? argv._[0]
        : process.cwd()

function handleMedia(file) {
  if (debug) console.log(file + " is media")
}

/**
 * A callback for fs.readdir(). Adds MP3 and FLAC files to database and recurses
 * directories.
 */
function handleDirectory(err, files) {
  if (err) {
    console.log(err)
    process.exit()
  }
  files.forEach(function (file) {
    fs.lstat(file, function (err, stats) {
      if (err) return
      if (stats.isDirectory()) {
        if (debug) console.log(file + " is a directory")
        fs.readdir(file, handleDirectory)
        return
      } else if (stats.isFile()) {
        var re = /(?:\.([^.]+))?$/
          , ext = re.exec(file)
        if (ext === "mp3" || ext === "flac") handleMedia(file)
      }
    })
  })
}

if (debug) {
  console.log("Beginning recursive descent from " + dir)
}
fs.readdir(dir, handleDirectory)
