# Claude Code Guidelines

This file contains project-specific rules and guidelines for Claude Code when working on this project.

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
   - Deploy the development branch to Vercel
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