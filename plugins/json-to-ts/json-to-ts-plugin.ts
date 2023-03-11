import { GenerateJsonTypePluginOptions } from './typings';
import * as babelCore from '@babel/core';

/**
 * 根据 json 具体值 获取 类型对象
 * @note 注意： 这里不直接生成 interface 而是转成中间一种表述类型的数据格式 本质还是 json
 * @example { age: 18 } ---> { age: 'number' }
 * @param json 
 * @returns Record<string, any>
 */
function getJsonType(json: Record<string, any>) {
  const result: Record<string, any> = {};

  Object.keys(json).forEach(key => {
    const value = json[key];
    const valueType = typeof value;

    // 原始值 直接塞对应的类型进入就 ok 了，这里由于 JSON 限制，不支持枚举。
    if (['string', 'number', 'boolean'].includes(valueType)) {
      result[key] = valueType;
      return;
    }

    // 数组情况 需要考虑联合类型
    if (valueType === 'object' && Array.isArray(value)) {
      result[key] = [...new Set(Object.values(getJsonType(value) || {}))];
      return;
    }

    // null 进行处理
    if (valueType === 'object' && !value) {
      result[key] = null;
      return;
    }

    // 对象处理方式
    if (valueType === 'object') {
      result[key] = getJsonType(value);
      return;
    }
  });

  return result;
}

export default function json2InterfacePlugin(
  babel: typeof babelCore, 
  options: Pick<GenerateJsonTypePluginOptions, 'dataSource'>
) {
  const { types: t } = babel;
  let { dataSource = [] } = options;

  function getInterfaceNodeByJsonType(interfaceName: string, jsonType: Record<string, any>) {
    
    const getObjectTypePropertyNodeArr = (jsonType: Record<string, any>): babelCore.types.ObjectTypeProperty[] => {
      const objectTypePropertyNodeArr = Object.entries(jsonType).map(([key, value]) => {
        
        let valueTypeAnnotationNode = undefined;
        let valueType = typeof value;

        if (valueType === 'object') {

          // null 情况
          if (!value) {
            valueTypeAnnotationNode = t.nullLiteralTypeAnnotation();
          } else if (Array.isArray(value)) {
            // 数组情况

            let typeParamsAnnotationNode = undefined; 

            // 该数组有几种类型，直接由 length 决定
            const paramsTypeCount = value.length;
            
            if (paramsTypeCount === 0) {
              // 没有的话，直接看成 any
              typeParamsAnnotationNode = t.anyTypeAnnotation();
            } else if (paramsTypeCount === 1) {
              // 只有一种类型，非联合类型，直接使用该类型
              typeParamsAnnotationNode = getObjectTypePropertyNodeArr(value)[0]['value'];
            } else {
              // 联合类型
              typeParamsAnnotationNode = t.unionTypeAnnotation(
                [
                  ...getObjectTypePropertyNodeArr(value).map(item => item.value)
                ]
              )
            }

            valueTypeAnnotationNode = t.genericTypeAnnotation(
              t.identifier('Array'),
              t.typeParameterInstantiation(
                [typeParamsAnnotationNode!]
              ),
            )
            

          } else {
            // 普通对象情况
            const nestObjectTypePropertyNodeArr = getObjectTypePropertyNodeArr(value);
            valueTypeAnnotationNode = t.objectTypeAnnotation([
              ...nestObjectTypePropertyNodeArr
            ]);
          }
        }
        
        // number 节点
        if (value === 'number') {
          valueTypeAnnotationNode = t.numberTypeAnnotation();
        }

        // boolean 节点
        if (value === 'boolean') {
          valueTypeAnnotationNode = t.booleanTypeAnnotation();
        }

        // string 节点
        if (value === 'string') {
          valueTypeAnnotationNode = t.stringTypeAnnotation();
        }

        if (!valueTypeAnnotationNode) {
          return null;
        }

        return t.objectTypeProperty(
            t.identifier(key),
            valueTypeAnnotationNode
          )
      });

      return objectTypePropertyNodeArr.filter((item => item !== null)) as babelCore.types.ObjectTypeProperty[];
    }
    
    const objectTypePropertyNodeArr = getObjectTypePropertyNodeArr(jsonType);
    
    return t.interfaceDeclaration(
      t.identifier(interfaceName),
      undefined,
      undefined,
      t.objectTypeAnnotation(objectTypePropertyNodeArr)
    );
  }

  const interfaceDeclarationNodeArr = dataSource.map(({ interfaceName, data }) => {
    const jsonType = getJsonType(data);
    const interfaceDeclaration = getInterfaceNodeByJsonType(interfaceName, jsonType);
    return interfaceDeclaration;
  });


  return {
    name: "json2InterfacePlugin",
    visitor: {
      Program(path: any) {
        path.node.body = [
          ...path.node.body,
          ...interfaceDeclarationNodeArr
        ]
      }
    }
  };
}
