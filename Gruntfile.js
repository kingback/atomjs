module.exports = function (grunt) {
    
    "use strict";
    
    var path = require("path"),
        build = "build/",
        dist = "dist/";

    grunt.config.init({
        pkg: grunt.file.readJSON("package.json"),
        version: "<%= pkg.version %>",
        versionSuffix: "<%= pkg.version %>",
        headHash: "",
        headShortHash: "",

        jshint: {
            options: {
                boss: true,
                curly: true,
                eqeqeq: true,
                eqnull: true,
                expr: true,
                immed: true,
                noarg: false,
                smarttabs: true,
                trailing: true,
                undef: true,
                unused: true,
                latedef: true,
                newcap: true,
                sub: true,
                browser: true,
                evil: false,
                globals: {
                    define: false,
                    require: false,
                    requirejs: false,
                    namespace:false,
                    console:true,
                    _define:true,
                    module:false,
                    $:true
                }
            },
            atom: {
                files: {
                    src: [
                        "srcs/**/*.js"
                    ]
                }
            }
        },

        concat: {
            atom : {
                src : [
                    'srcs/**/*.js'
                ],
                dest: dist + "atom.js"
            }
        },
        
        uglify: {
            atom: {
                src: 'dist/atom.js',
                dest: build + 'atom-min.js'
            }
        },

        watch: {
            files: ['**/*.js', '**/*.html', '!dist/*', '!build/*'],
            tasks: ['default']
        }
    });

    // grunt plugins
    //grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks("grunt-contrib-concat");
    //grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask("default", ["concat", "uglify"]);
};
