/**
 * File: import/import.js
 * Desc: A program that reads and imports media files into nodejs
 */

var fs = require("fs")
  , path = require("path")
  , mm = require("musicmetadata")
  , mdb = require("mongodb")
  , argv = require("argp")
             .createParser( { once: true } )
             .description("A program that reads and imports media"
                          + " into a mongodb instance.")
             .email("anthonybrice@latechiever.com")
             .body()
             .text(" Arguments:")
             .argument("FILE", { description: "Filepath at which to begin.\n"
                                              + "Defaults to current directory."
                               } )
             .help()
             .argv()
