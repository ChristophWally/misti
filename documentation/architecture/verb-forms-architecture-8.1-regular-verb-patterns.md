> **Part of**: [Misti Verb Forms System Architecture](./verb-forms-system-architecture.md)
> **Section**: 8.1 - Regular Verb Patterns
> **Example Verb**: "mangiare" (to eat)

---

# Regular Verb Patterns: "mangiare" (to eat) - Complete Form Inventory

## Overview
This section provides a comprehensive form inventory showing EVERY form and form_translation for the regular verb "mangiare" in the Misti system. This demonstrates complete metadata structures, coverage matrices, and architectural patterns for regular Italian verbs.

**Total Forms**: 137 (51 simple + 49 compound + 37 progressive)

## Dictionary Entry
```sql
-- dictionary table
id: 550e8400-e29b-41d4-a716-446655440000
lemma: "mangiare"
word_type: "verb"
```

## Word-Level Metadata (via entity_meta_values)
```sql
-- entity_type='word', entity_id=550e8400-e29b-41d4-a716-446655440000
value_id → meta_values.value: "are-conjugation"    (conjugation_type)
value_id → meta_values.value: "freq-top100"        (frequency_tier)
value_id → meta_values.value: "CEFR-A1"            (cefr_level)
value_id → meta_values.value: "transitive"         (transitivity)
```

## Translation: "to eat" (primary meaning)
```sql
-- word_translations table
id: 660e8400-e29b-41d4-a716-446655440001
word_id: 550e8400-e29b-41d4-a716-446655440000
translation: "to eat"
display_priority: 1

-- entity_meta_values for this translation
-- entity_type='word_translation', entity_id=660e8400-e29b-41d4-a716-446655440001
value_id → metaattr002val014 (auxiliary: "avere")
value_id → metaattr020val099 (transitivity: "transitive")
```

## Complete Form Inventory (137 Total Forms)

### Metadata Architecture
All forms use the consolidated Entity Meta Values architecture:
- **Mood**: metaattr010val054 (indicativo), metaattr010val055 (congiuntivo), metaattr010val056 (condizionale), metaattr010val057 (imperativo), metaattr010val058 (infinito), metaattr010val059 (participio), metaattr010val060 (gerundio)
- **Tense**: metaattr019val096 (presente), metaattr019val097 (imperfetto), metaattr019val098 (passato-remoto), metaattr019val099 (futuro-semplice), etc.
- **Person**: metaattr014val060 (prima-persona), metaattr014val061 (seconda-persona), metaattr014val062 (terza-persona)
- **Number**: metaattr012val054 (singolare), metaattr012val055 (plurale)
- **Verb Form Type**: metaattr022val107 (simple), metaattr022val108 (compound), metaattr022val109 (progressive)

### Simple Forms (51 forms)

| Form ID | Form Text | Entity Meta Values | Translation Coverage |
|---------|-----------|-----------|---------------------|
| 001 | mangio | metaattr010val054 (mood: "indicativo") + metaattr019val096 (tense: "presente") + metaattr014val060 (person: "prima-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple") | I eat |
| 002 | mangi | metaattr010val054 (mood: "indicativo") + metaattr019val096 (tense: "presente") + metaattr014val061 (person: "seconda-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple") | you eat |
| 003 | mangia | metaattr010val054 (mood: "indicativo") + metaattr019val096 (tense: "presente") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple") | he/she eats |
| 004 | mangiamo | metaattr010val054 (mood: "indicativo") + metaattr019val096 (tense: "presente") + metaattr014val060 (person: "prima-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple") | we eat |
| 005 | mangiate | metaattr010val054 (mood: "indicativo") + metaattr019val096 (tense: "presente") + metaattr014val061 (person: "seconda-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple") | you eat |
| 006 | mangiano | metaattr010val054 (mood: "indicativo") + metaattr019val096 (tense: "presente") + metaattr014val062 (person: "terza-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple") | they eat |
| 007 | mangiavo | metaattr010val054 (mood: "indicativo") + metaattr019val097 (tense: "imperfetto") + metaattr014val060 (person: "prima-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple") | I was eating |
| 008 | mangiavi | metaattr010val054 (mood: "indicativo") + metaattr019val097 (tense: "imperfetto") + metaattr014val061 (person: "seconda-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple") | you were eating |
| 009 | mangiava | metaattr010val054 (mood: "indicativo") + metaattr019val097 (tense: "imperfetto") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple") | he/she was eating |
| 010 | mangiavamo | metaattr010val054 (mood: "indicativo") + metaattr019val097 (tense: "imperfetto") + metaattr014val060 (person: "prima-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple") | we were eating |
| 011 | mangiavate | metaattr010val054 (mood: "indicativo") + metaattr019val097 (tense: "imperfetto") + metaattr014val061 (person: "seconda-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple") | you were eating |
| 012 | mangiavano | metaattr010val054 (mood: "indicativo") + metaattr019val097 (tense: "imperfetto") + metaattr014val062 (person: "terza-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple") | they were eating |
| 013 | mangiai | metaattr010val054 (mood: "indicativo") + metaattr019val098 (tense: "passato-remoto") + metaattr014val060 (person: "prima-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple") | I ate |
| 014 | mangiasti | metaattr010val054 (mood: "indicativo") + metaattr019val098 (tense: "passato-remoto") + metaattr014val061 (person: "seconda-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple") | you ate |
| 015 | mangiò | metaattr010val054 (mood: "indicativo") + metaattr019val098 (tense: "passato-remoto") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple") | he/she ate |
| 016 | mangiammo | metaattr010val054 (mood: "indicativo") + metaattr019val098 (tense: "passato-remoto") + metaattr014val060 (person: "prima-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple") | we ate |
| 017 | mangiaste | metaattr010val054 (mood: "indicativo") + metaattr019val098 (tense: "passato-remoto") + metaattr014val061 (person: "seconda-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple") | you ate |
| 018 | mangiarono | metaattr010val054 (mood: "indicativo") + metaattr019val098 (tense: "passato-remoto") + metaattr014val062 (person: "terza-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple") | they ate |
| 019 | mangerò | metaattr010val054 (mood: "indicativo") + metaattr019val099 (tense: "futuro-semplice") + metaattr014val060 (person: "prima-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple") | I will eat |
| 020 | mangerai | metaattr010val054 (mood: "indicativo") + metaattr019val099 (tense: "futuro-semplice") + metaattr014val061 (person: "seconda-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple") | you will eat |
| 021 | mangerà | metaattr010val054 (mood: "indicativo") + metaattr019val099 (tense: "futuro-semplice") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple") | he/she will eat |
| 022 | mangeremo | metaattr010val054 (mood: "indicativo") + metaattr019val099 (tense: "futuro-semplice") + metaattr014val060 (person: "prima-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple") | we will eat |
| 023 | mangerete | metaattr010val054 (mood: "indicativo") + metaattr019val099 (tense: "futuro-semplice") + metaattr014val061 (person: "seconda-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple") | you will eat |
| 024 | mangeranno | metaattr010val054 (mood: "indicativo") + metaattr019val099 (tense: "futuro-semplice") + metaattr014val062 (person: "terza-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple") | they will eat |
| 025 | mangi | metaattr010val055 (mood: "congiuntivo") + metaattr019val102 (tense: "congiuntivo-presente") + metaattr014val060 (person: "prima-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple") | (that) I eat |
| 026 | mangi | metaattr010val055 (mood: "congiuntivo") + metaattr019val102 (tense: "congiuntivo-presente") + metaattr014val061 (person: "seconda-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple") | (that) you eat |
| 027 | mangi | metaattr010val055 (mood: "congiuntivo") + metaattr019val102 (tense: "congiuntivo-presente") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple") | (that) he/she eats |
| 028 | mangiamo | metaattr010val055 (mood: "congiuntivo") + metaattr019val102 (tense: "congiuntivo-presente") + metaattr014val060 (person: "prima-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple") | (that) we eat |
| 029 | mangiate | metaattr010val055 (mood: "congiuntivo") + metaattr019val102 (tense: "congiuntivo-presente") + metaattr014val061 (person: "seconda-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple") | (that) you eat |
| 030 | mangino | metaattr010val055 (mood: "congiuntivo") + metaattr019val102 (tense: "congiuntivo-presente") + metaattr014val062 (person: "terza-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple") | (that) they eat |
| 031 | mangiassi | metaattr010val055 (mood: "congiuntivo") + metaattr019val103 (tense: "congiuntivo-imperfetto") + metaattr014val060 (person: "prima-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple") | (that) I ate |
| 032 | mangiassi | metaattr010val055 (mood: "congiuntivo") + metaattr019val103 (tense: "congiuntivo-imperfetto") + metaattr014val061 (person: "seconda-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple") | (that) you ate |
| 033 | mangiasse | metaattr010val055 (mood: "congiuntivo") + metaattr019val103 (tense: "congiuntivo-imperfetto") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple") | (that) he/she ate |
| 034 | mangiassimo | metaattr010val055 (mood: "congiuntivo") + metaattr019val103 (tense: "congiuntivo-imperfetto") + metaattr014val060 (person: "prima-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple") | (that) we ate |
| 035 | mangiaste | metaattr010val055 (mood: "congiuntivo") + metaattr019val103 (tense: "congiuntivo-imperfetto") + metaattr014val061 (person: "seconda-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple") | (that) you ate |
| 036 | mangiassero | metaattr010val055 (mood: "congiuntivo") + metaattr019val103 (tense: "congiuntivo-imperfetto") + metaattr014val062 (person: "terza-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple") | (that) they ate |
| 037 | mangerei | metaattr010val056 (mood: "condizionale") + metaattr019val104 (tense: "condizionale-presente") + metaattr014val060 (person: "prima-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple") | I would eat |
| 038 | mangeresti | metaattr010val056 (mood: "condizionale") + metaattr019val104 (tense: "condizionale-presente") + metaattr014val061 (person: "seconda-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple") | you would eat |
| 039 | mangerebbe | metaattr010val056 (mood: "condizionale") + metaattr019val104 (tense: "condizionale-presente") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple") | he/she would eat |
| 040 | mangeremmo | metaattr010val056 (mood: "condizionale") + metaattr019val104 (tense: "condizionale-presente") + metaattr014val060 (person: "prima-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple") | we would eat |
| 041 | mangereste | metaattr010val056 (mood: "condizionale") + metaattr019val104 (tense: "condizionale-presente") + metaattr014val061 (person: "seconda-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple") | you would eat |
| 042 | mangerebbero | metaattr010val056 (mood: "condizionale") + metaattr019val104 (tense: "condizionale-presente") + metaattr014val062 (person: "terza-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple") | they would eat |
| 043 | mangia | metaattr010val057 (mood: "imperativo") + metaattr019val105 (tense: "imperativo-presente") + metaattr014val061 (person: "seconda-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple") | eat! |
| 044 | mangi | metaattr010val057 (mood: "imperativo") + metaattr019val105 (tense: "imperativo-presente") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple") | let him/her eat! |
| 045 | mangiamo | metaattr010val057 (mood: "imperativo") + metaattr019val105 (tense: "imperativo-presente") + metaattr014val060 (person: "prima-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple") | let's eat! |
| 046 | mangiate | metaattr010val057 (mood: "imperativo") + metaattr019val105 (tense: "imperativo-presente") + metaattr014val061 (person: "seconda-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple") | eat! |
| 047 | mangino | metaattr010val057 (mood: "imperativo") + metaattr019val105 (tense: "imperativo-presente") + metaattr014val062 (person: "terza-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple") | let them eat! |
| 048 | mangiare | metaattr010val058 (mood: "infinito") + metaattr019val106 (tense: "infinito-presente") + metaattr014val063 (person: "none") + metaattr012val056 (number: "none") + metaattr022val107 (verb_form_type: "simple") | to eat |
| 049 | mangiante | metaattr010val059 (mood: "participio") + metaattr019val107 (tense: "participio-presente") + metaattr014val063 (person: "none") + metaattr012val056 (number: "none") + metaattr022val107 (verb_form_type: "simple") | eating |
| 050 | mangiato | metaattr010val059 (mood: "participio") + metaattr019val108 (tense: "participio-passato") + metaattr014val063 (person: "none") + metaattr012val056 (number: "none") + metaattr022val107 (verb_form_type: "simple") | eaten |
| 051 | mangiando | metaattr010val060 (mood: "gerundio") + metaattr019val109 (tense: "gerundio-presente") + metaattr014val063 (person: "none") + metaattr012val056 (number: "none") + metaattr022val107 (verb_form_type: "simple") | eating |

### Compound Forms with avere auxiliary (49 forms)

| Form ID | Form Text | Entity Meta Values | Translation Coverage |
|---------|-----------|-----------|---------------------|
| 052 | ho mangiato | metaattr010val054 (mood: "indicativo") + metaattr019val110 (tense: "passato-prossimo") + metaattr014val060 (person: "prima-persona") + metaattr012val054 (number: "singolare") + metaattr022val108 (verb_form_type: "compound") | I have eaten |
| 053 | hai mangiato | metaattr010val054 (mood: "indicativo") + metaattr019val110 (tense: "passato-prossimo") + metaattr014val061 (person: "seconda-persona") + metaattr012val054 (number: "singolare") + metaattr022val108 (verb_form_type: "compound") | you have eaten |
| 054 | ha mangiato | metaattr010val054 (mood: "indicativo") + metaattr019val110 (tense: "passato-prossimo") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val108 (verb_form_type: "compound") | he/she has eaten |
| 055 | abbiamo mangiato | metaattr010val054 (mood: "indicativo") + metaattr019val110 (tense: "passato-prossimo") + metaattr014val060 (person: "prima-persona") + metaattr012val055 (number: "plurale") + metaattr022val108 (verb_form_type: "compound") | we have eaten |
| 056 | avete mangiato | metaattr010val054 (mood: "indicativo") + metaattr019val110 (tense: "passato-prossimo") + metaattr014val061 (person: "seconda-persona") + metaattr012val055 (number: "plurale") + metaattr022val108 (verb_form_type: "compound") | you have eaten |
| 057 | hanno mangiato | metaattr010val054 (mood: "indicativo") + metaattr019val110 (tense: "passato-prossimo") + metaattr014val062 (person: "terza-persona") + metaattr012val055 (number: "plurale") + metaattr022val108 (verb_form_type: "compound") | they have eaten |
| 058 | avevo mangiato | metaattr010val054 (mood: "indicativo") + metaattr019val111 (tense: "trapassato-prossimo") + metaattr014val060 (person: "prima-persona") + metaattr012val054 (number: "singolare") + metaattr022val108 (verb_form_type: "compound") | I had eaten |
| 059 | avevi mangiato | metaattr010val054 (mood: "indicativo") + metaattr019val111 (tense: "trapassato-prossimo") + metaattr014val061 (person: "seconda-persona") + metaattr012val054 (number: "singolare") + metaattr022val108 (verb_form_type: "compound") | you had eaten |
| 060 | aveva mangiato | metaattr010val054 (mood: "indicativo") + metaattr019val111 (tense: "trapassato-prossimo") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val108 (verb_form_type: "compound") | he/she had eaten |
| 061 | avevamo mangiato | metaattr010val054 (mood: "indicativo") + metaattr019val111 (tense: "trapassato-prossimo") + metaattr014val060 (person: "prima-persona") + metaattr012val055 (number: "plurale") + metaattr022val108 (verb_form_type: "compound") | we had eaten |
| 062 | avevate mangiato | metaattr010val054 (mood: "indicativo") + metaattr019val111 (tense: "trapassato-prossimo") + metaattr014val061 (person: "seconda-persona") + metaattr012val055 (number: "plurale") + metaattr022val108 (verb_form_type: "compound") | you had eaten |
| 063 | avevano mangiato | metaattr010val054 (mood: "indicativo") + metaattr019val111 (tense: "trapassato-prossimo") + metaattr014val062 (person: "terza-persona") + metaattr012val055 (number: "plurale") + metaattr022val108 (verb_form_type: "compound") | they had eaten |
| 064 | ebbi mangiato | metaattr010val054 (mood: "indicativo") + metaattr019val112 (tense: "trapassato-remoto") + metaattr014val060 (person: "prima-persona") + metaattr012val054 (number: "singolare") + metaattr022val108 (verb_form_type: "compound") | I had eaten |
| 065 | avesti mangiato | metaattr010val054 (mood: "indicativo") + metaattr019val112 (tense: "trapassato-remoto") + metaattr014val061 (person: "seconda-persona") + metaattr012val054 (number: "singolare") + metaattr022val108 (verb_form_type: "compound") | you had eaten |
| 066 | ebbe mangiato | metaattr010val054 (mood: "indicativo") + metaattr019val112 (tense: "trapassato-remoto") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val108 (verb_form_type: "compound") | he/she had eaten |
| 067 | avemmo mangiato | metaattr010val054 (mood: "indicativo") + metaattr019val112 (tense: "trapassato-remoto") + metaattr014val060 (person: "prima-persona") + metaattr012val055 (number: "plurale") + metaattr022val108 (verb_form_type: "compound") | we had eaten |
| 068 | aveste mangiato | metaattr010val054 (mood: "indicativo") + metaattr019val112 (tense: "trapassato-remoto") + metaattr014val061 (person: "seconda-persona") + metaattr012val055 (number: "plurale") + metaattr022val108 (verb_form_type: "compound") | you had eaten |
| 069 | ebbero mangiato | metaattr010val054 (mood: "indicativo") + metaattr019val112 (tense: "trapassato-remoto") + metaattr014val062 (person: "terza-persona") + metaattr012val055 (number: "plurale") + metaattr022val108 (verb_form_type: "compound") | they had eaten |
| 070 | avrò mangiato | metaattr010val054 (mood: "indicativo") + metaattr019val113 (tense: "futuro-anteriore") + metaattr014val060 (person: "prima-persona") + metaattr012val054 (number: "singolare") + metaattr022val108 (verb_form_type: "compound") | I will have eaten |
| 071 | avrai mangiato | metaattr010val054 (mood: "indicativo") + metaattr019val113 (tense: "futuro-anteriore") + metaattr014val061 (person: "seconda-persona") + metaattr012val054 (number: "singolare") + metaattr022val108 (verb_form_type: "compound") | you will have eaten |
| 072 | avrà mangiato | metaattr010val054 (mood: "indicativo") + metaattr019val113 (tense: "futuro-anteriore") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val108 (verb_form_type: "compound") | he/she will have eaten |
| 073 | avremo mangiato | metaattr010val054 (mood: "indicativo") + metaattr019val113 (tense: "futuro-anteriore") + metaattr014val060 (person: "prima-persona") + metaattr012val055 (number: "plurale") + metaattr022val108 (verb_form_type: "compound") | we will have eaten |
| 074 | avrete mangiato | metaattr010val054 (mood: "indicativo") + metaattr019val113 (tense: "futuro-anteriore") + metaattr014val061 (person: "seconda-persona") + metaattr012val055 (number: "plurale") + metaattr022val108 (verb_form_type: "compound") | you will have eaten |
| 075 | avranno mangiato | metaattr010val054 (mood: "indicativo") + metaattr019val113 (tense: "futuro-anteriore") + metaattr014val062 (person: "terza-persona") + metaattr012val055 (number: "plurale") + metaattr022val108 (verb_form_type: "compound") | they will have eaten |
| 076 | abbia mangiato | metaattr010val055 (mood: "congiuntivo") + metaattr019val114 (tense: "congiuntivo-passato") + metaattr014val060 (person: "prima-persona") + metaattr012val054 (number: "singolare") + metaattr022val108 (verb_form_type: "compound") | (that) I have eaten |
| 077 | abbia mangiato | metaattr010val055 (mood: "congiuntivo") + metaattr019val114 (tense: "congiuntivo-passato") + metaattr014val061 (person: "seconda-persona") + metaattr012val054 (number: "singolare") + metaattr022val108 (verb_form_type: "compound") | (that) you have eaten |
| 078 | abbia mangiato | metaattr010val055 (mood: "congiuntivo") + metaattr019val114 (tense: "congiuntivo-passato") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val108 (verb_form_type: "compound") | (that) he/she has eaten |
| 079 | abbiamo mangiato | metaattr010val055 (mood: "congiuntivo") + metaattr019val114 (tense: "congiuntivo-passato") + metaattr014val060 (person: "prima-persona") + metaattr012val055 (number: "plurale") + metaattr022val108 (verb_form_type: "compound") | (that) we have eaten |
| 080 | abbiate mangiato | metaattr010val055 (mood: "congiuntivo") + metaattr019val114 (tense: "congiuntivo-passato") + metaattr014val061 (person: "seconda-persona") + metaattr012val055 (number: "plurale") + metaattr022val108 (verb_form_type: "compound") | (that) you have eaten |
| 081 | abbiano mangiato | metaattr010val055 (mood: "congiuntivo") + metaattr019val114 (tense: "congiuntivo-passato") + metaattr014val062 (person: "terza-persona") + metaattr012val055 (number: "plurale") + metaattr022val108 (verb_form_type: "compound") | (that) they have eaten |
| 082 | avessi mangiato | metaattr010val055 (mood: "congiuntivo") + metaattr019val115 (tense: "congiuntivo-trapassato") + metaattr014val060 (person: "prima-persona") + metaattr012val054 (number: "singolare") + metaattr022val108 (verb_form_type: "compound") | (that) I had eaten |
| 083 | avessi mangiato | metaattr010val055 (mood: "congiuntivo") + metaattr019val115 (tense: "congiuntivo-trapassato") + metaattr014val061 (person: "seconda-persona") + metaattr012val054 (number: "singolare") + metaattr022val108 (verb_form_type: "compound") | (that) you had eaten |
| 084 | avesse mangiato | metaattr010val055 (mood: "congiuntivo") + metaattr019val115 (tense: "congiuntivo-trapassato") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val108 (verb_form_type: "compound") | (that) he/she had eaten |
| 085 | avessimo mangiato | metaattr010val055 (mood: "congiuntivo") + metaattr019val115 (tense: "congiuntivo-trapassato") + metaattr014val060 (person: "prima-persona") + metaattr012val055 (number: "plurale") + metaattr022val108 (verb_form_type: "compound") | (that) we had eaten |
| 086 | aveste mangiato | metaattr010val055 (mood: "congiuntivo") + metaattr019val115 (tense: "congiuntivo-trapassato") + metaattr014val061 (person: "seconda-persona") + metaattr012val055 (number: "plurale") + metaattr022val108 (verb_form_type: "compound") | (that) you had eaten |
| 087 | avessero mangiato | metaattr010val055 (mood: "congiuntivo") + metaattr019val115 (tense: "congiuntivo-trapassato") + metaattr014val062 (person: "terza-persona") + metaattr012val055 (number: "plurale") + metaattr022val108 (verb_form_type: "compound") | (that) they had eaten |
| 088 | avrei mangiato | metaattr010val056 (mood: "condizionale") + metaattr019val116 (tense: "condizionale-passato") + metaattr014val060 (person: "prima-persona") + metaattr012val054 (number: "singolare") + metaattr022val108 (verb_form_type: "compound") | I would have eaten |
| 089 | avresti mangiato | metaattr010val056 (mood: "condizionale") + metaattr019val116 (tense: "condizionale-passato") + metaattr014val061 (person: "seconda-persona") + metaattr012val054 (number: "singolare") + metaattr022val108 (verb_form_type: "compound") | you would have eaten |
| 090 | avrebbe mangiato | metaattr010val056 (mood: "condizionale") + metaattr019val116 (tense: "condizionale-passato") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val108 (verb_form_type: "compound") | he/she would have eaten |
| 091 | avremmo mangiato | metaattr010val056 (mood: "condizionale") + metaattr019val116 (tense: "condizionale-passato") + metaattr014val060 (person: "prima-persona") + metaattr012val055 (number: "plurale") + metaattr022val108 (verb_form_type: "compound") | we would have eaten |
| 092 | avreste mangiato | metaattr010val056 (mood: "condizionale") + metaattr019val116 (tense: "condizionale-passato") + metaattr014val061 (person: "seconda-persona") + metaattr012val055 (number: "plurale") + metaattr022val108 (verb_form_type: "compound") | you would have eaten |
| 093 | avrebbero mangiato | metaattr010val056 (mood: "condizionale") + metaattr019val116 (tense: "condizionale-passato") + metaattr014val062 (person: "terza-persona") + metaattr012val055 (number: "plurale") + metaattr022val108 (verb_form_type: "compound") | they would have eaten |
| 094 | abbi mangiato | metaattr010val057 (mood: "imperativo") + metaattr019val117 (tense: "imperativo-passato") + metaattr014val061 (person: "seconda-persona") + metaattr012val054 (number: "singolare") + metaattr022val108 (verb_form_type: "compound") | have eaten! |
| 095 | abbia mangiato | metaattr010val057 (mood: "imperativo") + metaattr019val117 (tense: "imperativo-passato") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val108 (verb_form_type: "compound") | let him/her have eaten! |
| 096 | abbiamo mangiato | metaattr010val057 (mood: "imperativo") + metaattr019val117 (tense: "imperativo-passato") + metaattr014val060 (person: "prima-persona") + metaattr012val055 (number: "plurale") + metaattr022val108 (verb_form_type: "compound") | let's have eaten! |
| 097 | abbiate mangiato | metaattr010val057 (mood: "imperativo") + metaattr019val117 (tense: "imperativo-passato") + metaattr014val061 (person: "seconda-persona") + metaattr012val055 (number: "plurale") + metaattr022val108 (verb_form_type: "compound") | have eaten! |
| 098 | abbiano mangiato | metaattr010val057 (mood: "imperativo") + metaattr019val117 (tense: "imperativo-passato") + metaattr014val062 (person: "terza-persona") + metaattr012val055 (number: "plurale") + metaattr022val108 (verb_form_type: "compound") | let them have eaten! |
| 099 | avendo mangiato | metaattr010val060 (mood: "gerundio") + metaattr019val118 (tense: "gerundio-passato") + metaattr014val063 (person: "none") + metaattr012val056 (number: "none") + metaattr022val108 (verb_form_type: "compound") | having eaten |
| 100 | aver mangiato | metaattr010val058 (mood: "infinito") + metaattr019val119 (tense: "infinito-passato") + metaattr014val063 (person: "none") + metaattr012val056 (number: "none") + metaattr022val108 (verb_form_type: "compound") | to have eaten |

### Progressive Forms with stare auxiliary (37 forms)

| Form ID | Form Text | Entity Meta Values | Translation Coverage |
|---------|-----------|-----------|---------------------|
| 101 | sto mangiando | metaattr010val054 (mood: "indicativo") + metaattr019val120 (tense: "presente-progressivo") + metaattr014val060 (person: "prima-persona") + metaattr012val054 (number: "singolare") + metaattr022val109 (verb_form_type: "progressive") | I am eating |
| 102 | stai mangiando | metaattr010val054 (mood: "indicativo") + metaattr019val120 (tense: "presente-progressivo") + metaattr014val061 (person: "seconda-persona") + metaattr012val054 (number: "singolare") + metaattr022val109 (verb_form_type: "progressive") | you are eating |
| 103 | sta mangiando | metaattr010val054 (mood: "indicativo") + metaattr019val120 (tense: "presente-progressivo") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val109 (verb_form_type: "progressive") | he/she is eating |
| 104 | stiamo mangiando | metaattr010val054 (mood: "indicativo") + metaattr019val120 (tense: "presente-progressivo") + metaattr014val060 (person: "prima-persona") + metaattr012val055 (number: "plurale") + metaattr022val109 (verb_form_type: "progressive") | we are eating |
| 105 | state mangiando | metaattr010val054 (mood: "indicativo") + metaattr019val120 (tense: "presente-progressivo") + metaattr014val061 (person: "seconda-persona") + metaattr012val055 (number: "plurale") + metaattr022val109 (verb_form_type: "progressive") | you are eating |
| 106 | stanno mangiando | metaattr010val054 (mood: "indicativo") + metaattr019val120 (tense: "presente-progressivo") + metaattr014val062 (person: "terza-persona") + metaattr012val055 (number: "plurale") + metaattr022val109 (verb_form_type: "progressive") | they are eating |
| 107 | stavo mangiando | metaattr010val054 (mood: "indicativo") + metaattr019val121 (tense: "passato-progressivo") + metaattr014val060 (person: "prima-persona") + metaattr012val054 (number: "singolare") + metaattr022val109 (verb_form_type: "progressive") | I was eating |
| 108 | stavi mangiando | metaattr010val054 (mood: "indicativo") + metaattr019val121 (tense: "passato-progressivo") + metaattr014val061 (person: "seconda-persona") + metaattr012val054 (number: "singolare") + metaattr022val109 (verb_form_type: "progressive") | you were eating |
| 109 | stava mangiando | metaattr010val054 (mood: "indicativo") + metaattr019val121 (tense: "passato-progressivo") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val109 (verb_form_type: "progressive") | he/she was eating |
| 110 | stavamo mangiando | metaattr010val054 (mood: "indicativo") + metaattr019val121 (tense: "passato-progressivo") + metaattr014val060 (person: "prima-persona") + metaattr012val055 (number: "plurale") + metaattr022val109 (verb_form_type: "progressive") | we were eating |
| 111 | stavate mangiando | metaattr010val054 (mood: "indicativo") + metaattr019val121 (tense: "passato-progressivo") + metaattr014val061 (person: "seconda-persona") + metaattr012val055 (number: "plurale") + metaattr022val109 (verb_form_type: "progressive") | you were eating |
| 112 | stavano mangiando | metaattr010val054 (mood: "indicativo") + metaattr019val121 (tense: "passato-progressivo") + metaattr014val062 (person: "terza-persona") + metaattr012val055 (number: "plurale") + metaattr022val109 (verb_form_type: "progressive") | they were eating |
| 113 | starò mangiando | metaattr010val054 (mood: "indicativo") + metaattr019val122 (tense: "futuro-progressivo") + metaattr014val060 (person: "prima-persona") + metaattr012val054 (number: "singolare") + metaattr022val109 (verb_form_type: "progressive") | I will be eating |
| 114 | starai mangiando | metaattr010val054 (mood: "indicativo") + metaattr019val122 (tense: "futuro-progressivo") + metaattr014val061 (person: "seconda-persona") + metaattr012val054 (number: "singolare") + metaattr022val109 (verb_form_type: "progressive") | you will be eating |
| 115 | starà mangiando | metaattr010val054 (mood: "indicativo") + metaattr019val122 (tense: "futuro-progressivo") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val109 (verb_form_type: "progressive") | he/she will be eating |
| 116 | staremo mangiando | metaattr010val054 (mood: "indicativo") + metaattr019val122 (tense: "futuro-progressivo") + metaattr014val060 (person: "prima-persona") + metaattr012val055 (number: "plurale") + metaattr022val109 (verb_form_type: "progressive") | we will be eating |
| 117 | starete mangiando | metaattr010val054 (mood: "indicativo") + metaattr019val122 (tense: "futuro-progressivo") + metaattr014val061 (person: "seconda-persona") + metaattr012val055 (number: "plurale") + metaattr022val109 (verb_form_type: "progressive") | you will be eating |
| 118 | staranno mangiando | metaattr010val054 (mood: "indicativo") + metaattr019val122 (tense: "futuro-progressivo") + metaattr014val062 (person: "terza-persona") + metaattr012val055 (number: "plurale") + metaattr022val109 (verb_form_type: "progressive") | they will be eating |
| 119 | stia mangiando | metaattr010val055 (mood: "congiuntivo") + metaattr019val123 (tense: "congiuntivo-presente-progressivo") + metaattr014val060 (person: "prima-persona") + metaattr012val054 (number: "singolare") + metaattr022val109 (verb_form_type: "progressive") | (that) I be eating |
| 120 | stia mangiando | metaattr010val055 (mood: "congiuntivo") + metaattr019val123 (tense: "congiuntivo-presente-progressivo") + metaattr014val061 (person: "seconda-persona") + metaattr012val054 (number: "singolare") + metaattr022val109 (verb_form_type: "progressive") | (that) you be eating |
| 121 | stia mangiando | metaattr010val055 (mood: "congiuntivo") + metaattr019val123 (tense: "congiuntivo-presente-progressivo") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val109 (verb_form_type: "progressive") | (that) he/she be eating |
| 122 | stiamo mangiando | metaattr010val055 (mood: "congiuntivo") + metaattr019val123 (tense: "congiuntivo-presente-progressivo") + metaattr014val060 (person: "prima-persona") + metaattr012val055 (number: "plurale") + metaattr022val109 (verb_form_type: "progressive") | (that) we be eating |
| 123 | stiate mangiando | metaattr010val055 (mood: "congiuntivo") + metaattr019val123 (tense: "congiuntivo-presente-progressivo") + metaattr014val061 (person: "seconda-persona") + metaattr012val055 (number: "plurale") + metaattr022val109 (verb_form_type: "progressive") | (that) you be eating |
| 124 | stiano mangiando | metaattr010val055 (mood: "congiuntivo") + metaattr019val123 (tense: "congiuntivo-presente-progressivo") + metaattr014val062 (person: "terza-persona") + metaattr012val055 (number: "plurale") + metaattr022val109 (verb_form_type: "progressive") | (that) they be eating |
| 125 | stessi mangiando | metaattr010val055 (mood: "congiuntivo") + metaattr019val124 (tense: "congiuntivo-imperfetto-progressivo") + metaattr014val060 (person: "prima-persona") + metaattr012val054 (number: "singolare") + metaattr022val109 (verb_form_type: "progressive") | (that) I were eating |
| 126 | stessi mangiando | metaattr010val055 (mood: "congiuntivo") + metaattr019val124 (tense: "congiuntivo-imperfetto-progressivo") + metaattr014val061 (person: "seconda-persona") + metaattr012val054 (number: "singolare") + metaattr022val109 (verb_form_type: "progressive") | (that) you were eating |
| 127 | stesse mangiando | metaattr010val055 (mood: "congiuntivo") + metaattr019val124 (tense: "congiuntivo-imperfetto-progressivo") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val109 (verb_form_type: "progressive") | (that) he/she were eating |
| 128 | stessimo mangiando | metaattr010val055 (mood: "congiuntivo") + metaattr019val124 (tense: "congiuntivo-imperfetto-progressivo") + metaattr014val060 (person: "prima-persona") + metaattr012val055 (number: "plurale") + metaattr022val109 (verb_form_type: "progressive") | (that) we were eating |
| 129 | steste mangiando | metaattr010val055 (mood: "congiuntivo") + metaattr019val124 (tense: "congiuntivo-imperfetto-progressivo") + metaattr014val061 (person: "seconda-persona") + metaattr012val055 (number: "plurale") + metaattr022val109 (verb_form_type: "progressive") | (that) you were eating |
| 130 | stessero mangiando | metaattr010val055 (mood: "congiuntivo") + metaattr019val124 (tense: "congiuntivo-imperfetto-progressivo") + metaattr014val062 (person: "terza-persona") + metaattr012val055 (number: "plurale") + metaattr022val109 (verb_form_type: "progressive") | (that) they were eating |
| 131 | starei mangiando | metaattr010val056 (mood: "condizionale") + metaattr019val125 (tense: "condizionale-progressivo") + metaattr014val060 (person: "prima-persona") + metaattr012val054 (number: "singolare") + metaattr022val109 (verb_form_type: "progressive") | I would be eating |
| 132 | staresti mangiando | metaattr010val056 (mood: "condizionale") + metaattr019val125 (tense: "condizionale-progressivo") + metaattr014val061 (person: "seconda-persona") + metaattr012val054 (number: "singolare") + metaattr022val109 (verb_form_type: "progressive") | you would be eating |
| 133 | starebbe mangiando | metaattr010val056 (mood: "condizionale") + metaattr019val125 (tense: "condizionale-progressivo") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val109 (verb_form_type: "progressive") | he/she would be eating |
| 134 | staremmo mangiando | metaattr010val056 (mood: "condizionale") + metaattr019val125 (tense: "condizionale-progressivo") + metaattr014val060 (person: "prima-persona") + metaattr012val055 (number: "plurale") + metaattr022val109 (verb_form_type: "progressive") | we would be eating |
| 135 | stareste mangiando | metaattr010val056 (mood: "condizionale") + metaattr019val125 (tense: "condizionale-progressivo") + metaattr014val061 (person: "seconda-persona") + metaattr012val055 (number: "plurale") + metaattr022val109 (verb_form_type: "progressive") | you would be eating |
| 136 | starebbero mangiando | metaattr010val056 (mood: "condizionale") + metaattr019val125 (tense: "condizionale-progressivo") + metaattr014val062 (person: "terza-persona") + metaattr012val055 (number: "plurale") + metaattr022val109 (verb_form_type: "progressive") | they would be eating |
| 137 | stando mangiando | metaattr010val060 (mood: "gerundio") + metaattr019val126 (tense: "gerundio-progressivo") + metaattr014val063 (person: "none") + metaattr012val056 (number: "none") + metaattr022val109 (verb_form_type: "progressive") | being eating |

## Form_Translations Coverage

**Complete Coverage**: All 137 forms link to the single "to eat" translation with no restrictions. This demonstrates the standard transitive verb pattern where all forms are semantically valid and accessible.

## Architectural Significance

Section 8.1 establishes the baseline architectural pattern for all other verb types in the Misti system:

1. **Complete Form Generation**: Every grammatically possible form exists in the system
2. **Consistent Metavalue Structure**: All forms use the same architectural pattern
3. **Translation Universality**: Regular verbs support all forms without semantic restrictions
4. **Database Blueprint**: This exact structure scales to all 137 forms for every regular Italian verb

This complete inventory serves as the definitive reference for implementing the verb conjugation system in the Misti database.
