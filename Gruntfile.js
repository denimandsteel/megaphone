module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
  concat: {
    options: {
      separator: ';'
    },
    dist: {
      src: [
        'js/jquery-1.10.1.min.js',
        'js/jquery.csv.js',
        'js/fastclick.min.js',
        'js/jquery.cookie.js',
        'js/megaphone.js',
      ],
      dest: 'js/megaphone.min.js'
    }
  }
});

  grunt.loadNpmTasks('grunt-contrib-concat');

  // Default task(s).
  grunt.registerTask('default', ['concat']);

};
