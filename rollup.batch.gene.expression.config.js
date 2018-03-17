import nodeResolve from 'rollup-plugin-node-resolve';
import uglify from 'rollup-plugin-uglify';
import replace from 'rollup-plugin-replace';
import {minify} from 'uglify-es';

/* to set the NODE_ENV
in a terminal window (bash)
export NODE_ENV="development"
echo $NODE_ENV
 */
const name= 'BatchGeneExpression';
export default {
    input: 'src/scripts/' + name + '.js',
    output: {
        file: process.env.NODE_ENV=='production'?'build/js/batch-gene-expression.bundle.min.js':'build/js/batch-gene-expression.bundle.dev.js',
        format: 'iife'
    },
    sourcemap: 'inline',
    name: name,
    plugins: [
        nodeResolve({jsnext: true, main: true}),
        replace({
          ENV: JSON.stringify(process.env.NODE_ENV || 'development'),
        }),
        (process.env.NODE_ENV === 'production' && uglify({}, minify)) // uglify for production: NODE_ENV=production rollup -c
    ]
}