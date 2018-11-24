import typescript from 'rollup-plugin-typescript2';
import resolve from 'rollup-plugin-node-resolve';
import commonJS from 'rollup-plugin-commonjs';
import pkg from './package.json';

export default {
	input: 'sources/index.ts',
	output: [
		{
			file: './dist/videoPlayerDashShakaPlayback.js',
			format: 'iife',
			name: "SliceMeNice.VideoPlayer.DashShakaPlayback",
			globals: {
				'@slicemenice/video-player': 'SliceMeNice.VideoPlayer'
			}
		},
		{
			file: './dist/videoPlayerDashShakaPlayback.es.js',
			format: 'es'
		}
	],
	external: [
		...Object.keys(pkg.dependencies || {}),
		...Object.keys(pkg.peerDependencies || {})
	],
	plugins: [
		resolve(),
		commonJS({
			include: 'node_modules/**'
		}),
		typescript({
			typescript: require('typescript')
		})
	]
};