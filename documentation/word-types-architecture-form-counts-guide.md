# Italian Verb Form Counts Guide

## Overview

This document defines the complete form generation system for Italian verbs, including restriction-based form counting, auxiliary type multiplication, and form-translation coverage requirements.

## Restriction Types and Form Counts

Each verb translation has a restriction type that determines which grammatical forms are valid. The table below shows the exact form counts for each restriction:

| Group | Restriction Type | Description | Total Forms |
|-------|------------------|-------------|-------------|
| 0 | Normal - No Restriction | All standard forms allowed | 130 |
| 1 | plural-only | Only plural persons allowed | 60 |
| 2 | third-singular-only | Only 3rd person singular + non-finite | 27 |
| 3 | third-person-only | Only 3rd person singular/plural + non-finite | 48 |
| 4 | missing-first-second-person | 3rd person + all plural + non-finite | 81 |
| 5 | missing-imperative | All forms except imperative mood | 120 |
| 6 | singular-only | Only singular persons + non-finite | 69 |

## Complete Restriction Validity Matrix

The following table shows exactly which person/number combinations are valid for each restriction type across all tenses and moods. Each "1" represents a valid form that should be generated:

### Columns Legend:
- **prima-persona singolare**: 1st person singular (io)
- **seconda-persona singolare**: 2nd person singular (tu)
- **terza-persona singolare**: 3rd person singular (lui/lei)
- **prima-persona plurale**: 1st person plural (noi)
- **seconda-persona plurale**: 2nd person plural (voi)
- **terza-persona plurale**: 3rd person plural (loro)
- **infinito**: Non-finite forms (infinitive, gerund, participle)

### Normal - No Restriction (Group 0):
| Type | Mood | Tense | 1sg | 2sg | 3sg | 1pl | 2pl | 3pl | inf |
|------|------|-------|-----|-----|-----|-----|-----|-----|-----|
| simple | indicativo | presente | 1 | 1 | 1 | 1 | 1 | 1 | 0 |
| simple | indicativo | imperfetto | 1 | 1 | 1 | 1 | 1 | 1 | 0 |
| simple | indicativo | passato-remoto | 1 | 1 | 1 | 1 | 1 | 1 | 0 |
| simple | indicativo | futuro-semplice | 1 | 1 | 1 | 1 | 1 | 1 | 0 |
| compound | indicativo | passato-prossimo | 1 | 1 | 1 | 1 | 1 | 1 | 0 |
| compound | indicativo | trapassato-prossimo | 1 | 1 | 1 | 1 | 1 | 1 | 0 |
| compound | indicativo | futuro-anteriore | 1 | 1 | 1 | 1 | 1 | 1 | 0 |
| compound | indicativo | trapassato-remoto | 1 | 1 | 1 | 1 | 1 | 1 | 0 |
| progressive | indicativo | presente-progressivo | 1 | 1 | 1 | 1 | 1 | 1 | 0 |
| progressive | indicativo | passato-progressivo | 1 | 1 | 1 | 1 | 1 | 1 | 0 |
| progressive | indicativo | futuro-progressivo | 1 | 1 | 1 | 1 | 1 | 1 | 0 |
| simple | congiuntivo | congiuntivo-presente | 1 | 1 | 1 | 1 | 1 | 1 | 0 |
| simple | congiuntivo | congiuntivo-imperfetto | 1 | 1 | 1 | 1 | 1 | 1 | 0 |
| compound | congiuntivo | congiuntivo-passato | 1 | 1 | 1 | 1 | 1 | 1 | 0 |
| compound | congiuntivo | congiuntivo-trapassato | 1 | 1 | 1 | 1 | 1 | 1 | 0 |
| progressive | congiuntivo | congiuntivo-presente-progressivo | 1 | 1 | 1 | 1 | 1 | 1 | 0 |
| simple | condizionale | condizionale-presente | 1 | 1 | 1 | 1 | 1 | 1 | 0 |
| compound | condizionale | condizionale-passato | 1 | 1 | 1 | 1 | 1 | 1 | 0 |
| progressive | condizionale | condizionale-presente-progressivo | 1 | 1 | 1 | 1 | 1 | 1 | 0 |
| simple | imperativo | imperativo-presente | 0 | 1 | 1 | 1 | 1 | 1 | 0 |
| compound | imperativo | imperativo-passato | 0 | 1 | 1 | 1 | 1 | 1 | 0 |
| simple | infinito | infinito-presente | 0 | 0 | 0 | 0 | 0 | 0 | 1 |
| compound | infinito | infinito-passato | 0 | 0 | 0 | 0 | 0 | 0 | 1 |
| simple | participio | participio-presente | 0 | 0 | 0 | 0 | 0 | 0 | 1 |
| simple | participio | participio-passato | 0 | 0 | 0 | 0 | 0 | 0 | 1 |
| simple | gerundio | gerundio-presente | 0 | 0 | 0 | 0 | 0 | 0 | 1 |
| compound | gerundio | gerundio-passato | 0 | 0 | 0 | 0 | 0 | 0 | 1 |

**Total Normal Forms: 130**
- Finite forms: 19 tenses × 6 persons + 2 imperatives × 5 persons = 114 + 10 = 124
- Non-finite forms: 6 forms × 1 = 6
- **Total: 124 + 6 = 130**

### third-singular-only (Group 2):
All tenses follow the same pattern: only 3rd person singular for finite forms, infinitive for non-finite forms.

| Type | Mood | Tense | 1sg | 2sg | 3sg | 1pl | 2pl | 3pl | inf |
|------|------|-------|-----|-----|-----|-----|-----|-----|-----|
| simple | indicativo | presente | 0 | 0 | 1 | 0 | 0 | 0 | 0 |
| ... | ... | ... | ... | ... | ... | ... | ... | ... | ... |
| simple | infinito | infinito-presente | 0 | 0 | 0 | 0 | 0 | 0 | 1 |

**Total third-singular-only Forms: 27**
- Finite forms: 21 tenses × 1 person = 21
- Non-finite forms: 6 forms × 1 = 6
- **Total: 21 + 6 = 27**

### third-person-only (Group 3):
All tenses allow 3rd person singular and plural, plus non-finite forms.

**Total third-person-only Forms: 48**
- Finite forms: 21 tenses × 2 persons (3sg + 3pl) = 42
- Non-finite forms: 6 forms × 1 = 6
- **Total: 42 + 6 = 48**

### missing-first-second-person (Group 4):
Allows 3rd singular + all plural persons.

**Total missing-first-second-person Forms: 81**
- Count from CSV: Sum all "1" values in columns for 3sg, 1pl, 2pl, 3pl, and infinitive
- **Total: 81** (exact count from CSV rows 84-110)

### missing-imperative (Group 5):
All normal forms except imperative mood (imperativo = 0).

**Total missing-imperative Forms: 120**
- Normal forms (130) - imperative forms (10) = 120

### singular-only (Group 6):
Only singular persons (1sg, 2sg, 3sg) + non-finite forms.

**Total singular-only Forms: 69**
- Count from CSV: Sum all "1" values in columns for 1sg, 2sg, 3sg, and infinitive
- **Total: 69** (exact count from CSV rows 138-164)

### plural-only (Group 1):
Only plural persons (1pl, 2pl, 3pl) + non-finite forms.

**Total plural-only Forms: 60**
- Count from CSV: Sum all "1" values in columns for 1pl, 2pl, 3pl, and infinitive
- **Total: 60** (exact count from CSV rows 165-191)

## Calculation Methodology

To calculate the exact form count for any restriction:

1. **Count all "1" values** across all 7 columns (6 person columns + 1 infinitive column)
2. **Sum across all tense/mood/type combinations** for that restriction group
3. **Apply auxiliary multiplication** for compound forms only

### Calculation Examples

**Example 1: Normal Restriction Verb with Single Auxiliary**
- Verb: "dormire" (to sleep)
- Translation: "to sleep" (normal restriction, avere auxiliary)
- Expected forms: 130 (all normal forms)
- Form breakdown:
  - Simple forms: 51 (shared across all translations)
  - Compound forms: 62 × 1 auxiliary = 62
  - Progressive forms: 17 (shared across all translations)
- Expected form_translations: 130 × 1 translation = 130

**Example 2: Normal Restriction Verb with Dual Auxiliary**
- Verb: "finire" (to finish/end)
- Translation 1: "to finish" (normal restriction, avere auxiliary)
- Translation 2: "to end" (normal restriction, essere auxiliary)
- Expected forms calculation:
  - Simple forms: 51 (shared between both translations)
  - Compound forms: 62 × 2 auxiliaries = 124
  - Progressive forms: 17 (shared between both translations)
  - **Total: 51 + 124 + 17 = 192 forms**
- Expected form_translations:
  - Simple: 51 forms × 2 translations = 102
  - Compound: 124 forms × 1 translation each = 124 (62 for avere translation, 62 for essere translation)
  - Progressive: 17 forms × 2 translations = 34
  - **Total: 102 + 124 + 34 = 260 form_translations**

**Example 3: Restricted Verb**
- Verb: "piovere" (to rain)
- Translation: "to rain" (third-singular-only restriction, essere auxiliary)
- Expected forms: 27 (only 3rd singular + non-finite)
- Expected form_translations: 27 × 1 translation = 27

## Form Generation Logic

### 1. Translation-Level Complexity
Each verb can have multiple translations, each with:
- **Restriction type** (0-6 from table above)
- **Auxiliary type** (avere/essere from translation metadata)

### 2. Form Generation Decision
For each tense/mood/person combination:
1. Check if ANY translation's restriction allows this combination
2. If yes, generate the form
3. For compound forms: generate separate forms per auxiliary type

### 3. Auxiliary Type Multiplication
Compound forms are multiplied by auxiliary types:
- **Single auxiliary**: 1 compound form per tense
- **Dual auxiliary**: 2 compound forms per tense (avere + essere versions)

## Form-Translation Coverage

Every generated form must have form_translation records for ALL translations that allow it:
- **Simple forms**: 1 form → multiple form_translations (one per applicable translation)
- **Compound forms**: Multiple forms (per auxiliary) → each links to applicable translations

## Examples

### Example 1: Simple Verb (dormire)
- **Translation 1**: "to sleep" (normal restriction, avere auxiliary)
- **Expected forms**: 130 (all normal forms)
- **Expected form_translations**: 130 (1:1 ratio)

### Example 2: Dual-Auxiliary Verb (finire)
- **Translation 1**: "to finish" (normal restriction, avere auxiliary)
- **Translation 2**: "to end" (normal restriction, essere auxiliary)
- **Expected simple forms**: 51 (shared across both translations)
- **Expected compound forms**: 158 (79 × 2 auxiliaries)
- **Expected progressive forms**: 30 (shared across both translations)
- **Total expected forms**: 239
- **Expected form_translations**: 369 (simple: 51×2, compound: 158×1, progressive: 30×2)

### Example 3: Restricted Verb
- **Translation 1**: "to rain" (third-singular-only restriction, essere auxiliary)
- **Expected forms**: 27 (only 3rd singular + non-finite)
- **Expected form_translations**: 27 (1:1 ratio)

## Compliance Requirements

A verb is compliant when:
1. **Form count matches**: Actual forms = Expected forms (based on restriction calculation)
2. **Form_translation coverage**: Every form has form_translations for all applicable translations
3. **Auxiliary compliance**: Compound forms exist for each auxiliary type in translations
4. **No over-generation**: No forms exist that violate restriction constraints

## Implementation Notes

- Form counts are derived from the restriction validity matrix (CSV)
- Auxiliary types are stored as metadata on word_translations
- Restriction types are stored as metadata on word_translations
- Compound form auxiliary multiplication applies only to compound/progressive forms, not simple forms