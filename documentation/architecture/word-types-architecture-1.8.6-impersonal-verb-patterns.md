> **Part of**: [Misti Verb Forms System Architecture](./word-types-architecture-1-verbs.md)
> **Section**: 8.6 - Impersonal Verb Patterns
> **Example Verb**: "importare" (to matter/to import)

---

# Impersonal Verb Patterns: "importare" (to matter/to import) - Complete Form Inventory

## Overview
This section provides a comprehensive form inventory showing EVERY form and form_translation for the impersonal verb "importare" in the Misti system. This demonstrates complete metadata structures, coverage matrices, and architectural patterns for impersonal Italian verbs with full conjugation availability but specialized usage patterns.

**Total Forms**: 179 (51 simple + 49 essere compound + 49 avere compound + 30 progressive)

## Dictionary Entry
```sql
-- dictionary table
id: 990e8400-e29b-41d4-a716-446655440005
lemma: "importare"
word_type: "verb"
```

## Word-Level Metadata (via entity_meta_values)
```sql
-- entity_type='word', entity_id=990e8400-e29b-41d4-a716-446655440005
value_id → meta_values.value: "are-conjugation"    (conjugation_type)
value_id → meta_values.value: "freq-top300"        (frequency_tier)
value_id → meta_values.value: "CEFR-B2"            (cefr_level)
```

## Translation 1: "to matter/to be important" (impersonal meaning)
```sql
-- word_translations table
id: 770e8400-e29b-41d4-a716-446655440006
word_id: 990e8400-e29b-41d4-a716-446655440005
translation: "to matter/to be important"
display_priority: 1

-- entity_meta_values for this translation
-- entity_type='word_translation', entity_id=770e8400-e29b-41d4-a716-446655440006
value_id → metaattr002val015 (auxiliary: "essere")
value_id → metaattr020val100 (transitivity: "intransitive")
value_id → metaattr021val118 (verb_type: "impersonal")
-- NOTE: Impersonal verbs do NOT use "third-person-only" restriction
-- They generate all 130 forms and use 3rd person forms with indirect pronouns
```

## Translation 2: "to import" (transitive meaning)
```sql
-- word_translations table
id: 770e8400-e29b-41d4-a716-446655440007
word_id: 990e8400-e29b-41d4-a716-446655440005
translation: "to import"
display_priority: 2

-- entity_meta_values for this translation
-- entity_type='word_translation', entity_id=770e8400-e29b-41d4-a716-446655440007
value_id → metaattr002val014 (auxiliary: "avere")
value_id → metaattr020val099 (transitivity: "transitive")
```

## Complete Form Inventory (179 Total Forms)

### Metadata Architecture
All forms use the consolidated Entity Meta Values architecture:
- **Mood**: metaattr010val054 (indicativo), metaattr010val055 (congiuntivo), metaattr010val056 (condizionale), metaattr010val057 (imperativo), metaattr010val058 (infinito), metaattr010val059 (participio), metaattr010val060 (gerundio)
- **Tense**: metaattr019val096 (presente), metaattr019val097 (imperfetto), metaattr019val098 (passato-remoto), metaattr019val099 (futuro-semplice), etc.
- **Person**: metaattr014val060 (prima-persona), metaattr014val061 (seconda-persona), metaattr014val062 (terza-persona)
- **Number**: metaattr012val054 (singolare), metaattr012val055 (plurale)
- **Verb Form Type**: metaattr022val107 (simple), metaattr022val108 (compound), metaattr022val109 (progressive)

### Simple Forms (51 forms)

| Form ID | Form Text | Entity Meta Values | Translation Coverage 1 | Translation Coverage 2 |
|---------|-----------|-----------|---------------------|---------------------|
| 1068 | importo | metaattr010val054 (mood: "indicativo") + metaattr019val096 (tense: "presente") + metaattr014val060 (person: "prima-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple") | | I import |
| 1069 | importi | metaattr010val054 (mood: "indicativo") + metaattr019val096 (tense: "presente") + metaattr014val061 (person: "seconda-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple") | | you import |
| 1070 | importa | metaattr010val054 (mood: "indicativo") + metaattr019val096 (tense: "presente") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple") | it matters/is important | it imports |
| 1071 | importiamo | metaattr010val054 (mood: "indicativo") + metaattr019val096 (tense: "presente") + metaattr014val060 (person: "prima-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple") | | we import |
| 1072 | importate | metaattr010val054 (mood: "indicativo") + metaattr019val096 (tense: "presente") + metaattr014val061 (person: "seconda-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple") | | you import |
| 1073 | importano | metaattr010val054 (mood: "indicativo") + metaattr019val096 (tense: "presente") + metaattr014val062 (person: "terza-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple") | they matter/are important | they import |
| 1074 | importavo | metaattr010val054 (mood: "indicativo") + metaattr019val097 (tense: "imperfetto") + metaattr014val060 (person: "prima-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple") | | I was importing |
| 1075 | importavi | metaattr010val054 (mood: "indicativo") + metaattr019val097 (tense: "imperfetto") + metaattr014val061 (person: "seconda-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple") | | you were importing |
| 1076 | importava | metaattr010val054 (mood: "indicativo") + metaattr019val097 (tense: "imperfetto") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple") | it was mattering/being important | it was importing |
| 1077 | importavamo | metaattr010val054 (mood: "indicativo") + metaattr019val097 (tense: "imperfetto") + metaattr014val060 (person: "prima-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple") | | we were importing |
| 1078 | importavate | metaattr010val054 (mood: "indicativo") + metaattr019val097 (tense: "imperfetto") + metaattr014val061 (person: "seconda-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple") | | you were importing |
| 1079 | importavano | metaattr010val054 (mood: "indicativo") + metaattr019val097 (tense: "imperfetto") + metaattr014val062 (person: "terza-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple") | they were mattering/being important | they were importing |
| 1080 | importai | metaattr010val054 (mood: "indicativo") + metaattr019val098 (tense: "passato-remoto") + metaattr014val060 (person: "prima-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple") | | I imported |
| 1081 | importasti | metaattr010val054 (mood: "indicativo") + metaattr019val098 (tense: "passato-remoto") + metaattr014val061 (person: "seconda-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple") | | you imported |
| 1082 | importò | metaattr010val054 (mood: "indicativo") + metaattr019val098 (tense: "passato-remoto") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple") | it mattered/was important | it imported |
| 1083 | importammo | metaattr010val054 (mood: "indicativo") + metaattr019val098 (tense: "passato-remoto") + metaattr014val060 (person: "prima-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple") | | we imported |
| 1084 | importaste | metaattr010val054 (mood: "indicativo") + metaattr019val098 (tense: "passato-remoto") + metaattr014val061 (person: "seconda-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple") | | you imported |
| 1085 | importarono | metaattr010val054 (mood: "indicativo") + metaattr019val098 (tense: "passato-remoto") + metaattr014val062 (person: "terza-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple") | they mattered/were important | they imported |
| 1086 | importerò | metaattr010val054 (mood: "indicativo") + metaattr019val099 (tense: "futuro-semplice") + metaattr014val060 (person: "prima-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple") | | I will import |
| 1087 | importerai | metaattr010val054 (mood: "indicativo") + metaattr019val099 (tense: "futuro-semplice") + metaattr014val061 (person: "seconda-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple") | | you will import |
| 1088 | importerà | metaattr010val054 (mood: "indicativo") + metaattr019val099 (tense: "futuro-semplice") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple") | it will matter/be important | it will import |
| 1089 | importeremo | metaattr010val054 (mood: "indicativo") + metaattr019val099 (tense: "futuro-semplice") + metaattr014val060 (person: "prima-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple") | | we will import |
| 1090 | importerete | metaattr010val054 (mood: "indicativo") + metaattr019val099 (tense: "futuro-semplice") + metaattr014val061 (person: "seconda-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple") | | you will import |
| 1091 | importeranno | metaattr010val054 (mood: "indicativo") + metaattr019val099 (tense: "futuro-semplice") + metaattr014val062 (person: "terza-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple") | they will matter/be important | they will import |
| 1092 | importi | metaattr010val055 (mood: "congiuntivo") + metaattr019val102 (tense: "congiuntivo-presente") + metaattr014val060 (person: "prima-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple") | | (that) I import |
| 1093 | importi | metaattr010val055 (mood: "congiuntivo") + metaattr019val102 (tense: "congiuntivo-presente") + metaattr014val061 (person: "seconda-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple") | | (that) you import |
| 1094 | importi | metaattr010val055 (mood: "congiuntivo") + metaattr019val102 (tense: "congiuntivo-presente") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple") | (that) it matter/be important | (that) it import |
| 1095 | importiamo | metaattr010val055 (mood: "congiuntivo") + metaattr019val102 (tense: "congiuntivo-presente") + metaattr014val060 (person: "prima-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple") | | (that) we import |
| 1096 | importiate | metaattr010val055 (mood: "congiuntivo") + metaattr019val102 (tense: "congiuntivo-presente") + metaattr014val061 (person: "seconda-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple") | | (that) you import |
| 1097 | importino | metaattr010val055 (mood: "congiuntivo") + metaattr019val102 (tense: "congiuntivo-presente") + metaattr014val062 (person: "terza-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple") | (that) they matter/be important | (that) they import |
| 1098 | importassi | metaattr010val055 (mood: "congiuntivo") + metaattr019val103 (tense: "congiuntivo-imperfetto") + metaattr014val060 (person: "prima-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple") | | (that) I imported |
| 1099 | importassi | metaattr010val055 (mood: "congiuntivo") + metaattr019val103 (tense: "congiuntivo-imperfetto") + metaattr014val061 (person: "seconda-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple") | | (that) you imported |
| 1100 | importasse | metaattr010val055 (mood: "congiuntivo") + metaattr019val103 (tense: "congiuntivo-imperfetto") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple") | (that) it mattered/were important | (that) it imported |
| 1101 | importassimo | metaattr010val055 (mood: "congiuntivo") + metaattr019val103 (tense: "congiuntivo-imperfetto") + metaattr014val060 (person: "prima-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple") | | (that) we imported |
| 1102 | importaste | metaattr010val055 (mood: "congiuntivo") + metaattr019val103 (tense: "congiuntivo-imperfetto") + metaattr014val061 (person: "seconda-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple") | | (that) you imported |
| 1103 | importassero | metaattr010val055 (mood: "congiuntivo") + metaattr019val103 (tense: "congiuntivo-imperfetto") + metaattr014val062 (person: "terza-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple") | (that) they mattered/were important | (that) they imported |
| 1104 | importerei | metaattr010val056 (mood: "condizionale") + metaattr019val104 (tense: "condizionale-presente") + metaattr014val060 (person: "prima-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple") | | I would import |
| 1105 | importeresti | metaattr010val056 (mood: "condizionale") + metaattr019val104 (tense: "condizionale-presente") + metaattr014val061 (person: "seconda-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple") | | you would import |
| 1106 | importerebbe | metaattr010val056 (mood: "condizionale") + metaattr019val104 (tense: "condizionale-presente") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple") | it would matter/be important | it would import |
| 1107 | importeremmo | metaattr010val056 (mood: "condizionale") + metaattr019val104 (tense: "condizionale-presente") + metaattr014val060 (person: "prima-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple") | | we would import |
| 1108 | importereste | metaattr010val056 (mood: "condizionale") + metaattr019val104 (tense: "condizionale-presente") + metaattr014val061 (person: "seconda-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple") | | you would import |
| 1109 | importerebbero | metaattr010val056 (mood: "condizionale") + metaattr019val104 (tense: "condizionale-presente") + metaattr014val062 (person: "terza-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple") | they would matter/be important | they would import |
| 1110 | importa | metaattr010val057 (mood: "imperativo") + metaattr019val105 (tense: "imperativo-presente") + metaattr014val061 (person: "seconda-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple") | | import! |
| 1111 | importi | metaattr010val057 (mood: "imperativo") + metaattr019val105 (tense: "imperativo-presente") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple") | let it matter/be important! | let it import! |
| 1112 | importiamo | metaattr010val057 (mood: "imperativo") + metaattr019val105 (tense: "imperativo-presente") + metaattr014val060 (person: "prima-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple") | | let's import! |
| 1113 | importate | metaattr010val057 (mood: "imperativo") + metaattr019val105 (tense: "imperativo-presente") + metaattr014val061 (person: "seconda-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple") | | import! |
| 1114 | importino | metaattr010val057 (mood: "imperativo") + metaattr019val105 (tense: "imperativo-presente") + metaattr014val062 (person: "terza-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple") | let them matter/be important! | let them import! |
| 1115 | importare | metaattr010val058 (mood: "infinito") + metaattr019val106 (tense: "infinito-presente") + metaattr022val107 (verb_form_type: "simple") | to matter/be important | to import |
| 1116 | importante | metaattr010val059 (mood: "participio") + metaattr019val107 (tense: "participio-presente") + metaattr022val107 (verb_form_type: "simple") | mattering/being important | importing |
| 1117 | importato | metaattr010val059 (mood: "participio") + metaattr019val108 (tense: "participio-passato") + metaattr022val107 (verb_form_type: "simple") | mattered/been important | imported |
| 1118 | importando | metaattr010val060 (mood: "gerundio") + metaattr019val109 (tense: "gerundio-presente") + metaattr022val107 (verb_form_type: "simple") | mattering/being important | importing | 
### Compound Forms with essere auxiliary - Translation 1 only (49 forms)

| Form ID | Form Text | Entity Meta Values | Translation Coverage 1 | Translation Coverage 2 |
|---------|-----------|-----------|---------------------|---------------------|
| 1119 | sono importato | metaattr010val054 + metaattr019val110 + metaattr014val060 + metaattr012val054 + metaattr022val108 | | |
| 1120 | sei importato | metaattr010val054 + metaattr019val110 + metaattr014val061 + metaattr012val054 + metaattr022val108 | | |
| 1121 | è importato | metaattr010val054 + metaattr019val110 + metaattr014val062 + metaattr012val054 + metaattr022val108 | it has mattered/been important | |
| 1122 | siamo importati | metaattr010val054 + metaattr019val110 + metaattr014val060 + metaattr012val055 + metaattr022val108 | | |
| 1123 | siete importati | metaattr010val054 + metaattr019val110 + metaattr014val061 + metaattr012val055 + metaattr022val108 | | |
| 1124 | sono importati | metaattr010val054 + metaattr019val110 + metaattr014val062 + metaattr012val055 + metaattr022val108 | they have mattered/been important | |
| 1125 | ero importato | metaattr010val054 + metaattr019val111 + metaattr014val060 + metaattr012val054 + metaattr022val108 | | |
| 1126 | eri importato | metaattr010val054 + metaattr019val111 + metaattr014val061 + metaattr012val054 + metaattr022val108 | | |
| 1127 | era importato | metaattr010val054 + metaattr019val111 + metaattr014val062 + metaattr012val054 + metaattr022val108 | it had mattered/been important | |
| 1128 | eravamo importati | metaattr010val054 + metaattr019val111 + metaattr014val060 + metaattr012val055 + metaattr022val108 | | |
| 1129 | eravate importati | metaattr010val054 + metaattr019val111 + metaattr014val061 + metaattr012val055 + metaattr022val108 | | |
| 1130 | erano importati | metaattr010val054 + metaattr019val111 + metaattr014val062 + metaattr012val055 + metaattr022val108 | they had mattered/been important | |
| 1131 | fui importato | metaattr010val054 + metaattr019val112 + metaattr014val060 + metaattr012val054 + metaattr022val108 | | |
| 1132 | fosti importato | metaattr010val054 + metaattr019val112 + metaattr014val061 + metaattr012val054 + metaattr022val108 | | |
| 1133 | fu importato | metaattr010val054 + metaattr019val112 + metaattr014val062 + metaattr012val054 + metaattr022val108 | it had mattered/been important | |
| 1134 | fummo importati | metaattr010val054 + metaattr019val112 + metaattr014val060 + metaattr012val055 + metaattr022val108 | | |
| 1135 | foste importati | metaattr010val054 + metaattr019val112 + metaattr014val061 + metaattr012val055 + metaattr022val108 | | |
| 1136 | furono importati | metaattr010val054 + metaattr019val112 + metaattr014val062 + metaattr012val055 + metaattr022val108 | they had mattered/been important | |
| 1137 | sarò importato | metaattr010val054 + metaattr019val113 + metaattr014val060 + metaattr012val054 + metaattr022val108 | | |
| 1138 | sarai importato | metaattr010val054 + metaattr019val113 + metaattr014val061 + metaattr012val054 + metaattr022val108 | | |
| 1139 | sarà importato | metaattr010val054 + metaattr019val113 + metaattr014val062 + metaattr012val054 + metaattr022val108 | it will have mattered/been important | |
| 1140 | saremo importati | metaattr010val054 + metaattr019val113 + metaattr014val060 + metaattr012val055 + metaattr022val108 | | |
| 1141 | sarete importati | metaattr010val054 + metaattr019val113 + metaattr014val061 + metaattr012val055 + metaattr022val108 | | |
| 1142 | saranno importati | metaattr010val054 + metaattr019val113 + metaattr014val062 + metaattr012val055 + metaattr022val108 | they will have mattered/been important | |
| 1143 | sia importato | metaattr010val055 + metaattr019val114 + metaattr014val060 + metaattr012val054 + metaattr022val108 | | |
| 1144 | sia importato | metaattr010val055 + metaattr019val114 + metaattr014val061 + metaattr012val054 + metaattr022val108 | | |
| 1145 | sia importato | metaattr010val055 + metaattr019val114 + metaattr014val062 + metaattr012val054 + metaattr022val108 | (that) it have mattered/been important | |
| 1146 | siamo importati | metaattr010val055 + metaattr019val114 + metaattr014val060 + metaattr012val055 + metaattr022val108 | | |
| 1147 | siate importati | metaattr010val055 + metaattr019val114 + metaattr014val061 + metaattr012val055 + metaattr022val108 | | |
| 1148 | siano importati | metaattr010val055 + metaattr019val114 + metaattr014val062 + metaattr012val055 + metaattr022val108 | (that) they have mattered/been important | |
| 1149 | fossi importato | metaattr010val055 + metaattr019val115 + metaattr014val060 + metaattr012val054 + metaattr022val108 | | |
| 1150 | fossi importato | metaattr010val055 + metaattr019val115 + metaattr014val061 + metaattr012val054 + metaattr022val108 | | |
| 1151 | fosse importato | metaattr010val055 + metaattr019val115 + metaattr014val062 + metaattr012val054 + metaattr022val108 | (that) it had mattered/been important | |
| 1152 | fossimo importati | metaattr010val055 + metaattr019val115 + metaattr014val060 + metaattr012val055 + metaattr022val108 | | |
| 1153 | foste importati | metaattr010val055 + metaattr019val115 + metaattr014val061 + metaattr012val055 + metaattr022val108 | | |
| 1154 | fossero importati | metaattr010val055 + metaattr019val115 + metaattr014val062 + metaattr012val055 + metaattr022val108 | (that) they had mattered/been important | |
| 1155 | sarei importato | metaattr010val056 + metaattr019val116 + metaattr014val060 + metaattr012val054 + metaattr022val108 | | |
| 1156 | saresti importato | metaattr010val056 + metaattr019val116 + metaattr014val061 + metaattr012val054 + metaattr022val108 | | |
| 1157 | sarebbe importato | metaattr010val056 + metaattr019val116 + metaattr014val062 + metaattr012val054 + metaattr022val108 | it would have mattered/been important | |
| 1158 | saremmo importati | metaattr010val056 + metaattr019val116 + metaattr014val060 + metaattr012val055 + metaattr022val108 | | |
| 1159 | sareste importati | metaattr010val056 + metaattr019val116 + metaattr014val061 + metaattr012val055 + metaattr022val108 | | |
| 1160 | sarebbero importati | metaattr010val056 + metaattr019val116 + metaattr014val062 + metaattr012val055 + metaattr022val108 | they would have mattered/been important | |
| 1161 | sii importato | metaattr010val057 + metaattr019val117 + metaattr014val061 + metaattr012val054 + metaattr022val108 | | |
| 1162 | sia importato | metaattr010val057 + metaattr019val117 + metaattr014val062 + metaattr012val054 + metaattr022val108 | let it have mattered/been important! | |
| 1163 | siamo importati | metaattr010val057 + metaattr019val117 + metaattr014val060 + metaattr012val055 + metaattr022val108 | | |
| 1164 | siate importati | metaattr010val057 + metaattr019val117 + metaattr014val061 + metaattr012val055 + metaattr022val108 | | |
| 1165 | siano importati | metaattr010val057 + metaattr019val117 + metaattr014val062 + metaattr012val055 + metaattr022val108 | let them have mattered/been important! | |
| 1166 | essendo importato | metaattr010val060 + metaattr019val118 + metaattr022val108 | having mattered/been important | |
| 1167 | essere importato | metaattr010val058 + metaattr019val119 + metaattr022val108 | to have mattered/been important | |

### Compound Forms with avere auxiliary - Translation 2 only (49 forms)

| Form ID | Form Text | Entity Meta Values | Translation Coverage 1 | Translation Coverage 2 |
|---------|-----------|-----------|---------------------|---------------------|
| 1168 | ho importato | metaattr010val054 + metaattr019val110 + metaattr014val060 + metaattr012val054 + metaattr022val108 | | I have imported |
| 1169 | hai importato | metaattr010val054 + metaattr019val110 + metaattr014val061 + metaattr012val054 + metaattr022val108 | | you have imported |
| 1170 | ha importato | metaattr010val054 + metaattr019val110 + metaattr014val062 + metaattr012val054 + metaattr022val108 | | he/she has imported |
| 1171 | abbiamo importato | metaattr010val054 + metaattr019val110 + metaattr014val060 + metaattr012val055 + metaattr022val108 | | we have imported |
| 1172 | avete importato | metaattr010val054 + metaattr019val110 + metaattr014val061 + metaattr012val055 + metaattr022val108 | | you have imported |
| 1173 | hanno importato | metaattr010val054 + metaattr019val110 + metaattr014val062 + metaattr012val055 + metaattr022val108 | | they have imported |
| 1174 | avevo importato | metaattr010val054 + metaattr019val111 + metaattr014val060 + metaattr012val054 + metaattr022val108 | | I had imported |
| 1175 | avevi importato | metaattr010val054 + metaattr019val111 + metaattr014val061 + metaattr012val054 + metaattr022val108 | | you had imported |
| 1176 | aveva importato | metaattr010val054 + metaattr019val111 + metaattr014val062 + metaattr012val054 + metaattr022val108 | | he/she had imported |
| 1177 | avevamo importato | metaattr010val054 + metaattr019val111 + metaattr014val060 + metaattr012val055 + metaattr022val108 | | we had imported |
| 1178 | avevate importato | metaattr010val054 + metaattr019val111 + metaattr014val061 + metaattr012val055 + metaattr022val108 | | you had imported |
| 1179 | avevano importato | metaattr010val054 + metaattr019val111 + metaattr014val062 + metaattr012val055 + metaattr022val108 | | they had imported |
| 1180 | ebbi importato | metaattr010val054 + metaattr019val112 + metaattr014val060 + metaattr012val054 + metaattr022val108 | | I had imported |
| 1181 | avesti importato | metaattr010val054 + metaattr019val112 + metaattr014val061 + metaattr012val054 + metaattr022val108 | | you had imported |
| 1182 | ebbe importato | metaattr010val054 + metaattr019val112 + metaattr014val062 + metaattr012val054 + metaattr022val108 | | he/she had imported |
| 1183 | avemmo importato | metaattr010val054 + metaattr019val112 + metaattr014val060 + metaattr012val055 + metaattr022val108 | | we had imported |
| 1184 | aveste importato | metaattr010val054 + metaattr019val112 + metaattr014val061 + metaattr012val055 + metaattr022val108 | | you had imported |
| 1185 | ebbero importato | metaattr010val054 + metaattr019val112 + metaattr014val062 + metaattr012val055 + metaattr022val108 | | they had imported |
| 1186 | avrò importato | metaattr010val054 + metaattr019val113 + metaattr014val060 + metaattr012val054 + metaattr022val108 | | I will have imported |
| 1187 | avrai importato | metaattr010val054 + metaattr019val113 + metaattr014val061 + metaattr012val054 + metaattr022val108 | | you will have imported |
| 1188 | avrà importato | metaattr010val054 + metaattr019val113 + metaattr014val062 + metaattr012val054 + metaattr022val108 | | he/she will have imported |
| 1189 | avremo importato | metaattr010val054 + metaattr019val113 + metaattr014val060 + metaattr012val055 + metaattr022val108 | | we will have imported |
| 1190 | avrete importato | metaattr010val054 + metaattr019val113 + metaattr014val061 + metaattr012val055 + metaattr022val108 | | you will have imported |
| 1191 | avranno importato | metaattr010val054 + metaattr019val113 + metaattr014val062 + metaattr012val055 + metaattr022val108 | | they will have imported |
| 1192 | abbia importato | metaattr010val055 + metaattr019val114 + metaattr014val060 + metaattr012val054 + metaattr022val108 | | (that) I have imported |
| 1193 | abbia importato | metaattr010val055 + metaattr019val114 + metaattr014val061 + metaattr012val054 + metaattr022val108 | | (that) you have imported |
| 1194 | abbia importato | metaattr010val055 + metaattr019val114 + metaattr014val062 + metaattr012val054 + metaattr022val108 | | (that) he/she have imported |
| 1195 | abbiamo importato | metaattr010val055 + metaattr019val114 + metaattr014val060 + metaattr012val055 + metaattr022val108 | | (that) we have imported |
| 1196 | abbiate importato | metaattr010val055 + metaattr019val114 + metaattr014val061 + metaattr012val055 + metaattr022val108 | | (that) you have imported |
| 1197 | abbiano importato | metaattr010val055 + metaattr019val114 + metaattr014val062 + metaattr012val055 + metaattr022val108 | | (that) they have imported |
| 1198 | avessi importato | metaattr010val055 + metaattr019val115 + metaattr014val060 + metaattr012val054 + metaattr022val108 | | (that) I had imported |
| 1199 | avessi importato | metaattr010val055 + metaattr019val115 + metaattr014val061 + metaattr012val054 + metaattr022val108 | | (that) you had imported |
| 1200 | avesse importato | metaattr010val055 + metaattr019val115 + metaattr014val062 + metaattr012val054 + metaattr022val108 | | (that) he/she had imported |
| 1201 | avessimo importato | metaattr010val055 + metaattr019val115 + metaattr014val060 + metaattr012val055 + metaattr022val108 | | (that) we had imported |
| 1202 | aveste importato | metaattr010val055 + metaattr019val115 + metaattr014val061 + metaattr012val055 + metaattr022val108 | | (that) you had imported |
| 1203 | avessero importato | metaattr010val055 + metaattr019val115 + metaattr014val062 + metaattr012val055 + metaattr022val108 | | (that) they had imported |
| 1204 | avrei importato | metaattr010val056 + metaattr019val116 + metaattr014val060 + metaattr012val054 + metaattr022val108 | | I would have imported |
| 1205 | avresti importato | metaattr010val056 + metaattr019val116 + metaattr014val061 + metaattr012val054 + metaattr022val108 | | you would have imported |
| 1206 | avrebbe importato | metaattr010val056 + metaattr019val116 + metaattr014val062 + metaattr012val054 + metaattr022val108 | | he/she would have imported |
| 1207 | avremmo importato | metaattr010val056 + metaattr019val116 + metaattr014val060 + metaattr012val055 + metaattr022val108 | | we would have imported |
| 1208 | avreste importato | metaattr010val056 + metaattr019val116 + metaattr014val061 + metaattr012val055 + metaattr022val108 | | you would have imported |
| 1209 | avrebbero importato | metaattr010val056 + metaattr019val116 + metaattr014val062 + metaattr012val055 + metaattr022val108 | | they would have imported |
| 1210 | abbi importato | metaattr010val057 + metaattr019val117 + metaattr014val061 + metaattr012val054 + metaattr022val108 | | have imported! |
| 1211 | abbia importato | metaattr010val057 + metaattr019val117 + metaattr014val062 + metaattr012val054 + metaattr022val108 | | let him/her have imported! |
| 1212 | abbiamo importato | metaattr010val057 + metaattr019val117 + metaattr014val060 + metaattr012val055 + metaattr022val108 | | let's have imported! |
| 1213 | abbiate importato | metaattr010val057 + metaattr019val117 + metaattr014val061 + metaattr012val055 + metaattr022val108 | | have imported! |
| 1214 | abbiano importato | metaattr010val057 + metaattr019val117 + metaattr014val062 + metaattr012val055 + metaattr022val108 | | let them have imported! |
| 1215 | avendo importato | metaattr010val060 + metaattr019val118 + metaattr022val108 | | having imported |
| 1216 | avere importato | metaattr010val058 + metaattr019val119 + metaattr022val108 | | to have imported | 
### Progressive Forms with stare auxiliary (37 forms)

| Form ID | Form Text | Entity Meta Values | Translation Coverage 1 | Translation Coverage 2 |
|---------|-----------|-----------|---------------------|---------------------|
| 1217 | sto importando | metaattr010val054 + metaattr019val120 + metaattr014val060 + metaattr012val054 + metaattr022val109 | | I am importing |
| 1218 | stai importando | metaattr010val054 + metaattr019val120 + metaattr014val061 + metaattr012val054 + metaattr022val109 | | you are importing |
| 1219 | sta importando | metaattr010val054 + metaattr019val120 + metaattr014val062 + metaattr012val054 + metaattr022val109 | it is mattering/being important | it is importing |
| 1220 | stiamo importando | metaattr010val054 + metaattr019val120 + metaattr014val060 + metaattr012val055 + metaattr022val109 | | we are importing |
| 1221 | state importando | metaattr010val054 + metaattr019val120 + metaattr014val061 + metaattr012val055 + metaattr022val109 | | you are importing |
| 1222 | stanno importando | metaattr010val054 + metaattr019val120 + metaattr014val062 + metaattr012val055 + metaattr022val109 | they are mattering/being important | they are importing |
| 1223 | stavo importando | metaattr010val054 + metaattr019val121 + metaattr014val060 + metaattr012val054 + metaattr022val109 | | I was importing |
| 1224 | stavi importando | metaattr010val054 + metaattr019val121 + metaattr014val061 + metaattr012val054 + metaattr022val109 | | you were importing |
| 1225 | stava importando | metaattr010val054 + metaattr019val121 + metaattr014val062 + metaattr012val054 + metaattr022val109 | it was mattering/being important | it was importing |
| 1226 | stavamo importando | metaattr010val054 + metaattr019val121 + metaattr014val060 + metaattr012val055 + metaattr022val109 | | we were importing |
| 1227 | stavate importando | metaattr010val054 + metaattr019val121 + metaattr014val061 + metaattr012val055 + metaattr022val109 | | you were importing |
| 1228 | stavano importando | metaattr010val054 + metaattr019val121 + metaattr014val062 + metaattr012val055 + metaattr022val109 | they were mattering/being important | they were importing |
| 1229 | starò importando | metaattr010val054 + metaattr019val122 + metaattr014val060 + metaattr012val054 + metaattr022val109 | | I will be importing |
| 1230 | starai importando | metaattr010val054 + metaattr019val122 + metaattr014val061 + metaattr012val054 + metaattr022val109 | | you will be importing |
| 1231 | starà importando | metaattr010val054 + metaattr019val122 + metaattr014val062 + metaattr012val054 + metaattr022val109 | it will be mattering/being important | it will be importing |
| 1232 | staremo importando | metaattr010val054 + metaattr019val122 + metaattr014val060 + metaattr012val055 + metaattr022val109 | | we will be importing |
| 1233 | starete importando | metaattr010val054 + metaattr019val122 + metaattr014val061 + metaattr012val055 + metaattr022val109 | | you will be importing |
| 1234 | staranno importando | metaattr010val054 + metaattr019val122 + metaattr014val062 + metaattr012val055 + metaattr022val109 | they will be mattering/being important | they will be importing |
| 1235 | stia importando | metaattr010val055 + metaattr019val123 + metaattr014val060 + metaattr012val054 + metaattr022val109 | | (that) I be importing |
| 1236 | stia importando | metaattr010val055 + metaattr019val123 + metaattr014val061 + metaattr012val054 + metaattr022val109 | | (that) you be importing |
| 1237 | stia importando | metaattr010val055 + metaattr019val123 + metaattr014val062 + metaattr012val054 + metaattr022val109 | (that) it be mattering/being important | (that) it be importing |
| 1238 | stiamo importando | metaattr010val055 + metaattr019val123 + metaattr014val060 + metaattr012val055 + metaattr022val109 | | (that) we be importing |
| 1239 | stiate importando | metaattr010val055 + metaattr019val123 + metaattr014val061 + metaattr012val055 + metaattr022val109 | | (that) you be importing |
| 1240 | stiano importando | metaattr010val055 + metaattr019val123 + metaattr014val062 + metaattr012val055 + metaattr022val109 | (that) they be mattering/being important | (that) they be importing |
| 1247 | starei importando | metaattr010val056 + metaattr019val125 + metaattr014val060 + metaattr012val054 + metaattr022val109 | | I would be importing |
| 1248 | staresti importando | metaattr010val056 + metaattr019val125 + metaattr014val061 + metaattr012val054 + metaattr022val109 | | you would be importing |
| 1249 | starebbe importando | metaattr010val056 + metaattr019val125 + metaattr014val062 + metaattr012val054 + metaattr022val109 | it would be mattering/being important | it would be importing |
| 1250 | staremmo importando | metaattr010val056 + metaattr019val125 + metaattr014val060 + metaattr012val055 + metaattr022val109 | | we would be importing |
| 1251 | stareste importando | metaattr010val056 + metaattr019val125 + metaattr014val061 + metaattr012val055 + metaattr022val109 | | you would be importing |
| 1252 | starebbero importando | metaattr010val056 + metaattr019val125 + metaattr014val062 + metaattr012val055 + metaattr022val109 | they would be mattering/being important | they would be importing |
## Form_Translations Coverage

**Selective Translation Coverage**: Forms link to translations based on semantic appropriateness:

### Translation 1: "to matter/to be important" (Impersonal Usage)
- **Coverage**: ALL forms generated (130 total) - impersonal is a USAGE pattern, not a form restriction
- **Form Coverage**: Simple forms (all 6 persons), essere compound forms (all 6 persons), progressive forms (all 6 persons)
- **Usage Context**: Impersonal constructions with indirect object pronouns combining with 3rd person forms
- **Key Pattern**: Uses 3rd person verb forms (BOTH singular and plural) with ALL persons via indirect pronouns
  - **Singular subject**: mi importa, ti importa, gli/le importa, ci importa, vi importa, gli importa
  - **Plural subject**: mi importano, ti importano, gli/le importano, ci importano, vi importano, gli importano
- **Number Agreement**: Verb number agrees with grammatical SUBJECT, not the person (indirect pronoun)
  - "Mi importa questo libro" (singular subject)
  - "Mi importano questi libri" (plural subject)
- **Semantic Meaning**: "mi importa" = "to me it matters" (indirect object + 3rd person verb)
- **Auxiliary**: Uses essere auxiliary for compound forms

### Translation 2: "to import" (Transitive Usage)
- **Coverage**: All forms support transitive meaning expressing commercial import
- **Form Coverage**: Simple forms (all persons), avere compound forms (all persons), progressive forms (all persons)
- **Usage Context**: Business/commercial contexts with direct objects
- **Examples**: "importo beni" (I import goods), "importano materie prime" (they import raw materials)
- **Auxiliary**: Uses avere auxiliary for compound forms

## Architectural Significance

Section 8.6 demonstrates the impersonal verb architectural pattern in the Misti system:

1. **Complete Form Generation**: Every grammatically possible form exists (179 total), demonstrating architectural completeness
2. **Translation-Level Metadata**: Impersonal verb type properly placed at translation level as a USAGE PATTERN attribute
3. **Dual Auxiliary Support**: Translation 1 uses essere auxiliary, Translation 2 uses avere auxiliary
4. **Impersonal Usage Pattern**: Impersonal verbs generate ALL forms but use 3rd person forms with indirect object pronouns (mi importa, ti importa, gli importa) to express all persons semantically
5. **Dual Translation Coverage**: Full support for both impersonal and transitive meanings with complete form coverage

## Critical Distinction: Impersonal vs. Third-Person-Only

**Impersonal Verbs (importare "to matter")**:
- ✅ Generate ALL 130 forms (all persons, all tenses, all moods)
- ✅ Use 3rd person forms (BOTH singular and plural) with indirect pronouns for all persons
  - **Singular**: mi importa, ti importa, gli/le importa, ci importa, vi importa, gli importa
  - **Plural**: mi importano, ti importano, gli/le importano, ci importano, vi importano, gli importano
- ✅ Marked with `verb_type: "impersonal"` attribute on translation
- ✅ Semantic pattern: [Indirect pronoun] + [3rd person verb (sg/pl)] + [subject/infinitive]
- ✅ Number agreement: Verb agrees with grammatical SUBJECT, not person
- ❌ Do NOT use `restriction: "third-person-only"`

**Third-Person-Only Verbs (piovere "to rain")**:
- ✅ Generate ONLY 48 forms (3rd person only, no imperatives)
- ✅ Genuinely defective - cannot conjugate in other persons
- ✅ Marked with `restriction: "third-person-only"` attribute
- ✅ Weather/meteorological verbs: piovere, nevicare, grandinare
- ❌ Do NOT use `verb_type: "impersonal"`

This complete inventory serves as the definitive reference for implementing impersonal verb conjugation with proper metadata architecture, demonstrating that impersonal is a USAGE PATTERN (all forms with indirect pronouns) distinct from genuine form restrictions (third-person-only defective verbs).
