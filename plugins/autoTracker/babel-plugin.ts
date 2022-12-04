function checkHasLogIdentification(attributes) {
  return (attributes || []).some(item => item.name.name === 'data-log-id');
}

function findAttributeNode(attributes, key) {
  return (attributes || []).find(item => item.name.name === key);
}


export default function (babel, options) {
  const { types: t, template } = babel;
  const { libName, libPath } = options;
  return {
    name: "autoTrackerPlugin",
    visitor: {
      Program(path, state) {
        let needImportSDK = false;
        let loggerId;

        // 这里从 Program 节点进行遍历, 主要两个功能
        // 1. 判断该组件下的 是否需要引入 SDK。
        // 2. 判断 SDK 是否导入，导入记录下 loggerId。
        path.traverse({
          JSXOpeningElement(elePath) {
            const { attributes } = elePath.node;

            const hasLogIdentification = checkHasLogIdentification(
              attributes,
            );

            if (hasLogIdentification) {
              needImportSDK = true;
              elePath.stop();
            }
          },
          ImportDeclaration(importPath) {
            const { node } = importPath;
            if (node.source.value.includes(libPath)) {
              const specifier = node.specifiers[0];
              if (!t.isImportDefaultSpecifier(specifier)) {
                importPath.stop();
                needImportSDK = true;
                return;
              }
              loggerId = specifier.local.name; // 取出导入的变量名赋值给loggerId
              importPath.stop();
              state.loggerNodeName = loggerId;
            }
          },
        });

        if (!needImportSDK) {
          return;
        }

        if (!loggerId) {
          // 如果loggerId没有值，说明源代码中还没有导入此模块，
          loggerId = path.scope.generateUid(libName);
          path.node.body.unshift(
            t.importDeclaration(
              [t.importDefaultSpecifier(t.identifier(loggerId))],
              t.stringLiteral(`${libPath}/component`),
            ),
          );
          state.loggerNodeName = loggerId;
        }
      },
      JSXOpeningElement(path, state) {
      	if (!state.loggerNodeName || path.hasTracked) {
          return;
        }
        path.hasTracked = true;
        const { attributes } = path.node;

        const hasLogIdentification = checkHasLogIdentification(
          attributes,
        );
        if (!hasLogIdentification) {
          return;
        }
        const jsxElementPath = path.parentPath;
        const wrapperNode = t.jsxElement(
          t.jsxOpeningElement(
            t.jsxIdentifier(state.loggerNodeName),
            []
          ),
          t.jsxClosingElement(
            t.jsxIdentifier(state.loggerNodeName),
          ),
          [
            jsxElementPath.node
          ]
        ); 
        jsxElementPath.replaceWith(wrapperNode);
      }
    }
  };
}
