import * as fs from 'fs';
import type { Node } from 'typescript';
import {
  createSourceFile,
  isPropertySignature,
  isIdentifier,
  isTypeLiteralNode,
  ScriptTarget,
  isUnionTypeNode,
  isStringLiteral,
  isLiteralTypeNode,
  forEachChild,
} from 'typescript';

// Read the types.ts file
const fileContent: string = fs.readFileSync(
  'src/lib/database.types.d.ts',
  'utf8'
);

// Function to transform enum names to PascalCase and remove '_enum' suffix
const transformEnumName = (name: string): string => {
  return name
    .replace(/_enum$/, '') // Remove '_enum' suffix
    .split('_')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
};

// Define the shape of our extracted enums
interface ExtractedEnums {
  [enumName: string]: string[];
}

// Function to parse and extract enums from Database['public']['Enums']
const extractEnums = (content: string): ExtractedEnums => {
  const sourceFile = createSourceFile(
    'src/lib/database.types.d.ts',
    content,
    ScriptTarget.Latest,
    true
  );
  const enums: ExtractedEnums = {};

  function visit(node: Node): void {
    // Check for the property signature named "Enums"
    if (
      isPropertySignature(node) &&
      node.name &&
      isIdentifier(node.name) &&
      node.name.escapedText === 'Enums' &&
      node.type &&
      isTypeLiteralNode(node.type)
    ) {
      node.type.members.forEach(member => {
        if (
          isPropertySignature(member) &&
          member.name &&
          isIdentifier(member.name) &&
          member.type &&
          isUnionTypeNode(member.type)
        ) {
          const enumName = transformEnumName(
            member.name.escapedText.toString()
          );
          const enumValues = member.type.types
            .map(type => {
              if (
                isLiteralTypeNode(type) &&
                type.literal &&
                isStringLiteral(type.literal)
              ) {
                return type.literal.text;
              }
              return null;
            })
            .filter((value): value is string => value !== null);

          enums[enumName] = enumValues;
        }
      });
    }

    forEachChild(node, visit);
  }

  visit(sourceFile);

  return enums;
};

// Function to create enum strings from extracted enums with de-duplicating of keys
const createEnumStrings = (enums: ExtractedEnums): string => {
  return Object.entries(enums)
    .map(([enumName, enumValues]) => {
      // Deduplicate enum keys: if multiple values produce the same key, keep the first
      const keyValueMap = new Map<string, string>();
      for (const value of enumValues) {
        const key = value.replace(/\s+/g, '_').toUpperCase();
        if (!keyValueMap.has(key)) {
          keyValueMap.set(key, value);
        }
      }
      const enumMembers = Array.from(keyValueMap.entries())
        .map(
          ([key, value]) =>
            // Surround the key with single quotes
            `'${key}' = "${value}"`
        )
        .join(',\n  ');
      return `export enum ${enumName} {\n  ${enumMembers}\n}`;
    })
    .join('\n\n');
};

// Extract enums from the file content
const extractedEnums = extractEnums(fileContent);

// Create enum strings from the extracted enums
const enumStrings = createEnumStrings(extractedEnums);

// Write the generated enums to a new file
fs.writeFileSync('src/lib/database.enums.ts', enumStrings);

console.log('Enums have been extracted and written to database.enums.ts');
