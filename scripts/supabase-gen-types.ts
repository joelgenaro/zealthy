#!/usr/bin/env ts-node

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import '../env.config.ts';

// Ensure PROJECT_REF_PROD is set
const projectRef =
  process.env.SUPABASE_PROJECT_REF_PROD ?? 'gcqrvlegvyiunwewkuoz';

if (!projectRef) {
  console.error(
    'Error: SUPABASE_PROJECT_REF_PROD is not defined in the environment.'
  );
  process.exit(1);
}

try {
  // Run the Supabase CLI command to generate TypeScript types
  const supabaseCmd = `yarn dlx supabase gen types typescript --project-id "${projectRef}" --schema public`;
  const output = execSync(supabaseCmd, { encoding: 'utf8' });

  // Filter out any log messages that come before the generated types
  const startMarker = 'export type ';
  const startIndex = output.indexOf(startMarker);
  const typesOutput = startIndex !== -1 ? output.slice(startIndex) : output;

  // Write output to database.types.d.ts
  const outputPath = path.resolve(process.cwd(), 'src/lib/database.types.d.ts');
  fs.writeFileSync(outputPath, typesOutput);
  console.log('Generated database.types.d.ts successfully.');
} catch (error) {
  console.error('Error generating database types:', error);
  process.exit(1);
}

try {
  // Run the enum generator script
  const enumScriptPath = path.resolve(
    process.cwd(),
    'scripts/generate-enums.ts'
  );
  execSync(`ts-node ${enumScriptPath}`, { stdio: 'inherit' });
  console.log('Enum generation completed successfully.');
} catch (error) {
  console.error('Error running enum generator:', error);
  process.exit(1);
}
