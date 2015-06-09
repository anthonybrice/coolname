/**
 * File: import/import.js
 * Desc: A program that reads and imports media files into mongodb
 */

"use strict"

var fs = require("fs")
  , path = require("path")
  , mm = require("musicmetadata")
  , mdb = require("mongodb")
  , argv = require('minimist')(process.argv.slice(2))

var dir = argv._.length >= 1
        ? argv._[0]
        : process.cwd()

function handleMedia(file) {

}

/**
 * A callback for fs.readdir(). Adds MP3 and FLAC files to database and recurses
 * directories.
 */
function handleDirectory(err, files) {
  files.forEach(function (file) {
    fs.lstat(file, function (err, stats) {
      if (stats.isDirectory()) {
        fs.readdir(file, handleDirectory)
      } else if (stats.isFile()
                && (file.endsWith("mp3")
                   || file.endsWith("flac"))) {
        handleMedia(file)
      }
    })
  })
}

fs.readdir(dir, handleDirectory)
