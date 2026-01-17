#!/usr/bin/env node
/**
 * Documentation generator that extracts JSDoc comments from TypeScript source files.
 * Descriptions come directly from the code comments.
 */

const fs = require('fs');
const path = require('path');

const OUTPUT_FILE = path.join(__dirname, '../API.md');
const TYPES_DIR = path.join(__dirname, '../src/lib/GaugeComponent/types');

/**
 * Parse a TypeScript file and extract interface properties with their JSDoc comments.
 */
function parseTypeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const interfaces = {};
  
  // Match interface declarations
  const interfaceRegex = /(?:\/\*\*[\s\S]*?\*\/\s*)?(export\s+)?interface\s+(\w+)(?:\s+extends\s+\w+)?\s*\{([\s\S]*?)\n\}/g;
  let match;
  
  while ((match = interfaceRegex.exec(content)) !== null) {
    const interfaceName = match[2];
    const interfaceBody = match[3];
    interfaces[interfaceName] = parseInterfaceBody(interfaceBody);
  }
  
  return interfaces;
}

/**
 * Parse interface body and extract properties with their comments.
 */
function parseInterfaceBody(body) {
  const props = [];
  const lines = body.split('\n');
  let currentComment = '';
  let inMultiLineComment = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Start of multi-line comment
    if (line.startsWith('/**')) {
      inMultiLineComment = true;
      currentComment = '';
      // Check if single-line JSDoc
      if (line.includes('*/')) {
        currentComment = line.replace(/\/\*\*\s*/, '').replace(/\s*\*\//, '').trim();
        inMultiLineComment = false;
      }
      continue;
    }
    
    // Inside multi-line comment
    if (inMultiLineComment) {
      if (line.includes('*/')) {
        inMultiLineComment = false;
      } else {
        // Extract comment text, removing leading * and @example blocks
        const commentLine = line.replace(/^\*\s?/, '').trim();
        if (!commentLine.startsWith('@')) {
          currentComment += (currentComment ? ' ' : '') + commentLine;
        }
      }
      continue;
    }
    
    // Property line
    const propMatch = line.match(/^(\w+)\??:\s*(.+?)[,;]?\s*$/);
    if (propMatch) {
      const propName = propMatch[1];
      let propType = propMatch[2];
      
      // Clean up type
      propType = propType.replace(/[,;]$/, '').trim();
      
      props.push({
        name: propName,
        type: propType,
        description: currentComment || ''
      });
      currentComment = '';
    }
  }
  
  return props;
}

/**
 * Load all type definitions from the types directory.
 */
function loadAllTypes() {
  const allTypes = {};
  const files = ['GaugeComponentProps.ts', 'Arc.ts', 'Labels.ts', 'Pointer.ts', 'Tick.ts', 'Tooltip.ts'];
  
  for (const file of files) {
    const filePath = path.join(TYPES_DIR, file);
    if (fs.existsSync(filePath)) {
      const interfaces = parseTypeFile(filePath);
      Object.assign(allTypes, interfaces);
    }
  }
  
  return allTypes;
}

/**
 * Generate markdown for an interface's properties.
 */
function generatePropsMarkdown(props, allTypes, indent = 0, visited = new Set()) {
  let md = '';
  const prefix = '  '.repeat(indent);
  
  for (const prop of props) {
    const desc = prop.description || `The ${prop.name} property.`;
    md += `${prefix}- \`${prop.name}\` (\`${prop.type}\`) - ${desc}\n`;
    
    // Check if this type has nested properties we should expand
    const typeMatch = prop.type.match(/^(Arc|Labels|PointerProps|TickLabels|ValueLabel|SubArc|Tooltip|TickValueConfig|TickLineConfig|ArcEffects|PointerEffects|LabelEffects|TickEffects)$/);
    if (typeMatch && allTypes[typeMatch[1]] && !visited.has(typeMatch[1])) {
      visited.add(typeMatch[1]);
      md += generatePropsMarkdown(allTypes[typeMatch[1]], allTypes, indent + 1, visited);
      visited.delete(typeMatch[1]);
    }
  }
  
  return md;
}

/**
 * Generate the complete API documentation.
 */
function generateDocumentation() {
  const allTypes = loadAllTypes();
  
  let md = `# React Gauge Component API Reference

> **GaugeComponent props and structure**  
> Last updated: ${new Date().toISOString().split('T')[0]}

## GaugeComponentProps

\`<GaugeComponent />\` accepts the following props:

`;

  // Main component props
  if (allTypes.GaugeComponentProps) {
    for (const prop of allTypes.GaugeComponentProps) {
      const desc = prop.description || `The ${prop.name} property.`;
      md += `- **\`${prop.name}\`** (\`${prop.type}\`) - ${desc}\n`;
      
      // Expand nested types
      const typeMatch = prop.type.match(/^(Arc|Labels|PointerProps)$/);
      if (typeMatch && allTypes[typeMatch[1]]) {
        md += generatePropsMarkdown(allTypes[typeMatch[1]], allTypes, 1, new Set([typeMatch[1]]));
      }
      md += '\n';
    }
  }

  // Additional type documentation
  md += `---

## SubArc

SubArc configuration for arc segments:

`;
  if (allTypes.SubArc) {
    md += generatePropsMarkdown(allTypes.SubArc, allTypes, 0, new Set());
  }

  md += `
---

## PointerWithValue

Extended pointer configuration with embedded value (for multi-pointer mode):

`;
  if (allTypes.PointerWithValue) {
    md += generatePropsMarkdown(allTypes.PointerWithValue, allTypes, 0, new Set());
  }

  md += `
---

## Effects

### ArcEffects

`;
  if (allTypes.ArcEffects) {
    md += generatePropsMarkdown(allTypes.ArcEffects, allTypes, 0, new Set());
  }

  md += `
### PointerEffects

`;
  if (allTypes.PointerEffects) {
    md += generatePropsMarkdown(allTypes.PointerEffects, allTypes, 0, new Set());
  }

  md += `
### LabelEffects

`;
  if (allTypes.LabelEffects) {
    md += generatePropsMarkdown(allTypes.LabelEffects, allTypes, 0, new Set());
  }

  md += `
### TickEffects

`;
  if (allTypes.TickEffects) {
    md += generatePropsMarkdown(allTypes.TickEffects, allTypes, 0, new Set());
  }

  md += `
---

## Common Patterns

### Basic Gauge

\`\`\`jsx
<GaugeComponent value={65} />
\`\`\`

### Styled Gauge with SubArcs

\`\`\`jsx
<GaugeComponent
  value={75}
  arc={{
    subArcs: [
      { limit: 30, color: '#EA4228' },
      { limit: 70, color: '#F5CD19' },
      { color: '#5BE12C' }
    ]
  }}
  pointer={{ type: "needle", elastic: true }}
/>
\`\`\`

### Custom Content with renderContent

\`\`\`jsx
<GaugeComponent
  value={42}
  labels={{
    valueLabel: {
      renderContent: (value, color) => (
        <div style={{ textAlign: 'center', color }}>
          <span style={{ fontSize: '2rem' }}>{value}</span>
          <span style={{ fontSize: '0.8rem' }}>km/h</span>
        </div>
      )
    }
  }}
/>
\`\`\`

### Interactive Gauge (Input Mode)

\`\`\`jsx
<GaugeComponent
  value={value}
  onValueChange={setValue}
/>
\`\`\`

### Multi-Pointer Gauge

\`\`\`jsx
<GaugeComponent
  pointers={[
    { value: 25, color: '#FF6B6B', label: 'CPU' },
    { value: 60, color: '#4ECDC4', label: 'Memory' }
  ]}
/>
\`\`\`

---

*This documentation is auto-generated from TypeScript source comments. To regenerate: \`yarn docs\`*
`;

  return md;
}

// Main execution
function main() {
  console.log('Generating API documentation from TypeScript source...');
  
  const markdown = generateDocumentation();
  fs.writeFileSync(OUTPUT_FILE, markdown);
  
  console.log('Generated documentation:');
  console.log('  - ' + OUTPUT_FILE);
  console.log('\nDescriptions are extracted directly from JSDoc comments in:');
  console.log('  - src/lib/GaugeComponent/types/*.ts');
}

main();
