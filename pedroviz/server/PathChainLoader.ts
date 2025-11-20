import {
  BaseJavaCstVisitorWithDefaults,
  ConstructorDeclarationCtx,
  ExpressionCstNode,
  FieldDeclarationCtx,
  IToken,
  MethodBodyCtx,
  parse,
  PrimaryPrefixCtx,
  UnannTypeCstNode,
  UnannTypeCtx,
  UnaryExpressionCtx,
  VariableDeclaratorCtx,
} from 'java-parser';
import {
  AnonymousPathChain,
  AnonymousPose,
  AnonymousValue,
  NamedBezier,
  NamedPose,
  NamedValue,
  PathChainFile,
  PoseRef,
  ValueRef,
} from './types';
import { promises as fsp } from 'node:fs';
import {
  hasField,
  isArray,
  isDefined,
  isString,
  isUndefined,
} from '@freik/typechk';
class PathChainLoader extends BaseJavaCstVisitorWithDefaults {
  content: string = '';
  parsed: ReturnType<typeof parse> | null = null;
  info: PathChainFile = {
    name: '',
    values: [], // NamedValue[];
    poses: [], // NamedPose[];
    beziers: [], // Bezier[];
    pathChains: [], // PathChain[];
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
    // We're looking for public static double/int name = value;
    const maybeNamedValue = tryMatchingNamedValues(ctx);
    if (isDefined(maybeNamedValue)) {
      this.info.values.push(maybeNamedValue);
      return super.fieldDeclaration(ctx);
    }
    const maybeNamedPoses = tryMatchingNamedPoses(ctx);
    if (isDefined(maybeNamedPoses)) {
      this.info.poses.push(maybeNamedPoses);
      return super.fieldDeclaration(ctx);
    }
    const maybeNamedBeziers = tryMatchingBeziers(ctx);
    if (isDefined(maybeNamedBeziers)) {
      this.info.beziers.push(maybeNamedBeziers);
      return super.fieldDeclaration(ctx);
    }
    return super.fieldDeclaration(ctx);
  }

  constructorDeclaration(ctx: ConstructorDeclarationCtx) {
    return super.constructorDeclaration(ctx);
  }
}

function descend<T>(ctx: T[] | undefined): T | undefined {
  if (!isArray(ctx) || ctx.length !== 1) {
    return;
  }
  return ctx[0];
}

function child<T extends { children: any }>(
  ctx: T[] | undefined,
): T['children'] | undefined {
  return descend(ctx)?.children;
}

function nameOf(ctx: IToken[] | undefined): string | undefined {
  return descend(ctx)?.image;
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
  const numType = child(
    child(
      child(child(ctx.unannType)?.unannPrimitiveTypeWithOptionalDimsSuffix)
        ?.unannPrimitiveType,
    )?.numericType,
  );
  if (!numType) {
    return;
  }
  const value: AnonymousValue = { type: 'double', value: 0 };
  if (numType.floatingPointType) {
    if (!child(numType.floatingPointType)?.Double) {
      return;
    }
  } else if (numType.integralType) {
    if (!child(numType.integralType)?.Int) {
      return;
    }
    value.type = 'int';
  }
  // Okay, found the type. Need the name and the initialized value.
  if (ctx.variableDeclaratorList.length !== 1) {
    return;
  }
  const varDecl = child(child(ctx.variableDeclaratorList)?.variableDeclarator);
  if (!varDecl) {
    return;
  }
  const name = nameOf(child(varDecl.variableDeclaratorId)?.Identifier);
  if (!name) {
    return;
  }
  // TODO: Support initializers of "Math.toRadians(K)"
  const expr = descend(child(varDecl.variableInitializer)?.expression);
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

function getNumericConstant(
  expr: ExpressionCstNode,
): AnonymousValue | undefined {
  const unary: UnaryExpressionCtx | undefined = child(
    child(child(expr.children.conditionalExpression)?.binaryExpression)
      ?.unaryExpression,
  );
  const negative = '-' === nameOf(unary?.UnaryPrefixOperator) ? -1 : 1;
  const whichLit = child(child(child(unary?.primary)?.primaryPrefix)?.literal);
  if (isDefined(whichLit?.integerLiteral)) {
    const value = nameOf(child(whichLit.integerLiteral)?.DecimalLiteral);
    if (isDefined(value)) {
      return { type: 'int', value: parseInt(value) * negative };
    }
  } else if (isDefined(whichLit?.floatingPointLiteral)) {
    const value = nameOf(child(whichLit.floatingPointLiteral)?.FloatLiteral);
    if (isDefined(value)) {
      return { type: 'double', value: parseFloat(value) * negative };
    }
  }
  return;
}

let inGetOr = false;
function getRefOr<T>(
  expr: ExpressionCstNode,
  getOr: (expr: ExpressionCstNode) => T | undefined,
): T | string | undefined {
  const unary: UnaryExpressionCtx | undefined = child(
    child(child(expr.children.conditionalExpression)?.binaryExpression)
      ?.unaryExpression,
  );
  const val = child(child(unary?.primary)?.primaryPrefix);
  if (isDefined(val?.fqnOrRefType)) {
    return nameOf(
      child(
        child(child(val.fqnOrRefType)?.fqnOrRefTypePartFirst)
          ?.fqnOrRefTypePartCommon,
      )?.Identifier,
    );
  }
  inGetOr = true;
  const res = getOr(expr);
  inGetOr = false;
  return res;
}

function getValueRef(
  expr: ExpressionCstNode | undefined,
): ValueRef | undefined {
  if (isUndefined(expr)) {
    return;
  }
  return getRefOr(expr, getNumericConstant);
}

function getClassTypeName(
  unannType: UnannTypeCstNode[] | undefined,
): string | undefined {
  return nameOf(
    child(
      child(
        child(child(unannType)?.unannReferenceType)?.unannClassOrInterfaceType,
      )?.unannClassType,
    )?.Identifier,
  );
}

function getLValueName(decl: VariableDeclaratorCtx): string | undefined {
  return nameOf(child(decl?.variableDeclaratorId)?.Identifier);
}

function getVariableDeclarator(
  ctx: FieldDeclarationCtx,
): VariableDeclaratorCtx | undefined {
  return child(child(ctx.variableDeclaratorList)?.variableDeclarator);
}

function getCtorArgs(
  decl: VariableDeclaratorCtx | ExpressionCstNode,
  type: string,
): ExpressionCstNode[] | undefined {
  let expr: ExpressionCstNode;
  if (!hasField(decl, 'name')) {
    const theExpr = descend(child(decl.variableInitializer)?.expression);
    if (isUndefined(theExpr)) {
      return;
    }
    expr = theExpr;
  } else {
    expr = decl;
  }
  const newExpr = child(
    child(
      child(
        child(
          child(
            child(child(expr?.children.conditionalExpression)?.binaryExpression)
              ?.unaryExpression,
          )?.primary,
        )?.primaryPrefix,
      )?.newExpression,
    )?.unqualifiedClassInstanceCreationExpression,
  );
  const dataType = nameOf(
    child(newExpr?.classOrInterfaceTypeToInstantiate)?.Identifier,
  );
  if (dataType !== type) {
    return;
  }
  return child(newExpr?.argumentList)?.expression;
}

function tryMatchingNamedPoses(
  ctx: FieldDeclarationCtx,
): NamedPose | undefined {
  if (!isPublicStaticField(ctx)) {
    return;
  }
  const classType = getClassTypeName(ctx.unannType);
  if (classType !== 'Pose') {
    return;
  }
  const decl = getVariableDeclarator(ctx);
  if (isUndefined(decl)) {
    return;
  }
  const name = getLValueName(decl);
  if (isUndefined(name)) {
    return;
  }
  const pose = getAnonymousPose(decl);
  return { name, pose };
}

function getAnonymousPose(
  expr: ExpressionCstNode | VariableDeclaratorCtx,
): AnonymousPose | undefined {
  const ctorArgs = getCtorArgs(expr, 'Pose');
  if (
    isUndefined(ctorArgs) ||
    (ctorArgs.length !== 3 && ctorArgs.length !== 2)
  ) {
    return;
  }
  const x = getValueRef(ctorArgs[0]);
  const y = getValueRef(ctorArgs[1]);
  const heading = getValueRef(ctorArgs[2]);
  if (isUndefined(x) || isUndefined(y)) {
    return;
  }
  return isUndefined(heading) ? { x, y } : { x, y, heading };
}

function getPoseRef(expr: ExpressionCstNode): PoseRef | undefined {
  return getRefOr(expr, getAnonymousPose);
}

function tryMatchingBeziers(ctx: FieldDeclarationCtx): NamedBezier | undefined {
  if (!isPublicStaticField(ctx)) {
    return;
  }
  const classType = getClassTypeName(ctx.unannType);
  const type =
    classType === 'BezierLine'
      ? 'line'
      : classType === 'BezierCurve'
        ? 'curve'
        : undefined;
  if (isUndefined(type)) {
    return;
  }
  const decl = getVariableDeclarator(ctx);
  if (isUndefined(decl)) {
    return;
  }
  const name = getLValueName(decl);
  if (isUndefined(name)) {
    return;
  }
  const ctorArgs = getCtorArgs(decl, classType);
  if (
    isUndefined(ctorArgs) ||
    (type === 'line' && ctorArgs.length !== 2) ||
    (type === 'curve' && ctorArgs.length < 2)
  ) {
    return;
  }
  const points = ctorArgs.map(getPoseRef);
  if (!points.every(isDefined)) {
    return;
  }
  console.log({ name, points });
  return { name, points: { type, points } };
}

export async function MakePathChainFile(
  filename: string,
): Promise<PathChainFile | string> {
  const loader = new PathChainLoader();
  const res = await loader.loadFile(filename);
  return isString(res) ? res : loader.info;
}
