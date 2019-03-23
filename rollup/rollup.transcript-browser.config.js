import nodeResolve from 'rollup-plugin-node-resolve';
import uglify from 'rollup-plugin-uglify';
import replace from 'rollup-plugin-replace';
import {minify} from 'uglify-es';

/* to set the NODE_ENV
in a terminal window (bash)
export NODE_ENV="development"
echo $NODE_ENV
 */
const name = 'TranscriptBrowser';
export default {
    input: 'src/' + name + '.js',
    output: [
        {
            name: name,
            file: process.env.NODE_ENV==='prod'?'build/js/transcript-browser.bundle.min.js':'build/js/transcript-browser.bundle.dev.js',
            format: 'iife',
            globals: {
                jquery: '$'
            }
        }
    ],
    external: ['jquery'],
    plugins: [
        nodeResolve({jsnext: true, main: true}),
        replace({
          ENV: JSON.stringify(process.env.NODE_ENV || 'development'),
        }),
        (process.env.NODE_ENV === 'prod' && uglify({}, minify)) // uglify for production: NODE_ENV=production rollup -c
    ]
}
