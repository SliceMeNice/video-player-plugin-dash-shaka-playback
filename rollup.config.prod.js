import config from './rollup.config';
import { uglify } from "rollup-plugin-uglify";

// we do not need to uglify the ES module
delete config.output[1];

config.output[0].file = './dist/videoPlayerDashShakaPlayback.min.js',

config.plugins.push(uglify());

export default config;