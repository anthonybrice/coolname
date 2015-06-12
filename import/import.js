/**
 * File: import/import.js
 *
 * Desc: A program that reads and imports media files into mongodb. Space
 * requirement scales linearly on the number of files below the passed
 * directory, but that's only to make an array of all the filenames. Hopefully
 * that's reasonable.
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
                    , { "boolean": [ "d", "debug" ]
                      , "time": [ "t", "time" ]
                      }
                    )

var debug = argv["d"] !== false || argv["debug"] !== false
  , time = argv["t"] !== false || argv["time"] !== false
if (debug) console.log("Debug enabled.")
if (time) console.time("exec")

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

  dir.files(dirArg, handleFiles())
}

///////////////
// Functions //
///////////////

function handleFiles() {
  var numFiles
    , currNum = 0

  function fileIterator(err, files) {
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
          if (time) console.timeEnd("exec")
          db.close()
        }
      })
    })
  }

  return fileIterator
}
