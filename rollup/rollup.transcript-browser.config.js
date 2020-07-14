import nodeResolve from 'rollup-plugin-node-resolve';
import uglify from 'rollup-plugin-uglify';
import {minify} from 'uglify-es';

const name = 'TranscriptBrowser';
export default {
    input: 'src/' + name + '.js',
    output: [
        {
            name: name,
            file: 'build/js/transcript-browser.bundle.min.js',
            format: 'iife',
            globals: {
                jquery: '$'
            }
        }
    ],
    external: ['jquery'],
    plugins: [
        nodeResolve({jsnext: true, main: true}),
        uglify({}, minify)
    ]
}
