import {
  BaseJavaCstVisitorWithDefaults,
  ConstructorDeclarationCtx,
  ExpressionCstNode,
  FieldDeclarationCtx,
  MethodBodyCtx,
  parse,
  PrimaryPrefixCtx,
  UnannTypeCtx,
  UnaryExpressionCtx,
} from 'java-parser';
import {
  AnonymousValue,
  NamedPose,
  NamedValue,
  PathChainFile,
  ValueRef,
} from './types';
import { promises as fsp } from 'node:fs';
import { isArray, isDefined, isString, isUndefined } from '@freik/typechk';
class PathChainLoader extends BaseJavaCstVisitorWithDefaults {
  content: string = '';
  parsed: ReturnType<typeof parse> | null = null;
  info: PathChainFile = {
    name: '',
    values: [], // NamedValue[];
    poses: [], // NamedPose[];
    beziers: [], // Bezier[];
    pathChains: [], // PathChain[];
    // heading?: HeadingType;
  };

  constructor() {
    super();
    this.validateVisitor();
  }

  async loadFile(filename: string): Promise<string | true> {
    // Read the contents fo the file and parse it:
    this.info.name = filename;
    try {
      const content = await fsp.readFile(filename, 'utf-8');
      return this.parseContent(content);
    } catch (e) {
      return `Could not read file: ${filename} - ${e}`;
    }
  }

  parseContent(content: string): string | true {
    try {
      this.content = content;
      this.parsed = parse(this.content);
    } catch (e) {
      return `Could not parse content - ${e}`;
    }
    // Now visit the parsed CST, filling in all the data structures:
    // console.log(this.parsed);
    try {
      this.visit(this.parsed);
    } catch (e) {
      return `Could not visit parsed CST for file: ${this.info.name} - ${e}`;
    }
    return true;
  }

  // Okay, now we need to implement the visitor methods to extract the data we want.
  // All the static fields we care about:
  // double's, int's, pose's, BezierCurve's, BezierLine's.
  // PathChains shouldn't be static

  fieldDeclaration(ctx: FieldDeclarationCtx) {
    // console.log('fieldDeclaration ctx', ctx);
    // We're looking for public static double/int name = value;
    const maybeNamedValue = tryMatchingNamedValues(ctx);
    if (isDefined(maybeNamedValue)) {
      this.info.values.push(maybeNamedValue);
      return super.fieldDeclaration(ctx);
    }
    const maybeNamedPoses = tryMatchingNamedPoses(ctx);
    if (isDefined(maybeNamedPoses)) {
      this.info.poses.push(maybeNamedPoses);
    }
    return super.fieldDeclaration(ctx);
  }

  constructorDeclaration(ctx: ConstructorDeclarationCtx) {
    // console.log('constructorDeclaration ctx', ctx);
    return super.constructorDeclaration(ctx);
  }
}

function descend<T>(ctx: T[] | undefined): T | undefined {
  if (!isArray(ctx) || ctx.length !== 1) {
    return;
  }
  return ctx[0];
}

function isPublicStaticField(ctx: FieldDeclarationCtx): boolean {
  if (!ctx.fieldModifier || ctx.fieldModifier.length !== 2) {
    return false;
  }
  if (
    !ctx.fieldModifier.every(
      (mod) => mod.children.Public || mod.children.Static,
    )
  ) {
    return false;
  }
  return true;
}

// This matches the 'public static int/double name = value;' pattern
function tryMatchingNamedValues(
  ctx: FieldDeclarationCtx,
): NamedValue | undefined {
  if (!isPublicStaticField(ctx)) {
    return;
  }
  const numType = descend(
    descend(
      descend(
        descend(ctx.unannType)?.children
          .unannPrimitiveTypeWithOptionalDimsSuffix,
      )?.children.unannPrimitiveType,
    )?.children.numericType,
  )?.children;
  if (!numType) {
    return;
  }
  const value: AnonymousValue = { type: 'double', value: 0 };
  if (numType.floatingPointType) {
    if (!descend(numType.floatingPointType)?.children.Double) {
      return;
    }
  } else if (numType.integralType) {
    if (!descend(numType.integralType)?.children.Int) {
      return;
    }
    value.type = 'int';
  }
  // Okay, found the type. Need the name and the initialized value.
  if (ctx.variableDeclaratorList.length !== 1) {
    return;
  }
  const varDecl = descend(
    descend(ctx.variableDeclaratorList)?.children.variableDeclarator,
  )?.children;
  if (!varDecl) {
    return;
  }
  const name = descend(
    descend(varDecl.variableDeclaratorId)?.children.Identifier,
  )?.image;
  if (!name) {
    return;
  }
  // TODO: Support initializers of "Math.toRadians(K)"
  const expr = descend(
    descend(varDecl.variableInitializer)?.children.expression,
  );
  if (isUndefined(expr)) {
    return;
  }
  const valRef = getValueRef(expr);
  if (isString(valRef)) {
    return;
  }
  value.value = valRef!.value;
  return { name, value };
}

function getValueRef(
  expr: ExpressionCstNode | undefined,
): ValueRef | undefined {
  if (isUndefined(expr)) {
    return;
  }
  const unary: UnaryExpressionCtx | undefined = descend(
    descend(
      descend(expr.children.conditionalExpression)?.children.binaryExpression,
    )?.children.unaryExpression,
  )?.children;
  const negative = '-' === descend(unary?.UnaryPrefixOperator)?.image ? -1 : 1;
  const val = descend(
    descend(unary?.primary)?.children.primaryPrefix,
  )?.children;
  if (isDefined(val?.fqnOrRefType)) {
    const refName = descend(
      descend(
        descend(descend(val.fqnOrRefType)?.children.fqnOrRefTypePartFirst)
          ?.children.fqnOrRefTypePartCommon,
      )?.children.Identifier,
    )?.image;
    return refName;
  } else if (isDefined(val?.literal)) {
    const whichLit = descend(val.literal)?.children;
    if (isDefined(whichLit?.integerLiteral)) {
      const value = descend(
        descend(whichLit.integerLiteral)?.children.DecimalLiteral,
      )?.image;
      if (isDefined(value)) {
        return { type: 'int', value: parseInt(value) * negative };
      }
    } else if (isDefined(whichLit?.floatingPointLiteral)) {
      const value = descend(
        descend(whichLit.floatingPointLiteral)?.children.FloatLiteral,
      )?.image;
      if (isDefined(value)) {
        return { type: 'double', value: parseFloat(value) * negative };
      }
    }
  }
  return;
}

function tryMatchingNamedPoses(
  ctx: FieldDeclarationCtx,
): NamedPose | undefined {
  if (!isPublicStaticField(ctx)) {
    return;
  }
  const classType = descend(
    descend(
      descend(
        descend(descend(ctx.unannType)?.children.unannReferenceType)?.children
          .unannClassOrInterfaceType,
      )?.children.unannClassType,
    )?.children.Identifier,
  )?.image;
  if (!classType || classType !== 'Pose') {
    return;
  }

  const decl = descend(
    descend(ctx.variableDeclaratorList)?.children.variableDeclarator,
  )?.children;
  const name = descend(
    descend(decl?.variableDeclaratorId)?.children.Identifier,
  )?.image;
  const ctorArgs = descend(
    descend(
      descend(
        descend(
          descend(
            descend(
              descend(
                descend(
                  descend(
                    descend(decl?.variableInitializer)?.children.expression,
                  )?.children.conditionalExpression,
                )?.children.binaryExpression,
              )?.children.unaryExpression,
            )?.children.primary,
          )?.children.primaryPrefix,
        )?.children.newExpression,
      )?.children.unqualifiedClassInstanceCreationExpression,
    )?.children.argumentList,
  )?.children.expression;
  if (
    isUndefined(ctorArgs) ||
    (ctorArgs.length !== 3 && ctorArgs.length !== 2)
  ) {
    return;
  }
  const x = getValueRef(ctorArgs[0]);
  const y = getValueRef(ctorArgs[1]);
  const heading = getValueRef(ctorArgs[2]);
  if (isUndefined(name) || isUndefined(x) || isUndefined(y)) {
    return;
  }
  return isUndefined(heading)
    ? { name, pose: { x, y } }
    : { name, pose: { x, y, heading } };

  /*
  const value: AnonymousValue = { type: 'double', value: 0 };
  if (numType.floatingPointType) {
    if (!descend(numType.floatingPointType)?.children.Double) {
      return;
    }
  } else if (numType.integralType) {
    if (!descend(numType.integralType)?.children.Int) {
      return;
    }
    value.type = 'int';
  }
  // Okay, found the type. Need the name and the initialized value.
  if (ctx.variableDeclaratorList.length !== 1) {
    return;
  }
  const varDecl = descend(
    descend(ctx.variableDeclaratorList)?.children.variableDeclarator,
  )?.children;
  if (!varDecl) {
    return;
  }
  const name = descend(
    descend(varDecl.variableDeclaratorId)?.children.Identifier,
  )?.image;
  if (!name) {
    return;
  }
  // TODO: Support initializers of "Math.toRadians(K)"
  const expr = descend(
    descend(descend(varDecl.variableInitializer)?.children.expression)?.children
      .conditionalExpression,
  )?.children.binaryExpression;
  const lit = descend(
    descend(descend(descend(expr)?.children.unaryExpression)?.children.primary)
      ?.children.primaryPrefix,
  )?.children.literal;
  if (value.type === 'int') {
    const intLit = descend(
      descend(descend(lit)?.children.integerLiteral)?.children.DecimalLiteral,
    )?.image;
    if (!intLit) {
      return;
    }
    value.value = parseInt(intLit);
  } else {
    const dblLit = descend(
      descend(descend(lit)?.children.floatingPointLiteral)?.children
        .FloatLiteral,
    )?.image;
    if (!dblLit) {
      return;
    }
    value.value = parseFloat(dblLit);
  }
  return { name, value };
  */
}

export async function MakePathChainFile(
  filename: string,
): Promise<PathChainFile | string> {
  const loader = new PathChainLoader();
  const res = await loader.loadFile(filename);
  if (isString(res)) {
    return res;
  }
  return loader.info;
}
