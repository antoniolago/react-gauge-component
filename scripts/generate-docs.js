#!/usr/bin/env node
/**
 * Script to generate API documentation from TypeScript type definitions.
 * Parses TSDoc comments and generates markdown documentation.
 * 
 * Usage: node scripts/generate-docs.js
 * Output: docs/API.md
 */

const fs = require('fs');
const path = require('path');

const TYPES_DIR = path.join(__dirname, '../src/lib/GaugeComponent/types');
const OUTPUT_FILE = path.join(__dirname, '../docs/API.md');

// Files to process in order
const TYPE_FILES = [
  'GaugeComponentProps.ts',
  'Arc.ts', 
  'Pointer.ts',
  'Labels.ts',
  'Tick.ts',
  'Tooltip.ts'
];

/**
 * Parse a TypeScript file and extract interfaces with their properties and comments
 */
function parseTypeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const interfaces = [];
  
  // Match interface declarations with their comments
  const interfaceRegex = /(?:\/\*\*[\s\S]*?\*\/\s*)?(export\s+)?interface\s+(\w+)(?:\s+extends\s+[\w,\s]+)?\s*\{([^}]*(?:\{[^}]*\}[^}]*)*)\}/g;
  
  let match;
  while ((match = interfaceRegex.exec(content)) !== null) {
    const interfaceName = match[2];
    const body = match[3];
    
    // Get interface comment if exists
    const beforeMatch = content.substring(0, match.index);
    const commentMatch = beforeMatch.match(/\/\*\*([\s\S]*?)\*\/\s*$/);
    const interfaceComment = commentMatch ? cleanComment(commentMatch[1]) : '';
    
    const properties = parseProperties(body);
    
    interfaces.push({
      name: interfaceName,
      comment: interfaceComment,
      properties
    });
  }
  
  // Also parse enums
  const enumRegex = /(?:\/\*\*[\s\S]*?\*\/\s*)?(export\s+)?enum\s+(\w+)\s*\{([^}]*)\}/g;
  while ((match = enumRegex.exec(content)) !== null) {
    const enumName = match[2];
    const body = match[3];
    const values = body.split(',').map(v => v.trim().split('=')[0].trim()).filter(Boolean);
    
    interfaces.push({
      name: enumName,
      comment: `Enum values: ${values.join(', ')}`,
      properties: [],
      isEnum: true,
      values
    });
  }
  
  return interfaces;
}

/**
 * Parse properties from an interface body
 */
function parseProperties(body) {
  const properties = [];
  const lines = body.split('\n');
  
  let currentComment = '';
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Collect multi-line comments
    if (trimmed.startsWith('/**') || trimmed.startsWith('*')) {
      currentComment += trimmed.replace(/^\/?\*+\s?/, '').replace(/\*\/$/, '') + ' ';
      continue;
    }
    
    // Match property: name?: Type
    const propMatch = trimmed.match(/^(\w+)\??:\s*(.+?)[,;]?\s*$/);
    if (propMatch) {
      properties.push({
        name: propMatch[1],
        type: propMatch[2].replace(/[,;]$/, ''),
        comment: currentComment.trim(),
        optional: trimmed.includes('?:')
      });
      currentComment = '';
    }
  }
  
  return properties;
}

/**
 * Clean up a JSDoc comment
 */
function cleanComment(comment) {
  return comment
    .split('\n')
    .map(line => line.trim().replace(/^\*\s?/, ''))
    .filter(line => !line.startsWith('@'))
    .join(' ')
    .trim();
}

/**
 * Generate markdown documentation
 */
function generateMarkdown(allInterfaces) {
  let md = `# React Gauge Component API Reference

> **Auto-generated from TypeScript types**  
> Last updated: ${new Date().toISOString().split('T')[0]}

This document is automatically generated from the TypeScript type definitions.
To regenerate, run: \`yarn docs\`

## Table of Contents

`;

  // Generate TOC
  for (const iface of allInterfaces) {
    md += `- [${iface.name}](#${iface.name.toLowerCase()})\n`;
  }
  
  md += '\n---\n\n';
  
  // Generate interface docs
  for (const iface of allInterfaces) {
    md += `## ${iface.name}\n\n`;
    
    if (iface.comment) {
      md += `${iface.comment}\n\n`;
    }
    
    if (iface.isEnum) {
      md += `**Enum Values:** \`${iface.values.join('` | `')}\`\n\n`;
    } else if (iface.properties.length > 0) {
      md += `| Property | Type | Required | Description |\n`;
      md += `|----------|------|----------|-------------|\n`;
      
      for (const prop of iface.properties) {
        const required = prop.optional ? 'No' : 'Yes';
        const type = prop.type.replace(/\|/g, '\\|').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const desc = prop.comment || '-';
        md += `| \`${prop.name}\` | \`${type}\` | ${required} | ${desc} |\n`;
      }
      md += '\n';
    }
    
    md += '---\n\n';
  }
  
  return md;
}

// Main execution
function main() {
  console.log('Generating API documentation...');
  
  // Ensure docs directory exists
  const docsDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }
  
  const allInterfaces = [];
  
  for (const file of TYPE_FILES) {
    const filePath = path.join(TYPES_DIR, file);
    if (fs.existsSync(filePath)) {
      console.log(`  Parsing ${file}...`);
      const interfaces = parseTypeFile(filePath);
      allInterfaces.push(...interfaces);
    } else {
      console.warn(`  Warning: ${file} not found`);
    }
  }
  
  const markdown = generateMarkdown(allInterfaces);
  fs.writeFileSync(OUTPUT_FILE, markdown);
  
  console.log(`\nGenerated ${OUTPUT_FILE}`);
  console.log(`  - ${allInterfaces.length} interfaces/enums documented`);
}

main();
