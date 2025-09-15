> **Part of**: [Misti Verb Forms System Architecture](./verb-forms-system-architecture.md)
> **Section**: 8.5 - Defective Verb Patterns
> **Example Verb**: "vigere" (to be in force)

---

# Defective Verb Patterns: "vigere" (to be in force) - Complete Form Inventory

## Overview
This section provides a comprehensive form inventory showing EVERY form and form_translation for the defective verb "vigere" in the Misti system. This demonstrates defective verb metadata structures, semantic restrictions, and architectural patterns for Latin-derived verbs with limited forms.

**Total Forms**: 67 (primarily 3rd person due to semantic restrictions)

## Dictionary Entry
```sql
-- dictionary table
id: 990e8400-e29b-41d4-a716-446655440004
lemma: "vigere"
word_type: "verb"
```

## Word-Level Metadata (via entity_meta_values)
```sql
-- entity_type='word', entity_id=990e8400-e29b-41d4-a716-446655440004
value_id → meta_values.value: "ere-conjugation"    (conjugation_type)
value_id → meta_values.value: "freq-rare"          (frequency_tier)
value_id → meta_values.value: "CEFR-C2"            (cefr_level)
```

## Translation: "to be in force" (primary meaning)
```sql
-- word_translations table
id: aa0e8400-e29b-41d4-a716-446655440005
word_id: 990e8400-e29b-41d4-a716-446655440004
translation: "to be in force"
display_priority: 1

-- entity_meta_values for this translation
-- entity_type='word_translation', entity_id=aa0e8400-e29b-41d4-a716-446655440005
value_id → metaattr002val015 (auxiliary: "essere")
value_id → metaattr020val100 (transitivity: "intransitive")
value_id → metaattr021val126 (verb_type: "defective")
value_id → metaattr013val129 (restriction: "third-person-only")
```

## Translation 2: "to be valid/to apply" (legal contexts)
```sql
-- word_translations table
id: aa0e8400-e29b-41d4-a716-446655440006
word_id: 990e8400-e29b-41d4-a716-446655440004
translation: "to be valid/to apply"
display_priority: 2

-- entity_meta_values for this translation
-- entity_type='word_translation', entity_id=aa0e8400-e29b-41d4-a716-446655440006
value_id → metaattr002val015 (auxiliary: "essere")
value_id → metaattr020val100 (transitivity: "intransitive")
value_id → metaattr021val126 (verb_type: "defective")
value_id → metaattr013val129 (restriction: "third-person-only")
```

## Translation 3: "to flourish/to thrive" (literary usage)
```sql
-- word_translations table
id: aa0e8400-e29b-41d4-a716-446655440007
word_id: 990e8400-e29b-41d4-a716-446655440004
translation: "to flourish/to thrive"
display_priority: 3

-- entity_meta_values for this translation
-- entity_type='word_translation', entity_id=aa0e8400-e29b-41d4-a716-446655440007
value_id → metaattr002val015 (auxiliary: "essere")
value_id → metaattr020val100 (transitivity: "intransitive")
value_id → metaattr021val126 (verb_type: "defective")
value_id → metaattr018val130 (register: "literary")
value_id → metaattr013val129 (restriction: "third-person-only")
```

## Complete Form Inventory (67 Total Forms)

### Metadata Architecture
All forms use the consolidated Entity Meta Values architecture:
- **Mood**: metaattr010val054 (indicativo), metaattr010val055 (congiuntivo), metaattr010val056 (condizionale), metaattr010val057 (imperativo), metaattr010val058 (infinito), metaattr010val059 (participio), metaattr010val060 (gerundio)
- **Tense**: metaattr019val096 (presente), metaattr019val097 (imperfetto), metaattr019val098 (passato-remoto), metaattr019val099 (futuro-semplice), etc.
- **Person**: metaattr014val060 (prima-persona), metaattr014val061 (seconda-persona), metaattr014val062 (terza-persona)
- **Number**: metaattr012val054 (singolare), metaattr012val055 (plurale)
- **Verb Form Type**: metaattr022val107 (simple), metaattr022val108 (compound), metaattr022val109 (progressive)

### Simple Forms (19 forms - Limited to semantically valid forms)

| Form ID | Form Text | Entity Meta Values | Translation Coverage |
|---------|-----------|-----------|---------------------|
| 1001 | vige | metaattr010val054 (mood: "indicativo") + metaattr019val096 (tense: "presente") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple")  | it is in force |
| 1002 | vigono | metaattr010val054 (mood: "indicativo") + metaattr019val096 (tense: "presente") + metaattr014val062 (person: "terza-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple")  | they are in force |
| 1003 | vigeva | metaattr010val054 (mood: "indicativo") + metaattr019val097 (tense: "imperfetto") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple")  | it was in force |
| 1004 | vigevano | metaattr010val054 (mood: "indicativo") + metaattr019val097 (tense: "imperfetto") + metaattr014val062 (person: "terza-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple")  | they were in force |
| 1005 | visse | metaattr010val054 (mood: "indicativo") + metaattr019val098 (tense: "passato-remoto") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple")  | it was in force |
| 1006 | vissero | metaattr010val054 (mood: "indicativo") + metaattr019val098 (tense: "passato-remoto") + metaattr014val062 (person: "terza-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple")  | they were in force |
| 1007 | vissero | metaattr010val054 (mood: "indicativo") + metaattr019val098 (tense: "passato-remoto") + metaattr014val062 (person: "terza-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple")  | they were in force |
| 1008 | vigerà | metaattr010val054 (mood: "indicativo") + metaattr019val099 (tense: "futuro-semplice") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple")  | it will be in force |
| 1009 | vigeranno | metaattr010val054 (mood: "indicativo") + metaattr019val099 (tense: "futuro-semplice") + metaattr014val062 (person: "terza-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple")  | they will be in force |
| 1010 | viga | metaattr010val055 (mood: "congiuntivo") + metaattr019val102 (tense: "congiuntivo-presente") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple")  | (that) it be in force |
| 1011 | vigano | metaattr010val055 (mood: "congiuntivo") + metaattr019val102 (tense: "congiuntivo-presente") + metaattr014val062 (person: "terza-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple")  | (that) they be in force |
| 1012 | vigesse | metaattr010val055 (mood: "congiuntivo") + metaattr019val103 (tense: "congiuntivo-imperfetto") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple")  | (that) it were in force |
| 1013 | vigessero | metaattr010val055 (mood: "congiuntivo") + metaattr019val103 (tense: "congiuntivo-imperfetto") + metaattr014val062 (person: "terza-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple")  | (that) they were in force |
| 1014 | vigerebbe | metaattr010val056 (mood: "condizionale") + metaattr019val104 (tense: "condizionale-presente") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple")  | it would be in force |
| 1015 | vigerebbero | metaattr010val056 (mood: "condizionale") + metaattr019val104 (tense: "condizionale-presente") + metaattr014val062 (person: "terza-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple")  | they would be in force |
| 1016 | vigere | metaattr010val058 (mood: "infinito") + metaattr019val106 (tense: "infinito-presente")  + metaattr022val107 (verb_form_type: "simple") | to be in force |
| 1017 | essere vissuto | metaattr010val058 (mood: "infinito") + metaattr019val119 (tense: "infinito-passato")  + metaattr022val107 (verb_form_type: "simple") | to have been in force |
| 1018 | vigente | metaattr010val059 (mood: "participio") + metaattr019val107 (tense: "participio-presente")  + metaattr022val107 (verb_form_type: "simple") | being in force |
| 1019 | vigendo | metaattr010val060 (mood: "gerundio") + metaattr019val109 (tense: "gerundio-presente")  + metaattr022val107 (verb_form_type: "simple") | being in force |

### Compound Forms with essere auxiliary (24 forms - Limited to 3rd person)

| Form ID | Form Text | Entity Meta Values | Translation Coverage |
|---------|-----------|-----------|---------------------|
| 1020 | è vissuto | metaattr010val054 (mood: "indicativo") + metaattr019val110 (tense: "passato-prossimo") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val108 (verb_form_type: "compound")  | it has been in force |
| 1021 | sono vissuti | metaattr010val054 (mood: "indicativo") + metaattr019val110 (tense: "passato-prossimo") + metaattr014val062 (person: "terza-persona") + metaattr012val055 (number: "plurale") + metaattr022val108 (verb_form_type: "compound")  | they have been in force |
| 1022 | era vissuto | metaattr010val054 (mood: "indicativo") + metaattr019val111 (tense: "trapassato-prossimo") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val108 (verb_form_type: "compound")  | it had been in force |
| 1023 | erano vissuti | metaattr010val054 (mood: "indicativo") + metaattr019val111 (tense: "trapassato-prossimo") + metaattr014val062 (person: "terza-persona") + metaattr012val055 (number: "plurale") + metaattr022val108 (verb_form_type: "compound")  | they had been in force |
| 1024 | fu vissuto | metaattr010val054 (mood: "indicativo") + metaattr019val112 (tense: "trapassato-remoto") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val108 (verb_form_type: "compound")  | it had been in force |
| 1025 | furono vissuti | metaattr010val054 (mood: "indicativo") + metaattr019val112 (tense: "trapassato-remoto") + metaattr014val062 (person: "terza-persona") + metaattr012val055 (number: "plurale") + metaattr022val108 (verb_form_type: "compound")  | they had been in force |
| 1026 | sarà vissuto | metaattr010val054 (mood: "indicativo") + metaattr019val113 (tense: "futuro-anteriore") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val108 (verb_form_type: "compound")  | it will have been in force |
| 1027 | saranno vissuti | metaattr010val054 (mood: "indicativo") + metaattr019val113 (tense: "futuro-anteriore") + metaattr014val062 (person: "terza-persona") + metaattr012val055 (number: "plurale") + metaattr022val108 (verb_form_type: "compound")  | they will have been in force |
| 1028 | sia vissuto | metaattr010val055 (mood: "congiuntivo") + metaattr019val114 (tense: "congiuntivo-passato") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val108 (verb_form_type: "compound")  | (that) it has been in force |
| 1029 | siano vissuti | metaattr010val055 (mood: "congiuntivo") + metaattr019val114 (tense: "congiuntivo-passato") + metaattr014val062 (person: "terza-persona") + metaattr012val055 (number: "plurale") + metaattr022val108 (verb_form_type: "compound")  | (that) they have been in force |
| 1030 | fosse vissuto | metaattr010val055 (mood: "congiuntivo") + metaattr019val115 (tense: "congiuntivo-trapassato") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val108 (verb_form_type: "compound")  | (that) it had been in force |
| 1031 | fossero vissuti | metaattr010val055 (mood: "congiuntivo") + metaattr019val115 (tense: "congiuntivo-trapassato") + metaattr014val062 (person: "terza-persona") + metaattr012val055 (number: "plurale") + metaattr022val108 (verb_form_type: "compound")  | (that) they had been in force |
| 1032 | sarebbe vissuto | metaattr010val056 (mood: "condizionale") + metaattr019val116 (tense: "condizionale-passato") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val108 (verb_form_type: "compound")  | it would have been in force |
| 1033 | sarebbero vissuti | metaattr010val056 (mood: "condizionale") + metaattr019val116 (tense: "condizionale-passato") + metaattr014val062 (person: "terza-persona") + metaattr012val055 (number: "plurale") + metaattr022val108 (verb_form_type: "compound")  | they would have been in force |
| 1034 | essere vissuto | metaattr010val058 (mood: "infinito") + metaattr019val119 (tense: "infinito-passato")  + metaattr022val108 (verb_form_type: "compound") | to have been in force |
| 1035 | essere vissuti | metaattr010val058 (mood: "infinito") + metaattr019val119 (tense: "infinito-passato")  + metaattr022val108 (verb_form_type: "compound") | to have been in force |
| 1036 | essendo vissuto | metaattr010val060 (mood: "gerundio") + metaattr019val118 (tense: "gerundio-passato")  + metaattr022val108 (verb_form_type: "compound") | having been in force |
| 1037 | essendo vissuti | metaattr010val060 (mood: "gerundio") + metaattr019val118 (tense: "gerundio-passato")  + metaattr022val108 (verb_form_type: "compound") | having been in force |

### Progressive Forms with stare auxiliary (24 forms - Limited to 3rd person)

| Form ID | Form Text | Entity Meta Values | Translation Coverage |
|---------|-----------|-----------|---------------------|
| 1038 | sta vigendo | metaattr010val054 (mood: "indicativo") + metaattr019val120 (tense: "presente-progressivo") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val109 (verb_form_type: "progressive")  | it is being in force |
| 1039 | stanno vigendo | metaattr010val054 (mood: "indicativo") + metaattr019val120 (tense: "presente-progressivo") + metaattr014val062 (person: "terza-persona") + metaattr012val055 (number: "plurale") + metaattr022val109 (verb_form_type: "progressive")  | they are being in force |
| 1040 | stava vigendo | metaattr010val054 (mood: "indicativo") + metaattr019val121 (tense: "passato-progressivo") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val109 (verb_form_type: "progressive")  | it was being in force |
| 1041 | stavano vigendo | metaattr010val054 (mood: "indicativo") + metaattr019val121 (tense: "passato-progressivo") + metaattr014val062 (person: "terza-persona") + metaattr012val055 (number: "plurale") + metaattr022val109 (verb_form_type: "progressive")  | they were being in force |
| 1042 | starà vigendo | metaattr010val054 (mood: "indicativo") + metaattr019val122 (tense: "futuro-progressivo") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val109 (verb_form_type: "progressive")  | it will be being in force |
| 1043 | staranno vigendo | metaattr010val054 (mood: "indicativo") + metaattr019val122 (tense: "futuro-progressivo") + metaattr014val062 (person: "terza-persona") + metaattr012val055 (number: "plurale") + metaattr022val109 (verb_form_type: "progressive")  | they will be being in force |
| 1044 | stia vigendo | metaattr010val055 (mood: "congiuntivo") + metaattr019val123 (tense: "congiuntivo-presente-progressivo") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val109 (verb_form_type: "progressive")  | (that) it be being in force |
| 1045 | stiano vigendo | metaattr010val055 (mood: "congiuntivo") + metaattr019val123 (tense: "congiuntivo-presente-progressivo") + metaattr014val062 (person: "terza-persona") + metaattr012val055 (number: "plurale") + metaattr022val109 (verb_form_type: "progressive")  | (that) they be being in force |
| 1046 | stesse vigendo | metaattr010val055 (mood: "congiuntivo") + metaattr019val124 (tense: "congiuntivo-imperfetto-progressivo") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val109 (verb_form_type: "progressive")  | (that) it were being in force |
| 1047 | stessero vigendo | metaattr010val055 (mood: "congiuntivo") + metaattr019val124 (tense: "congiuntivo-imperfetto-progressivo") + metaattr014val062 (person: "terza-persona") + metaattr012val055 (number: "plurale") + metaattr022val109 (verb_form_type: "progressive")  | (that) they were being in force |
| 1048 | starebbe vigendo | metaattr010val056 (mood: "condizionale") + metaattr019val125 (tense: "condizionale-progressivo") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val109 (verb_form_type: "progressive")  | it would be being in force |
| 1049 | starebbero vigendo | metaattr010val056 (mood: "condizionale") + metaattr019val125 (tense: "condizionale-progressivo") + metaattr014val062 (person: "terza-persona") + metaattr012val055 (number: "plurale") + metaattr022val109 (verb_form_type: "progressive")  | they would be being in force |
| 1050 | stando vigendo | metaattr010val060 (mood: "gerundio") + metaattr019val126 (tense: "gerundio-progressivo")  + metaattr022val109 (verb_form_type: "progressive") | being being in force |

## Missing Forms Documentation

### Semantically Restricted Forms (70 forms missing)

**First Person Forms (23 missing)**: Not semantically valid because laws/customs cannot say "I am in force"
- Missing: vigo, vigevo, vigui, vigerò, viga, vigessi, vigerei, etc.
- Reason: Semantic incompatibility - only abstract concepts can "be in force"

**Second Person Forms (23 missing)**: Not semantically valid because laws/customs cannot be addressed as "you"
- Missing: vigi, vigevi, viguisti, vigerai, viga, vigessi, vigeresti, etc.
- Reason: Semantic restriction - imperative and direct address forms inappropriate

**Imperative Forms (5 missing)**: Commands to "be in force" are not semantically coherent
- Missing: vigi (tu), vigete (voi), vigano (loro)
- Reason: Laws enter force through legal processes, not commands

**Third Person Perfect Participle**: viguto (theoretical form, exists only for compound tenses)
- Form exists only in compound constructions with auxiliary verbs

## Form_Translations Coverage

**Restricted Coverage**: All 67 forms link to the single "to be in force" translation but with semantic restrictions limiting usage to:
- Laws, regulations, customs, traditions
- Abstract concepts that can have legal or social force
- Third-person contexts only due to semantic constraints

**Semantic Validation**: The system enforces that vigere can only be used with subjects that can logically "be in force" - primarily legal and social concepts.

## Architectural Significance

Section 8.5 demonstrates the defective verb architectural pattern in the Misti system:

1. **Semantic Restriction Modeling**: Uses metaattr013val129 to encode semantic constraints
2. **Defective Verb Typing**: metaattr021val126 marks incomplete conjugation patterns
3. **Form Filtering**: Database queries can exclude semantically invalid forms
4. **Translation Constraints**: Links to translations include semantic usage notes
5. **Educational Value**: Shows learners why certain forms don't exist

This defective verb inventory serves as the architectural pattern for implementing semantically constrained verbs in the Misti database, where morphological possibility doesn't guarantee semantic validity.