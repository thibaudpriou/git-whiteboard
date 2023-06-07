import adaptaterStatic from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/kit/vite';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess: vitePreprocess(),


	kit: {
		adapter: adaptaterStatic({
			pages: 'build',
			assets: 'build',
			precompress: false,
			strict: true
		}),
		files: {
			assets: 'static'
		},
		alias: {
			'$types': 'src/types'
		}
	}
};

export default config;
