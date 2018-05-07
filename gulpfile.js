var gulp = require("gulp");
var ts = require("gulp-typescript");
var tsProject = ts.createProject("tsconfig.json");

var dts_gen = require('dts-generator').default;

gulp.task("default", function () {
    dts_gen({
        name: '@ellcrys',
        baseDir: 'src/',
        project: './',
        out: 'jutsu.d.ts'
    });
    return tsProject.src()
        .pipe(tsProject())
        .js.pipe(gulp.dest("dist/@ellcrys"));
});
