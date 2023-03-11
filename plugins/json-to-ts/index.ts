import { writeFileSync, existsSync, mkdir, mkdirSync } from 'fs';
import { resolve } from 'path';
import * as babel from '@babel/core';
import { GenerateJsonTypePluginOptions } from './typings';
import json2InterfacePlugin from './json-to-ts-plugin';



export default function generateJsonType(pluginOptions: GenerateJsonTypePluginOptions) {

  async function buildStart() {
  
    console.log('插件启动中');

    const {
      path,
      filename,
      dataSource = [],
    } = pluginOptions || {};

    if (!path || !filename) {
      console.log('检查配置是否完成。');
      return;
    }

    const result = await babel.transformAsync('', {
      babelrc: false,
      configFile: false,
      ast: true,
      code: true,
      parserOpts: {
        plugins: ["jsx", "typescript"]
      },
      plugins: [
        [
          json2InterfacePlugin,
          {
            dataSource
          }
        ]
      ]
    });

    console.log('result', result);

    if (!result || !result.code) {
      return;
    }

    // FIX ME: I don't why ast that transformed, then interface use ',' not ';'
    const code = result.code.replaceAll(',', ";");

    const dirPath = resolve(path);
    const filePath = resolve(path, filename);

    if(!existsSync(dirPath)) {
      mkdirSync(dirPath)
    }
    writeFileSync(filePath, code);
  }

  return {
    name: 'json2InterfacePlugin',
    enforce: 'pre',
    buildStart
  }
}