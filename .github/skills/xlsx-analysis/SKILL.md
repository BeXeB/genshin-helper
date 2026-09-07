---
name: xlsx-analysis
description: 'Analyze XLSX spreadsheets to extract functions, formulas, and cell logic for code conversion. Use when converting a spreadsheet into a program, understanding spreadsheet structure, or documenting spreadsheet logic.'
argument-hint: 'Describe the spreadsheet location and what you want to extract (e.g., "analyze functions in revenue calculation sheet")'
user-invocable: true
---

# XLSX Analysis & Code Conversion

## When to Use

- **Convert spreadsheet to code**: Extract all formulas and logic from a sheet to understand what needs to be programmed
- **Document spreadsheet logic**: Create a reference guide of all functions, dependencies, and data flows
- **Understand complex sheets**: Map out which cells depend on which others to reveal the program structure
- **Extract function logic**: Identify custom functions or patterns that need to become real code

## Prerequisites

Ensure you have:
- Node.js installed (14+)
- `xlsx` package: `npm install xlsx`
- The XLSX file path accessible in your workspace

## Procedure

### 1. Load and Inspect the XLSX File

The agent will create and run a Node.js analysis script using the `xlsx` package to:
- Read all sheet names
- Extract cell values and formulas for each sheet
- Identify cell data types (number, text, formula, etc.)
- Display the full grid structure (A1, A2, B1, etc. with contents)

**Expected output**: A structured view of the entire spreadsheet showing formulas, not just values.

**Example prompt**:
> "Use the xlsx-analysis skill to inspect my `data/calculator.xlsx` file. Show me all sheets, and for the 'Calculations' sheet, display every cell with its formula or value."

### 2. Identify Functions and Dependencies

Map the logic:
- Which cells contain formulas vs. static values?
- What cells do formulas depend on (inputs/references)?
- Are there named ranges or custom functions?
- What is the flow: inputs → calculations → outputs?

**Expected output**: A dependency graph or list showing how data flows through the sheet.

### 3. Extract Core Logic

Create a code skeleton:
- List all distinct operations (sum, multiply, lookup, IF statements, etc.)
- Group cells by their functional purpose (inputs, calculations, outputs)
- Note any conditional logic or loops that need special handling
- Identify parameters that should become function arguments

**Expected output**: Pseudocode or structured outline of the logic to implement.

### 4. Convert to Code

Work with the agent to:
- Transform formulas into functions in your chosen language (Python, TypeScript, etc.)
- Create data structures for inputs/outputs
- Implement any custom logic or lookups
- Add error handling where the spreadsheet has error checks

**Expected output**: Working code that replicates the spreadsheet's logic.

## Key Patterns

### Pattern: Examine All Cells
If the spreadsheet is large, ask the agent to focus on specific sheets or ranges:
```
"Show me only the formulas (not plain text) from rows 1-50 in the 'Revenue' sheet"
```

### Pattern: Extract Named Ranges
Some spreadsheets use named cells. Ask for:
```
"Extract all named ranges and their cell references"
```

### Pattern: Document Data Flow
Use dependency analysis:
```
"For each output cell, trace back all input cells it depends on (direct and indirect)"
```

## Common Challenges

**Challenge**: Spreadsheet uses complex formulas like `INDEX/MATCH` or array formulas
- **Solution**: Ask the agent to break down the formula step-by-step and explain what it does

**Challenge**: Circular references or mutual dependencies
- **Solution**: Ask the agent to identify and flag these; decide if they're intentional

**Challenge**: VBA macros or custom functions
- **Solution**: These can't be extracted automatically; manually review VBA code or ask agent to document what they do

## Example Workflow

1. **Load**: "Inspect my `budget.xlsx` file and show me all cells in the 'Summary' sheet with their formulas."
2. **Analyze**: "Map the dependencies: which cells feed into the 'Total' cell (B10)?"
3. **Extract**: "Create a pseudocode outline of the 'Total' calculation logic."
4. **Convert**: "Write TypeScript code that replicates the Total calculation logic using objects for named ranges."
5. **Test**: "Verify the TypeScript function produces the same output as the spreadsheet for example data."

## Tools Used

The agent will use:
- Node.js with the `xlsx` package to load and read XLSX files
- Analysis scripts to identify formulas, cell references, and dependencies
- Your code editor to create and test the converted code

## Tips

- Start with **small sections** of the spreadsheet, not the entire file at once
- Ask for **formulas, not values** — values change; formulas show the logic
- Create a **mapping document** that shows spreadsheet cell → code variable/function
- **Test incrementally** — convert a few formulas first, verify they work, then expand
