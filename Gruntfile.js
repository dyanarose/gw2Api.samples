module.exports = function(grunt){

  grunt.loadNpmTasks('grunt-wiredep');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-react');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-bower');
  grunt.loadNpmTasks('grunt-contrib-clean');

  grunt.initConfig({
    buildDir: 'dist',
    watch:{
      files: ['bower_components/*'],
      tasks: ['wiredep']
    },
    wiredep:{
      task:{
        src: ['index.html']
      }
    },
    react: {
      dynamic_mappings: {
        files: [
          {
            expand: true,
            cwd: 'source/jsx',
            src: ['**/*.jsx'],
            dest: '<%= buildDir %>/scripts',
            ext: '.js'
          }
        ]
      }
    },
    clean: {
      dist: 'dist'
    },
    copy: {
      main: {
        files: [
          // includes files within path
          {expand: true, src: ['*.html'], dest: '<%= buildDir %>/', filter: 'isFile'},
          // includes files within path and its sub-directories
          {expand: true, src: ['scripts/**'], dest: '<%= buildDir %>/'}
        ],
      },
    },
    bower: {
      dev: {
        dest: '<%= buildDir %>/bower_components',
        options: {
          expand: true,
          packageSpecific: {
            'bootstrap': {
              files: ['dist/css/bootstrap.css',
              'dist/fonts/*']
            }
          }
        }
      }
    }
  });
  grunt.registerTask('default', 'build');
  grunt.registerTask('build',[
    'clean',
    'react',
    'bower',
    'wiredep',
    'copy'
  ]);
  grunt.registerTask('changes',[
    'watch'
  ])
};
