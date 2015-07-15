module.exports = function (grunt) {
  "use strict"

  grunt.initConfig(
    { jshint: { files: ["Gruntfile.js", "src/**/*.js", "test/**/*.js"]
              , options: { globals: { jQuery: true }
                         , asi: true
                         , laxcomma: true
                         }
              }
    , pkg: grunt.file.readJSON("package.json")
    , concat: { options: { separator: ";" }
              , dist: { src: ["src/**/*.js"]
                      , dest: "dist/<%= pkg.name %>.js"
                      }
              }
    , uglify: { options: { banner: "/*! <%= pkg.name %> <%= grunt.template.today('dd-mm-yyyy') %> */\n" }
              , dist: { files: { "dist/<%= pkg.name %>.min.js": ["<%= concat.dist.dest %>"] } }
              }
    , watch: { files: ["<%= jshint.files %>"]
             , tasks: ["jshint", "qunit"]
             }
    , bower_concat:
      { options: { separator: ";" }
      , all: { dest: "dist/_bower.js"
             , cssDest: "dist/_bower.css"
             , mainFiles: { bootstrap: [ "dist/css/bootstrap.min.css"
                                       , "dist/js/bootstrap.min.js"
                                       ]
                          , angular: "angular.min.js"
                          , jquery: "dist/jquery.min.js"
                          }
             }
      }
    , clean: { dist: ["dist/**/*", "!dist/restheart.jar"] }
    , copy: { restheart: { files: [ { expand: true
                                    , src: ["etc/*"]
                                    , dest: "dist/"
                                    }
                                  ]
                         }
            }
    })

  grunt.loadNpmTasks("grunt-contrib-uglify")
  grunt.loadNpmTasks("grunt-contrib-jshint")
  grunt.loadNpmTasks("grunt-contrib-watch")
  grunt.loadNpmTasks("grunt-contrib-concat")
  grunt.loadNpmTasks("grunt-bower-concat")
  grunt.loadNpmTasks("grunt-contrib-clean")
  grunt.loadNpmTasks("grunt-contrib-copy")

  grunt.registerTask("test", ["jshint"])
  grunt.registerTask("default", [ "jshint"
                                , "copy"
                                , "concat"
                                , "uglify"
                                , "bower_concat"
                                ])
}
