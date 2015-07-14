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
                    , { alias: { d: "debug"
                               , c: "count"
                               , t: "time"
                               }
                      }
                    )

var debug = argv.d === true
  , time = argv.t === true
  , count = argv.c === true
if (debug) console.log("Debug enabled.")
if (time) console.time("exec")

var url = "mongodb://localhost/music"
  , db
  , coll
mongodb.MongoClient.connect(url, function (err, database) {
  assert.equal(null, err)
  if (debug) console.log("Connected to database.")
  db = database
  coll = db.collection("songs")
  main()
})

function main() {
  var dirArg = argv._.length >= 1
             ? path.resolve(process.cwd(), argv._[0])
             : process.cwd()

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

  /**
   * Iterates an array of filepaths and adds the MP3 and FLAC files
   * to the collection. We return this function from the closure.
   */
  function fileIterator(err, files) {
    assert.equal(null, err)
    if (count) console.log(files.length + " total files")
    files = files.filter(function (file) {
      var keep = fs.lstatSync(file).isFile()
              && ( path.extname(file) === ".mp3"
                || path.extname(file) === ".flac"
                || path.extname(file) === ".m4a"
                 )
      if (debug) console.log(file + ": " + keep)
      return keep
    })

    numFiles = files.length
    if (count) console.log(files.length + " media files")

    files.forEach(function (file) {
      handleMedia(file)
    })
  }

  /**
   * Takes an MP3 or FLAC file and adds it to the collection.
   */
  function handleMedia(file) {
    var parser = mm(fs.createReadStream(file), function (err, metadata) {
      assert.equal(null, err)
      metadata.filepath = file
      if (debug) console.log(metadata)
      if (count) {
        currNum++
        if (debug) console.log("Visited file " + currNum + ": " + file)
        if (currNum === numFiles) {
          if (time) console.timeEnd("exec")
          db.close()
          process.exit(0)
        }
        return
      }
      coll.insertOne(metadata, function (err, r) {
        assert.equal(null, err)
        assert.equal(1, r.insertedCount)
        currNum++
        if (debug) console.log("Inserted record " + currNum + ": " + file)
        if (currNum === numFiles) {
          if (time) console.timeEnd("exec")
          db.close()
        }
      })
    })
  }

  return fileIterator
}
