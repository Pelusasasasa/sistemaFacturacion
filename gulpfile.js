
const {src, dest, watch , parallel} = require("gulp");
const sass = require('gulp-sass')(require('sass'));
const cssnano = require("cssnano")
const autoprefixer = require("autoprefixer")
const sourcemaps = require("gulp-sourcemaps")
const postcss = require("gulp-postcss")

const paths = {
    scss: 'src/scss/**/*.scss'
}

function css() {
    return src(paths.scss)
    .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(postcss([autoprefixer(),cssnano()]))
    // .pipe(postcss([autoprefixer()]))
    .pipe(sourcemaps.write('.'))
    .pipe(dest('./build/css'))
}

 function watchArchivos() {
     watch(paths.scss,css);
 }

exports.default = parallel(css,watchArchivos)

