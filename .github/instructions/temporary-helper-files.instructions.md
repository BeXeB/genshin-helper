---
name: "Temporary Helper Files Organization"
description: "Use when creating temporary helper scripts, analysis utilities, or data conversion scripts. Instructs the agent to organize all temporary/helper files in .github/agent/ folder to keep the workspace clean."
applyTo: "scripts/**, tools/**, *.analysis.*, *.conversion.*, analyze_*"
---

# Temporary Helper Files Organization

## Purpose

Keep the workspace root and main source directories clean by organizing all temporary, analysis, and helper scripts in a dedicated `.github/agent/` folder.

## When This Applies

This instruction applies when:
- Creating temporary analysis or extraction scripts (e.g., XLSX analysis, data inspection)
- Writing one-off conversion or transformation utilities
- Building helper functions to support other development tasks
- Creating data processing scripts that assist the agent in understanding input

## Rules

### 1. Location
All temporary and helper files must be created in the `.github/agent/` folder, NOT in the workspace root or main `src/` directory.

**Good:**
- `.github/agent/analyze_xlsx.js`
- `.github/agent/data-converter.ts`
- `.github/agent/spreadsheet-inspector.py`

**Bad:**
- `analyze_xlsx.js` (root)
- `src/analyze_xlsx.js` (source folder)
- `scripts/analyze_xlsx.js` (unless part of permanent build pipeline)

### 2. Naming Convention
Use clear, descriptive names that indicate the script's purpose:
- `analyze_*.js|ts|py` — for inspection/analysis scripts
- `extract_*.js|ts|py` — for data extraction utilities
- `convert_*.js|ts|py` — for conversion utilities
- `inspect_*.js|ts|py` — for diagnostic scripts

### 3. Documentation
Include a comment header explaining:
- What the script does
- When to run it
- Required dependencies (if any)
- Example usage

```typescript
/**
 * analyze_xlsx.js
 * Extracts all formulas, functions, and cell logic from XLSX files
 * 
 * Usage: node .github/agent/analyze_xlsx.js <filepath>
 * Dependencies: xlsx package
 */
```

### 4. Cleanup
After the helper script has served its purpose (task completed, analysis done):
- Remove the script from `.github/agent/`
- OR move it to `scripts/` if it becomes a permanent utility

## Creating the .github/agent/ Folder

If the `.github/agent/` folder does not exist, create it with:
- An empty `.gitkeep` file to ensure the folder is tracked in git
- A simple `README.md` documenting the folder's purpose (optional)

## Example Workflow

1. **Task**: "Analyze the XLSX file to extract all formulas"
2. **Agent creates**: `.github/agent/analyze_xlsx.js`
3. **Agent runs**: Node script to extract and display formulas
4. **Task completes**: Report shared with user
5. **Cleanup**: Script remains in `.github/agent/` for reference, or deleted if no longer needed

## Benefits

- **Clean workspace**: No temporary scripts cluttering the root
- **Organized**: All helper tools in one predictable location
- **Temporary**: Easy to see what's meant to be permanent vs. ephemeral
- **Git-friendly**: Helper scripts are isolated from source code and build artifacts
