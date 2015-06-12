/**
 * File: import/import.js
 *
 * Desc: A program that reads and imports media files into mongodb. Space
 * requirement scales linearly on the number of files below the passed
 * directory, but it's just to make an array of the filenames.
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

console.time("import")
var argv = parseArgs( process.argv.slice(2)
                    , { "boolean": [ "d", "debug" ] }
                    )

var debug = argv["d"] !== false || argv["debug"] !== false
if (debug) console.log("Debug enabled.")

var url = "mongodb://localhost"
  , db
  , coll
mongodb.MongoClient.connect(url, function (err, database) {
  assert.equal(null, err)
  if (debug) console.log("Connected to coolname.")
  db = database
  coll = db.collection("coolname")
  main()
})

function main() {
  var dirArg = argv._.length >= 1
             ? argv._[0]
             : process.cwd()
  dirArg = path.resolve(process.cwd(), dirArg)

  if (debug) {
    console.log("Beginning recursive descent from " + dirArg)
  }

  dir.files(dirArg, handleFiles)
}

///////////////
// Functions //
///////////////

/**
 * The number of files we expect to insert.
 */
var numFiles

/**
 * The current number of files inserted. handleMedia() uses this to determine if
 * it should close the connections or not. This seems to me a pretty ugly
 * solution, but I see no other way while keeping synchronous filesystem access,
 * which is essential to a decent exec time.
 */
var currNum = 0

/**
 * Iterates through `files` and adds each MP3 and FLAC file
 * to a mongodb database.
 */
function handleFiles(err, files) {
  assert.equal(null, err)
  numFiles = files.length
  files.forEach(function (file) {
    fs.lstat(file, function (err, stats) {
      assert.equal(null, err)
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
    assert.equal(null, err)
    metadata.filepath = file
    if (debug) console.log(metadata)
    coll.insertOne(metadata, function (err, r) {
      assert.equal(null, err)
      assert.equal(1, r.insertedCount)
      if (debug) console.log("In callback")
      currNum++
      if (currNum === numFiles) {
        console.timeEnd("import")
        db.close()
      }
    })
  })
}
