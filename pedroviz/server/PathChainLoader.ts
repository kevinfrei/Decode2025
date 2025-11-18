import {
  BaseJavaCstVisitorWithDefaults,
  ConstructorDeclarationCtx,
  FieldDeclarationCtx,
  MethodBodyCtx,
  parse,
} from 'java-parser';
import { NamedValue, PathChainFile } from './types';
import { promises as fsp } from 'node:fs';

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
    try {
      this.content = await fsp.readFile(filename, 'utf-8');
    } catch (e) {
      return `Could not read file: ${filename} - ${e}`;
    }
    try {
      this.parsed = parse(this.content);
    } catch (e) {
      return `Could not parse file: ${filename} - ${e}`;
    }
    // Now visit the parsed CST, filling in all the data structures:
    console.log(this.parsed);
    try {
      this.visit(this.parsed);
    } catch (e) {
      return `Could not visit parsed CST for file: ${filename} - ${e}`;
    }
    return true;
  }

  // Okay, now we need to implement the visitor methods to extract the data we want.
  // All the static fields we care about:
  // double's, int's, pose's, BezierCurve's, BezierLine's.
  // PathChains shouldn't be static
  
  fieldDeclaration(ctx: FieldDeclarationCtx) {
    console.log('fieldDeclaration ctx', ctx);
    return super.fieldDeclaration(ctx);
  }
  constructorDeclaration(ctx: ConstructorDeclarationCtx) {
    console.log('constructorDeclaration ctx', ctx);
    return super.constructorDeclaration(ctx);
  }
}

export async function MakePathChainFile(
  filename: string,
): Promise<PathChainFile> {
  const loader = new PathChainLoader();
  const res = await loader.loadFile(filename);
  console.log('res', res);
  return {
    name: filename,
    values: [], // NamedValue[];
    poses: [], // NamedPose[];
    beziers: [], // Bezier[];
    pathChains: [], // PathChain[];
    // heading?: HeadingType;
  };
}
