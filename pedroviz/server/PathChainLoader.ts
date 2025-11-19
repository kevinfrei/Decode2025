import {
  BaseJavaCstVisitorWithDefaults,
  ConstructorDeclarationCtx,
  FieldDeclarationCtx,
  MethodBodyCtx,
  parse,
  UnannTypeCtx,
} from 'java-parser';
import { AnonymousValue, NamedValue, PathChainFile } from './types';
import { promises as fsp } from 'node:fs';
import { isDefined, isString } from '@freik/typechk';
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
    }
    return super.fieldDeclaration(ctx);
  }

  constructorDeclaration(ctx: ConstructorDeclarationCtx) {
    // console.log('constructorDeclaration ctx', ctx);
    return super.constructorDeclaration(ctx);
  }
}

// This matches the 'public static int/double name = value;' pattern
function tryMatchingNamedValues(
  ctx: FieldDeclarationCtx,
): NamedValue | undefined {
  if (!ctx.fieldModifier || ctx.fieldModifier.length !== 2) {
    return;
  }
  if (
    !ctx.fieldModifier.every(
      (mod) => mod.children.Public || mod.children.Static,
    )
  ) {
    return;
  }
  if (ctx.unannType.length !== 1) {
    return;
  }
  const theType: UnannTypeCtx = ctx.unannType[0].children;
  if (!theType.unannPrimitiveTypeWithOptionalDimsSuffix) {
    return;
  }
  const primTypes = theType.unannPrimitiveTypeWithOptionalDimsSuffix;
  if (
    primTypes.length !== 1 ||
    isDefined(primTypes[0].children.dims) ||
    primTypes[0].children.unannPrimitiveType.length !== 1
  ) {
    return;
  }
  const primType = primTypes[0].children.unannPrimitiveType;
  if (
    primType.length !== 1 ||
    !primType[0].children.numericType ||
    primType[0].children.numericType.length !== 1
  ) {
    return;
  }
  const value: AnonymousValue = { type: 'double', value: 0 };
  const children = primType[0].children.numericType![0].children;
  if (children.floatingPointType) {
    if (children.floatingPointType[0].children.Float) {
      return;
    }
  } else if (children.integralType) {
    if (!children.integralType[0].children.Int) {
      return;
    }
    value.type = 'int';
  }
  // Okay, found the type. Need the name and the initialized value.
  if (ctx.variableDeclaratorList.length !== 1) {
    return;
  }
  const varDecl = ctx.variableDeclaratorList[0].children.variableDeclarator;
  if (varDecl.length !== 1) {
    return;
  }
  const varDeclCtx = varDecl[0].children;
  if (
    !varDeclCtx.variableDeclaratorId ||
    varDeclCtx.variableDeclaratorId.length !== 1 ||
    !varDeclCtx.variableDeclaratorId[0].children.Identifier ||
    varDeclCtx.variableDeclaratorId[0].children.Identifier.length !== 1 ||
    !varDeclCtx.variableInitializer ||
    varDeclCtx.variableInitializer.length !== 1
  ) {
    return;
  }
  const name = varDeclCtx.variableDeclaratorId[0].children.Identifier[0].image;
  const initializer = varDeclCtx.variableInitializer[0].children.expression;
  if (
    !initializer ||
    initializer.length !== 1 ||
    !initializer[0].children.conditionalExpression ||
    initializer[0].children.conditionalExpression.length !== 1
  ) {
    return;
  }
  const expr =
    initializer[0].children.conditionalExpression[0].children.binaryExpression;
  if (
    !expr ||
    expr.length !== 1 ||
    expr[0].children.unaryExpression.length !== 1 ||
    expr[0].children.unaryExpression[0].children.primary.length !== 1 ||
    !expr[0].children.unaryExpression[0].children.primary[0].children
      .primaryPrefix ||
    expr[0].children.unaryExpression[0].children.primary[0].children
      .primaryPrefix.length !== 1 ||
    !expr[0].children.unaryExpression[0].children.primary[0].children
      .primaryPrefix[0].children.literal ||
    expr[0].children.unaryExpression[0].children.primary[0].children
      .primaryPrefix[0].children.literal.length !== 1
  ) {
    return;
  }
  const lit =
    expr[0].children.unaryExpression[0].children.primary[0].children
      .primaryPrefix[0].children.literal;
  if (value.type === 'int') {
    if (
      !lit[0].children.integerLiteral ||
      !lit[0].children.integerLiteral[0].children.DecimalLiteral
    ) {
      return;
    }

    value.value = parseInt(
      lit[0].children.integerLiteral[0].children.DecimalLiteral[0].image,
    );
  } else {
    if (
      !lit[0].children.floatingPointLiteral ||
      !lit[0].children.floatingPointLiteral[0].children.FloatLiteral
    ) {
      return;
    }
    value.value = parseFloat(
      lit[0].children.floatingPointLiteral[0].children.FloatLiteral[0].image,
    );
  }
  return { name, value };
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
