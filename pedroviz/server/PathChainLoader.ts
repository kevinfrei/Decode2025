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
import { isArray, isDefined, isString } from '@freik/typechk';
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

function descend<T>(ctx: T[] | undefined): T | undefined {
  if (!isArray(ctx) || ctx.length !== 1) {
    return;
  }
  return ctx[0];
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
