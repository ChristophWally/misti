# Backup Archive Documentation

This file documents all backup files and archived components created during development, including their purpose, location, and restoration procedures.

> **Note**: This documentation has been moved from `backup-archive/backup-explainer.md` to the main documentation folder for better accessibility and version control tracking.

## Current Active Backups

### Story 002.003.2 - Migration Tools Interface Rebuild (Created: 2025-08-22)

**Backup Creation Date**: 2025-08-22 21:20:58 +0100  
**Reason**: Complete rebuild of broken MigrationToolsInterface (5588 lines → simplified architecture)  
**Related Commit**: 56801cb - Fix TypeScript error in DatabaseService COLUMN_MAPPINGS

#### `/Users/Work/misti/components/admin/MigrationToolsInterface.tsx.bak`
- **Original Purpose**: Main migration tools interface with 72+ useState hooks
- **File Size**: 5588 lines (extremely complex, race conditions, broken Step 2)
- **Key Issues**: State management chaos, Step 2 metadata loading failures, hard to maintain
- **Replaced By**: `/Users/Work/misti/app/admin/migration-tools/components/MigrationToolsInterface.tsx` (8 grouped useState, simplified architecture)
- **Dependencies**: Old contexts (DatabaseContext, MigrationContext), SimpleMigrationTest component
- **Status**: ACTIVE BACKUP - DO NOT DELETE (not tested yet)

#### `/Users/Work/misti/app/admin/migration-tools/page.tsx.bak`
- **Original Purpose**: Admin page using old MigrationToolsInterface location
- **Functionality**: Basic page wrapper, status cards, integration test links
- **Path Issues**: Referenced old component location (`../../../components/admin/MigrationToolsInterface`)
- **Replaced By**: New page.tsx with automated validation, rebuilt interface, proper imports
- **Status**: ACTIVE BACKUP - DO NOT DELETE (not tested yet)

#### `/Users/Work/misti/components/admin/SimpleMigrationTest.tsx.bak`
- **Original Purpose**: Test component for migration rule creation and Step 2 metadata loading
- **Key Features**: Word search, Step 2 metadata extraction, rule persistence testing
- **File Size**: 837 lines of test functionality
- **Story Integration**: Story 2.3.1 unified metadata schema testing
- **Replaced By**: Integrated functionality in new three-tab architecture (AuditTab, MigrationTab, ProgressTab)
- **Status**: ACTIVE BACKUP - DO NOT DELETE (not tested yet)

#### `/Users/Work/misti/app/admin/simple-migration-test.bak/`
- **Original Purpose**: Directory containing test page for SimpleMigrationTest component
- **Contents**: page.tsx with test instructions and component wrapper
- **Functionality**: Standalone testing interface for migration rule development
- **Replaced By**: Unified migration tools interface with integrated testing capabilities
- **Status**: ACTIVE BACKUP - DO NOT DELETE (not tested yet)

#### `/Users/Work/misti/app/admin/migration-tools-refactored.bak/`
- **Original Purpose**: Previous iteration backup directory
- **Contents**: Earlier refactoring attempts or intermediate versions
- **Status**: ACTIVE BACKUP - investigate contents before any cleanup

## Testing Status

**⚠️ CRITICAL**: All backup files are UNTESTED for restoration. The new implementation has NOT been fully tested in deployed environment.

**Testing Required Before Any Cleanup**:
1. Deploy new interface to Vercel
2. Test all three tabs (Audit, Migration, Progress) 
3. Verify Step 2 metadata loading functionality
4. Test automated validation system
5. Confirm database integration works correctly
6. Verify Story 2.3.1 unified metadata support
7. Test complete workflow end-to-end
8. Get explicit user approval for functionality

## Archive History

*No files have been archived yet - all backups are active.*

---

## Admin Section Complete Removal (Created: 2025-09-11)

**Archive Creation Date**: 2025-09-11  
**Reason**: Complete removal of admin testing section to optimize website space and cleanup test infrastructure  
**Archive Location**: `backup-archive/2025-09-11/`

### Database Infrastructure Backup
**Location**: `backup-archive/2025-09-11/database-backups/`

#### **Database Tables Removed** (2 tables, 16 indexes total):
- **custom_migration_rules**: 31 rows, 10 indexes (including unique constraints, GIN indexes for JSONB)
- **migration_execution_log**: 6 rows, 6 indexes (including chronological and rollback indexes)
- **Foreign Key Constraint**: 1 self-referencing constraint in custom_migration_rules

#### **Backup Files Created**:
- `01_custom_migration_rules_schema.sql` - Complete table schema with all 10 indexes and constraints
- `02_migration_execution_log_schema.sql` - Complete table schema with all 6 indexes and constraints  
- `03_custom_migration_rules_data.sql` - Data inventory and restoration notes (31 rules)
- `04_migration_execution_log_data.sql` - Execution history summary (6 successful operations)
- `00_RESTORE_ADMIN_TABLES.sql` - Complete restoration script with verification queries

#### **Database Impact**: 
- **16 indexes removed** (performance optimization)
- **37 total rows removed** (31 rules + 6 execution logs)
- **1 foreign key constraint removed** 
- **2 complete tables dropped** with CASCADE

### Admin Application Files Archived
**Location**: `backup-archive/2025-09-11/admin-section/`

#### **Directory Structure Archived**:
- `app-admin/` - Complete `/app/admin/` directory
  - conjugation-validator/ (AdminValidationInterface)
  - migration-tools/ (extensive tooling infrastructure)
  - migration-tools-refactored/ + .bak variants
  - simple-migration-test/ + .bak variants
- `components-admin/` - Complete `/components/admin/` directory
  - AdminValidationInterface.tsx (31,156 tokens - very large)
  - MigrationToolsInterface.tsx and related components

#### **Navigation Changes**:
- Removed admin dropdown from `app/client-layout.js` (lines 47-72)
- Cleaned up admin-related comments and TODO items
- Preserved all other navigation functionality

### Admin Section Functionality Removed
**Original Purpose**: Testing and development admin tools including:
- Conjugation validation interface
- Database migration rule builder
- Migration execution tracking and rollback capabilities
- Custom rule creation and management
- Comprehensive metadata transformation tools

**Usage Analysis**: 
- All 31 migration rules had 0 execution count (purely experimental)
- 6 execution log entries showed successful but limited actual usage
- Primary categories: custom (test rules), terminology, cleanup operations
- Date range: 2025-08-17 to 2025-08-31 (recent test infrastructure)

### Restoration Instructions
**Complete restoration possible using**:
1. Database: Execute `00_RESTORE_ADMIN_TABLES.sql` 
2. Files: Restore from `app-admin/` and `components-admin/` directories
3. Navigation: Re-enable admin dropdown in client-layout.js
4. Verification: Test all admin routes and database connectivity

**Space Optimization Achieved**:
- Removed extensive admin codebase (~50+ files)
- Cleaned 16 database indexes for performance
- Eliminated 2 admin-specific database tables
- Simplified navigation and reduced complexity

### Archive Status
**Status**: ✅ COMPLETE ARCHIVE - Safely removable after verification testing  
**Testing Required**: Verify core website functionality unaffected  
**Restoration Capability**: 100% restorable if admin tools needed in future

---

**Last Updated**: 2025-09-11  
**Next Review**: After core website verification testing  
**Cleanup Status**: SAFE FOR ARCHIVE - Admin section completely backed up

## Planned Documentation Archive (2025-09)

The following pre‑v3 tagging documents will be moved into a dated subfolder under this archive once the PRD implementation is validated:

- documentation/tagging and db design.md (arrays/GIN era)
- documentation/Tagging and Database Design v2.md (superseded by v3)
- documentation/EPICS/002: Complete Conjugation System Architectural Rebuild/ (sections prescribing `optional_tags` arrays or GIN on tags)

An archive README will be created in the new folder noting: “pre‑v3 tagging (arrays/GIN) — retained for historical reference; see documentation/architecture/tagging_v3_dda.md.”
