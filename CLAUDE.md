# Claude Code Guidelines

This file contains project-specific rules and guidelines for Claude Code when working on this project.

## 🚨 GOLDEN RULE - NO ACTION WITHOUT APPROVAL

**ABSOLUTE CRITICAL RULE**: NEVER TAKE ANY ACTION, MAKE ANY CHANGES, OR IMPLEMENT ANYTHING WITHOUT EXPLICIT USER APPROVAL FIRST.

This means:
- **NO code changes** without approval
- **NO database operations** without approval  
- **NO file modifications** without approval
- **NO implementations** without approval
- **NO fixes** without approval
- **NO optimizations** without approval
- **NO refactoring** without approval

**ALWAYS**:
1. **ANALYZE** and present findings
2. **PROPOSE** approach and get explicit approval
3. **IMPLEMENT** only after user says "yes" or "proceed"

**NEVER ASSUME** the user wants you to take action. Always ask first.

## Database Modification Protocol

**CRITICAL**: Before making any changes to Supabase database data:

1. **Analyze and Report First**
   - Query and examine the current state
   - Identify the specific issue or inconsistency
   - Document what you found and why it might be problematic

2. **Propose Approach and Get Confirmation** 
   - Present the proposed solution clearly
   - Explain the impact and rationale
   - Wait for explicit user approval before proceeding

3. **Implement Only After Approval**
   - Execute the agreed-upon changes
   - Verify the results match expectations
   - Document what was changed

**Never make database modifications without explicit user confirmation first.**

This applies to all database operations including:
- Data updates and corrections
- Schema modifications 
- Constraint changes
- Data cleanup operations
- Migration scripts

## Implementation Protocol

**CRITICAL RULE**: Never start implementing features or fixes without explicit user approval:

1. **Always Plan First**
   - Present a comprehensive plan using ExitPlanMode tool
   - Detail the approach, files to be changed, and expected outcomes
   - Wait for explicit user approval before making any changes

2. **No Direct Implementation**
   - Never jump straight into coding or making changes
   - Always get plan approval first, regardless of task complexity
   - Use appropriate agents for analysis and planning, not implementation

3. **User-Driven Development**
   - Respect the user's need to review and approve all work
   - Maintain collaborative control over the development process
   - Ensure alignment before proceeding with any modifications

**This rule applies to ALL work including**: Features, bug fixes, optimizations, refactoring, documentation updates, and any code changes.

## Rationale

Database changes directly affect production data and can have unintended consequences. Getting confirmation ensures:
- Alignment on the correct approach
- Understanding of business requirements
- Prevention of data loss or corruption
- Clear documentation of intentional changes

## Collaborative Implementation Planning Protocol

**CRITICAL**: Before implementing any significant features or changes:

1. **Draft Implementation Plan**
   - Create detailed implementation plan with step-by-step approach
   - Include technical architecture, file structure, and key components
   - Identify potential risks, dependencies, and integration points
   - Document expected outcomes and success criteria

2. **Collaborative Review Required** 
   - Present the draft plan to user for review and discussion
   - Walk through the logic and approach together
   - Get explicit approval on the plan before starting implementation
   - Adjust plan based on user feedback and requirements

3. **No Independent Implementation**
   - Never start major implementation work without plan approval
   - Implementation should follow the agreed-upon plan
   - Check in regularly during implementation for complex changes
   - Get confirmation before making significant deviations from plan

**Never implement complex features or architectural changes without collaborative planning first.**

This applies to:
- New feature development
- Major refactoring efforts
- Architectural changes
- Integration of multiple components
- Database schema modifications
- UI/UX rebuilds

4. **Implementation Plan Documentation**
   - All implementation plans must be documented directly in the relevant Story file
   - Include detailed step-by-step procedures with code examples
   - Document all collaborative decisions with reasoning
   - Update story files to reflect agreed-upon approach and technical architecture
   - Provide comprehensive implementation blueprint that can be followed directly

## Rationale

Collaborative planning ensures:
- Alignment on technical approach and business requirements
- Prevention of wasted effort on incorrect solutions
- Clear understanding of implementation scope and complexity
- Opportunity to identify risks and dependencies early
- Shared ownership of the solution approach

## Testing and Deployment Protocol

**REQUIRED**: All changes must be tested through proper deployment workflow:

1. **Confirm Development Branch**
   - Before starting implementation, confirm if current git branch suffices for the planned work
   - If current branch is appropriate, continue using it
   - If new branch is needed, create dedicated git development branch with descriptive name
   - Never work directly on main/master branch
   - Use descriptive branch names (e.g., `feature/reciprocal-metadata`, `fix/migration-bug`)

2. **Deploy to Vercel for Testing**
   - Push development branch to remote repository (git push origin branch-name)
   - Vercel automatically deploys the branch through git integration
   - Test all functionality in the deployed environment
   - Verify database connections and operations work correctly
   - Confirm UI/UX changes render properly

3. **Validate Before Merge**
   - Ensure all tests pass
   - Confirm no regressions introduced
   - Verify performance is acceptable
   - Get user approval on deployed changes

**Never merge to main without testing via Vercel deployment first.**

This ensures:
- Changes work in production-like environment
- Database integrations function correctly
- No deployment surprises or failures
- Quality assurance before affecting main branch

## Backup Archive Management Protocol

**CRITICAL**: Maintain comprehensive backup archives with full documentation:

1. **Backup Creation Requirements**
   - Create `.bak` files or `.bak` directories for all significant code being replaced
   - Never delete, move, or modify any existing backup files without explicit user approval
   - Preserve original file paths and directory structures in backup naming

2. **Backup Archive Documentation**
   - Maintain `/backup-archive/backup-explainer.md` file documenting all backup files
   - Include for each backup:
     * File/directory path and name
     * Original purpose and functionality  
     * Date and time of backup creation
     * Reason for archival (what was replacing it)
     * Size/complexity metrics where relevant
     * Dependencies or related files
   - Update explainer file whenever new backups are created

3. **Cleanup Protocol**
   - **NEVER remove backup files without explicit testing and user approval first**
   - Test all new implementations thoroughly in deployed environment
   - Verify all functionality works correctly for at least one full development cycle
   - Get explicit user confirmation before any cleanup operations
   - Archive old backups to `/backup-archive/` directory before deletion
   - Update backup-explainer.md when archiving or removing backups

4. **Archive Directory Structure**
   ```
   /backup-archive/
   ├── backup-explainer.md              # Master documentation file
   ├── [YYYY-MM-DD]/                    # Date-organized archives
   │   ├── archived-backups/            # Moved .bak files
   │   └── archive-notes.md             # Specific archive session notes
   ```

**Rationale**: Backup files are critical safety nets for complex refactoring work. Premature cleanup can cause irreversible loss of working implementations and historical context needed for debugging or rollback scenarios.

## Surgical Implementation Protocol

**CRITICAL**: For complex multi-issue fixes requiring systematic implementation:

### 🔧 Surgical Implementation Approach

**Implementation Protocol**:
1. **One Issue at a Time**: Fix, test, commit each issue individually
2. **Incremental Testing**: Verify each fix works before moving to next
3. **Dependency Respect**: Never start dependent issue until prerequisite done
4. **State Management Focus**: Fix the core sync issue first - it unlocks everything

**Testing Protocol for Each Fix**:
```javascript
// After each fix:
1. Verify fix works in isolation
2. Verify no regressions in working functionality  
3. Test edge cases specific to that issue
4. Commit with descriptive message including issue number
5. Deploy to git for Vercel testing
6. Continue to next issue only after validation
```

**Commit Message Format**:
```
Fix Issue #X: [Brief Description]

- [Technical change 1]
- [Technical change 2]
- [Impact/benefit]

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

This ensures systematic, dependency-aware implementation with full traceability and no regressions.

## Attribute Migration Implementation Cycle

**CRITICAL**: For systematic metadata attribute migration, follow this standardized 8-step cycle:

### 🔄 8-Step Implementation Cycle

**Step 1: Check meta_values and current data usage**
- Query meta_values table for attribute values
- Check current EMV data usage and distribution
- Document findings

**Step 2: Check existing display implementation**
- Review WordCard.js for display logic
- Review meta-constants.js for UUIDs and mappings
- Review enhanced-dictionary-system.js for RPC integration
- Identify gaps and issues

**Step 3: Implementation (sub-steps as needed)**
- Add missing constants and UUIDs
- Update WordCard display logic
- Update RPC filter mapping
- Add Advanced Filter sections
- Migrate legacy code

**Step 4: Add test data**
- Add all attribute values to testnoun/testverb/testadjective/testadverb
- Ensure comprehensive test coverage

**Step 5: Test implementation**
- Verify display functionality
- Test filtering behavior  
- Confirm RPC integration works

**Step 6: Legacy Code Cleanup Verification**
- **MANDATORY**: Search for and remove ALL legacy code
- Check Dictionary Panel, WordCard, Enhanced Dictionary System
- Look for old display mappings, filter arrays, tag references
- Confirm complete migration to RPC UUID system
- Document cleanup in commit message

**Step 7: Complete attribute review**
- Mark attribute as fully functional
- Update documentation
- Move to next attribute

This cycle ensures complete, systematic implementation with no legacy code remaining.

## Translation-Level Attribute Validation Protocol

**CRITICAL**: For translation-level attributes, follow this specialized validation approach:

### 🔍 Translation-Level Validation Steps

**Step 1: RPC Data Verification**
- Query RPC function for existing usage in core_tags array
- Verify attribute appears correctly in translation.core_tags structure
- Document current usage patterns and data distribution

**Step 2: Display Logic Assessment** 
- Check restriction-utils.js parseRestrictions function for handling
- Verify WordCard.js getRestrictionIndicators integration
- Confirm proper symbol/icon display (♂/♀, etc.)

**Step 3: Test Data Validation**
- Add test values to testnoun/testverb/testadjective translations
- Verify symbols appear in restriction indicator section (not word tags)
- Test all attribute values display correctly

**Step 4: Advanced Filter Exclusion**
- Confirm translation-level attributes are NOT in Advanced Filters
- Verify no filter-utils.js integration needed
- Document why filtering not applicable (translation-specific data)

**Step 5: Complete Validation**
- Mark attribute as fully functional if all display logic exists
- Document any gaps in display or RPC integration
- Move to next attribute only after approval

This protocol ensures translation-level attributes are properly validated without unnecessary Advanced Filter implementation.