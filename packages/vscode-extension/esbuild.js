const esbuild = require("esbuild");

const production = process.argv.includes('--production');
const watch = process.argv.includes('--watch');

/**
 * @type {import('esbuild').Plugin}
 */
const esbuildProblemMatcherPlugin = {
	name: 'esbuild-problem-matcher',

	setup(build) {
		build.onStart(() => {
			console.log('[watch] build started');
		});
		build.onEnd((result) => {
			result.errors.forEach(({ text, location }) => {
				console.error(`✘ [ERROR] ${text}`);
				console.error(`    ${location.file}:${location.line}:${location.column}:`);
			});
			console.log('[watch] build finished');
		});
	},
};

async function main() {
	const runtime = await esbuild.context({
		entryPoints: [
			'src/webview-panel/md-preview/runtime/runtime.ts',
		],
		format: 'iife',
		bundle: true,
		sourcemap: false,
		logLevel: 'silent',
		outdir: 'dist',
		assetNames: '[name]',
	});
	const ctx = await esbuild.context({
		entryPoints: [
			'src/main.ts',
			'src/services/markdown/index.ts',
		],
		bundle: true,
		format: 'cjs',
		minify: production,
		sourcemap: !production,
		sourcesContent: false,
		platform: 'node',
		outdir: 'dist',
		external: ['vscode'],
		logLevel: 'silent',
		plugins: [
			/* add to the end of plugins array */
			esbuildProblemMatcherPlugin,
		],
		loader: {
			'.node': 'file',
			'.html': 'text',
		},
		assetNames: '[name]',
	});
	if (watch) {
		await Promise.all([ctx.watch()], runtime.watch());
	} else {
		await Promise.all([ctx.rebuild(), runtime.rebuild()]);
		await Promise.all([ctx.dispose(), runtime.dispose()]);
	}
}

main().catch(e => {
	console.error(e);
	process.exit(1);
});
