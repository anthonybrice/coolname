/**
 * File: import/import.js
 * Desc: A program that reads and imports media files into mongodb
 */

"use strict"

var assert = require("assert")
  , dir = require("node-dir")
  , fs = require("fs")
  , mm = require("musicmetadata")
  , mongodb = require("mongodb")
  , parseArgs = require("minimist")
  , path = require("path")


//////////
// Main //
//////////

var argv = parseArgs( process.argv.slice(2)
                    , { "boolean": [ "d", "debug" ] }
                    )

var debug = argv["d"] !== false || argv["debug"] !== false
if (debug) console.log("Debug enabled.")

var url = "mongodb://localhost:27017/coolname"
  , db
  , coll
mongodb.MongoClient.connect(url, function (err, database) {
  if (err) throw err
  console.log("Connected to coolname")
  db = database
  coll = db.collection("coolname")
})

while (coll === undefined) ;
// MongoClient.connect(url, function (err, db) {
//   assert.equal(null, err)
//   if (debug) console.log("Connected to mongodb/coolname")
//   mdb = db
// })

var dirArg = argv._.length >= 1
           ? argv._[0]
           : process.cwd()
dirArg = path.resolve(process.cwd(), dirArg)

if (debug) {
  console.log("Beginning recursive descent from " + dirArg)
}

dir.files(dirArg, handleFiles)

///////////////
// Functions //
///////////////

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
    metadata.filepath = file
    coll.insertOne(metadata)
  })
}
