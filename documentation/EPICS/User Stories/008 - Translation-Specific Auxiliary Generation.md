# User Story: Translation-Specific Auxiliary Generation

**Epic**: Advanced Grammar Support
**Priority**: High
**Component**: ConjugationModal, VariantCalculator

## User Story

**As a** language learner studying verbs with multiple translations
**I want** compound tenses to use the correct auxiliary (avere/essere) based on the selected translation meaning
**So that** I learn the proper grammatical patterns for each distinct usage

## Background

Verbs like "finire" use different auxiliaries depending on meaning:
- **"to finish"** (transitive) → uses **avere**: "ho finito il libro"
- **"to end"** (intransitive) → uses **essere**: "il film è finito"

Currently, all compound forms use the dictionary's primary auxiliary, regardless of selected translation.

## Acceptance Criteria

### Dynamic Auxiliary Selection
- [ ] Compound forms use auxiliary specified in translation's `context_metadata.auxiliary`
- [ ] Avere forms: "ho/hai/ha/abbiamo/avete/hanno + participle"
- [ ] Essere forms: "sono/sei/è/siamo/siete/sono + participle"
- [ ] Gender agreement applies only to essere forms (computed variants)

### Translation Context Integration
- [ ] `word_translations.context_metadata` includes `{"auxiliary": "avere|essere"}`
- [ ] ConjugationModal reads auxiliary from selected translation
- [ ] Form generation switches auxiliary when translation changes
- [ ] Both auxiliaries available for verbs tagged `both-auxiliary`

### Frontend Integration
- [ ] Translation switching immediately updates compound forms
- [ ] Correct auxiliary displays in conjugation modal
- [ ] Gender toggle works correctly with essere compounds
- [ ] Audio generation uses appropriate auxiliary

### Technical Implementation
- [ ] `getAuxiliaryForTranslation(translationId)` function
- [ ] `generateCompoundForm(baseForm, auxiliary, gender)` utility
- [ ] No duplicate stored forms - computed dynamically
- [ ] Performance under 100ms for auxiliary switching

## Technical Approach

```javascript
// Enhanced form generation based on translation selection
const getDisplayFormWithAuxiliary = (baseForm, selectedTranslationId, selectedGender) => {
  if (!baseForm.tags?.includes('compound')) return baseForm;
  
  const translation = getTranslationById(selectedTranslationId);
  const requiredAux = translation.context_metadata?.auxiliary;
  
  if (requiredAux && requiredAux !== getCurrentAuxiliary(baseForm)) {
    return generateCompoundForm(baseForm, requiredAux, selectedGender);
  }
  
  return baseForm;
}
```

## Examples

**"finire" with "to finish" translation:**
- "ho finito" ✓ (uses avere)

**"finire" with "to end" translation:**
- "sono finito" ✓ (uses essere, enables gender variants)

## Definition of Done

- [ ] All verbs with `both-auxiliary` tag support translation-specific auxiliaries
- [ ] Compound forms automatically switch auxiliaries when translation changes
- [ ] Gender agreement works correctly for essere forms
- [ ] Performance meets requirements
- [ ] No breaking changes to existing single-auxiliary verbs

## Out of Scope

- Automatic auxiliary detection for new words
- Bulk updates to existing dictionary entries
- Advanced auxiliary rules beyond avere/essere

## Dependencies

- Translation-first architecture (completed)
- VariantCalculator integration (existing)
- ConjugationModal enhancement (existing)

