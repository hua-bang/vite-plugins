import * as babel from '@babel/core';
import autoTrackerBabelPlugin from './babel-plugin';

interface AutoTrackerPluginOptions {
  libPath: string;
  libName: string;
  useComponent?: boolean;
}

const fileRegex = /\.(tsx)$/;

export default function autoTracker(pluginOptions: AutoTrackerPluginOptions) {
  
  return {
    name: 'autoTracker',
    enforce: 'pre',

    async transform(code: string, id: string) {
      if (!fileRegex.test(id)) {
        return;
      }

      const result = await babel.transformAsync(code, {
        babelrc: false,
        configFile: false,
        ast: true,
        code: true,
        parserOpts: {
          plugins: ["jsx", "typescript"]
        },
        plugins: [
          [
            autoTrackerBabelPlugin,
            pluginOptions
          ]
        ]
      });
      console.log(result.code)
      return {
        code: result.code,
        map: null
      }
    }
  }
}