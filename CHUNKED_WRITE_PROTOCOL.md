# CHUNKED WRITE PROTOCOL (MANDATORY)

**Last Updated:** 2026-05-28T12:04:03.496Z

You MUST follow these rules for ALL file operations. Violation causes server timeouts and task failure.

---

## ABSOLUTE LIMITS

- **MAXIMUM 350 LINES** per single write/edit operation - NO EXCEPTIONS
- **RECOMMENDED 300 LINES** or less for optimal performance
- **NEVER** write entire files in one operation if >300 lines

---

## MANDATORY CHUNKED WRITE STRATEGY

### For NEW FILES (>300 lines total):

1. **FIRST:** Write initial chunk (first 250-300 lines) using write_file
2. **THEN:** Append remaining content in 250-300 line chunks
3. **REPEAT:** Continue appending until complete

### For EDITING EXISTING FILES:

1. Use surgical edits (patch tool) - change ONLY what's needed
2. NEVER rewrite entire files - use incremental modifications
3. Split large refactors into multiple small, focused edits

### For LARGE CODE GENERATION:

1. Generate in logical sections (imports, types, functions separately)
2. Write each section as a separate operation
3. Use append operations for subsequent sections

---

## EXAMPLES OF CORRECT BEHAVIOR

### CORRECT: Writing a 600-line file

```
Operation 1: write_file() → lines 1-300 (initial file creation)
Operation 2: append() → lines 301-600
```

### CORRECT: Editing multiple functions

```
Operation 1: patch() → Edit function A
Operation 2: patch() → Edit function B
Operation 3: patch() → Edit function C
```

### WRONG: Writing 500 lines in single operation

```
❌ TIMEOUT - Server cannot handle
```

### WRONG: Rewriting entire file to change 5 lines

```
❌ TIMEOUT - Inefficient and fails
```

### WRONG: Generating massive code blocks without chunking

```
❌ TIMEOUT - Exceeds operation limits
```

---

## WHY THIS MATTERS

- Server has 2-3 minute timeout for operations
- Large writes exceed timeout and FAIL completely
- Chunked writes are FASTER and more RELIABLE
- Failed writes waste time and require retry
- Multiple small operations complete successfully

---

## IMPLEMENTATION CHECKLIST

Before writing ANY file:

- [ ] Count total lines in file
- [ ] If >300 lines: Plan chunking strategy
- [ ] If editing: Use surgical edits only
- [ ] If generating code: Split into logical sections
- [ ] Write first chunk (250-300 lines max)
- [ ] Append remaining chunks (250-300 lines each)
- [ ] Verify file integrity after completion

---

## QUICK REFERENCE

| Operation | Max Lines | Strategy |
|-----------|-----------|----------|
| New file <300 lines | 300 | Single write_file() |
| New file >300 lines | 300 per chunk | write_file() + append() |
| Edit existing | 50-100 | patch() - surgical only |
| Code generation | 250-300 | Split by logical sections |

---

## REMEMBER

**When in doubt, write LESS per operation.**

Multiple small operations > one large operation

---

## TOOLS REFERENCE

### write_file(path, content)
- Creates new file or overwrites existing
- Max 350 lines recommended
- Use for initial chunk of large files

### patch(path, old_string, new_string)
- Surgical edits to existing files
- Change ONLY what's needed
- Use for incremental modifications

### Append operations
- Use for adding content to existing files
- Recommended for chunked writes
- Keeps file integrity

---

**Status:** MANDATORY FOR ALL FILE OPERATIONS
**Enforcement:** Automatic - violations cause timeouts
**Last Review:** 2026-05-28T12:04:03.496Z
