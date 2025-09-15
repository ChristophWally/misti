> **Part of**: [Misti Verb Forms System Architecture](./verb-forms-system-architecture.md)
> **Section**: 8.7 - Irregular Verb Patterns
> **Example Verb**: "andare" (to go)

---

# Irregular Verb Patterns: "andare" (to go) - Complete Form Inventory

## Overview
This section provides a comprehensive form inventory showing EVERY form and form_translation for the irregular verb "andare" in the Misti system. This demonstrates irregular verb architecture with proper irregularity marking, essere auxiliary usage, and complete coverage matrices for Italian irregular verbs.

**Total Forms**: 137 (51 simple + 49 compound + 37 progressive)

## Dictionary Entry
```sql
-- dictionary table
id: 990e8400-e29b-41d4-a716-446655440007
lemma: "andare"
word_type: "verb"
```

## Word-Level Metadata (via entity_meta_values)
```sql
-- entity_type='word', entity_id=990e8400-e29b-41d4-a716-446655440007
value_id → meta_values.value: "are-conjugation"    (conjugation_type)
value_id → meta_values.value: "freq-top10"         (frequency_tier)
value_id → meta_values.value: "CEFR-A1"            (cefr_level)
```

## Translation: "to go" (intransitive meaning)
```sql
-- word_translations table
id: 880e8400-e29b-41d4-a716-446655440001
word_id: 990e8400-e29b-41d4-a716-446655440007
translation: "to go"
display_priority: 1

-- entity_meta_values for this translation
-- entity_type='word_translation', entity_id=880e8400-e29b-41d4-a716-446655440001
value_id → metaattr002val015 (auxiliary: "essere")
value_id → metaattr020val100 (transitivity: "intransitive")
value_id → metaattr021val114 (verb_type: "normal")
```

## Complete Form Inventory (137 Total Forms)

### Metadata Architecture
All forms use the consolidated Entity Meta Values architecture:
- **Mood**: metaattr010val054 (indicativo), metaattr010val055 (congiuntivo), metaattr010val056 (condizionale), metaattr010val057 (imperativo), metaattr010val058 (infinito), metaattr010val059 (participio), metaattr010val060 (gerundio)
- **Tense**: metaattr019val096 (presente), metaattr019val097 (imperfetto), metaattr019val098 (passato-remoto), metaattr019val099 (futuro-semplice), etc.
- **Person**: metaattr014val060 (prima-persona), metaattr014val061 (seconda-persona), metaattr014val062 (terza-persona)
- **Number**: metaattr012val054 (singolare), metaattr012val055 (plurale)
- **Verb Form Type**: metaattr022val107 (simple), metaattr022val108 (compound), metaattr022val109 (progressive)
- **Irregularity**: metaattr005val066 (irregularity: "irregular") (applied only to truly irregular forms)

### Simple Forms (51 forms)

| Form ID | Form Text | Entity Meta Values | Translation Coverage |
|---------|-----------|-----------|---------------------|
| 1272 | vado | metaattr010val054 (mood: "indicativo") + metaattr019val096 (tense: "presente") + metaattr014val060 (person: "prima-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple") + metaattr005val066 (irregularity: "irregular") | I go |
| 1273 | vai | metaattr010val054 (mood: "indicativo") + metaattr019val096 (tense: "presente") + metaattr014val061 (person: "seconda-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple") + metaattr005val066 (irregularity: "irregular") | you go |
| 1274 | va | metaattr010val054 (mood: "indicativo") + metaattr019val096 (tense: "presente") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple") + metaattr005val066 (irregularity: "irregular") | he/she goes |
| 1275 | andiamo | metaattr010val054 (mood: "indicativo") + metaattr019val096 (tense: "presente") + metaattr014val060 (person: "prima-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple") | we go |
| 1276 | andate | metaattr010val054 (mood: "indicativo") + metaattr019val096 (tense: "presente") + metaattr014val061 (person: "seconda-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple") | you go |
| 1277 | vanno | metaattr010val054 (mood: "indicativo") + metaattr019val096 (tense: "presente") + metaattr014val062 (person: "terza-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple") + metaattr005val066 (irregularity: "irregular") | they go |
| 1278 | andavo | metaattr010val054 (mood: "indicativo") + metaattr019val097 (tense: "imperfetto") + metaattr014val060 (person: "prima-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple") | I was going |
| 1279 | andavi | metaattr010val054 (mood: "indicativo") + metaattr019val097 (tense: "imperfetto") + metaattr014val061 (person: "seconda-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple") | you were going |
| 1280 | andava | metaattr010val054 (mood: "indicativo") + metaattr019val097 (tense: "imperfetto") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple") | he/she was going |
| 1281 | andavamo | metaattr010val054 (mood: "indicativo") + metaattr019val097 (tense: "imperfetto") + metaattr014val060 (person: "prima-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple") | we were going |
| 1282 | andavate | metaattr010val054 (mood: "indicativo") + metaattr019val097 (tense: "imperfetto") + metaattr014val061 (person: "seconda-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple") | you were going |
| 1283 | andavano | metaattr010val054 (mood: "indicativo") + metaattr019val097 (tense: "imperfetto") + metaattr014val062 (person: "terza-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple") | they were going |
| 1284 | andai | metaattr010val054 (mood: "indicativo") + metaattr019val098 (tense: "passato-remoto") + metaattr014val060 (person: "prima-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple") | I went |
| 1285 | andasti | metaattr010val054 (mood: "indicativo") + metaattr019val098 (tense: "passato-remoto") + metaattr014val061 (person: "seconda-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple") | you went |
| 1286 | andò | metaattr010val054 (mood: "indicativo") + metaattr019val098 (tense: "passato-remoto") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple") | he/she went |
| 1287 | andammo | metaattr010val054 (mood: "indicativo") + metaattr019val098 (tense: "passato-remoto") + metaattr014val060 (person: "prima-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple") | we went |
| 1288 | andaste | metaattr010val054 (mood: "indicativo") + metaattr019val098 (tense: "passato-remoto") + metaattr014val061 (person: "seconda-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple") | you went |
| 1289 | andarono | metaattr010val054 (mood: "indicativo") + metaattr019val098 (tense: "passato-remoto") + metaattr014val062 (person: "terza-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple") | they went |
| 1290 | andrò | metaattr010val054 (mood: "indicativo") + metaattr019val099 (tense: "futuro-semplice") + metaattr014val060 (person: "prima-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple") + metaattr005val066 (irregularity: "irregular") | I will go |
| 1291 | andrai | metaattr010val054 (mood: "indicativo") + metaattr019val099 (tense: "futuro-semplice") + metaattr014val061 (person: "seconda-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple") + metaattr005val066 (irregularity: "irregular") | you will go |
| 1292 | andrà | metaattr010val054 (mood: "indicativo") + metaattr019val099 (tense: "futuro-semplice") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple") + metaattr005val066 (irregularity: "irregular") | he/she will go |
| 1293 | andremo | metaattr010val054 (mood: "indicativo") + metaattr019val099 (tense: "futuro-semplice") + metaattr014val060 (person: "prima-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple") + metaattr005val066 (irregularity: "irregular") | we will go |
| 1294 | andrete | metaattr010val054 (mood: "indicativo") + metaattr019val099 (tense: "futuro-semplice") + metaattr014val061 (person: "seconda-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple") + metaattr005val066 (irregularity: "irregular") | you will go |
| 1295 | andranno | metaattr010val054 (mood: "indicativo") + metaattr019val099 (tense: "futuro-semplice") + metaattr014val062 (person: "terza-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple") + metaattr005val066 (irregularity: "irregular") | they will go |
| 1296 | vada | metaattr010val055 (mood: "congiuntivo") + metaattr019val102 (tense: "congiuntivo-presente") + metaattr014val060 (person: "prima-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple") + metaattr005val066 (irregularity: "irregular") | (that) I go |
| 1297 | vada | metaattr010val055 (mood: "congiuntivo") + metaattr019val102 (tense: "congiuntivo-presente") + metaattr014val061 (person: "seconda-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple") + metaattr005val066 (irregularity: "irregular") | (that) you go |
| 1298 | vada | metaattr010val055 (mood: "congiuntivo") + metaattr019val102 (tense: "congiuntivo-presente") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple") + metaattr005val066 (irregularity: "irregular") | (that) he/she goes |
| 1299 | andiamo | metaattr010val055 (mood: "congiuntivo") + metaattr019val102 (tense: "congiuntivo-presente") + metaattr014val060 (person: "prima-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple") | (that) we go |
| 1300 | andiate | metaattr010val055 (mood: "congiuntivo") + metaattr019val102 (tense: "congiuntivo-presente") + metaattr014val061 (person: "seconda-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple") | (that) you go |
| 1301 | vadano | metaattr010val055 (mood: "congiuntivo") + metaattr019val102 (tense: "congiuntivo-presente") + metaattr014val062 (person: "terza-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple") + metaattr005val066 (irregularity: "irregular") | (that) they go |
| 1302 | andassi | metaattr010val055 (mood: "congiuntivo") + metaattr019val103 (tense: "congiuntivo-imperfetto") + metaattr014val060 (person: "prima-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple") | (that) I went |
| 1303 | andassi | metaattr010val055 (mood: "congiuntivo") + metaattr019val103 (tense: "congiuntivo-imperfetto") + metaattr014val061 (person: "seconda-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple") | (that) you went |
| 1304 | andasse | metaattr010val055 (mood: "congiuntivo") + metaattr019val103 (tense: "congiuntivo-imperfetto") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple") | (that) he/she went |
| 1305 | andassimo | metaattr010val055 (mood: "congiuntivo") + metaattr019val103 (tense: "congiuntivo-imperfetto") + metaattr014val060 (person: "prima-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple") | (that) we went |
| 1306 | andaste | metaattr010val055 (mood: "congiuntivo") + metaattr019val103 (tense: "congiuntivo-imperfetto") + metaattr014val061 (person: "seconda-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple") | (that) you went |
| 1307 | andassero | metaattr010val055 (mood: "congiuntivo") + metaattr019val103 (tense: "congiuntivo-imperfetto") + metaattr014val062 (person: "terza-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple") | (that) they went |
| 1308 | andrei | metaattr010val056 (mood: "condizionale") + metaattr019val104 (tense: "condizionale-presente") + metaattr014val060 (person: "prima-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple") + metaattr005val066 (irregularity: "irregular") | I would go |
| 1309 | andresti | metaattr010val056 (mood: "condizionale") + metaattr019val104 (tense: "condizionale-presente") + metaattr014val061 (person: "seconda-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple") + metaattr005val066 (irregularity: "irregular") | you would go |
| 1310 | andrebbe | metaattr010val056 (mood: "condizionale") + metaattr019val104 (tense: "condizionale-presente") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple") + metaattr005val066 (irregularity: "irregular") | he/she would go |
| 1311 | andremmo | metaattr010val056 (mood: "condizionale") + metaattr019val104 (tense: "condizionale-presente") + metaattr014val060 (person: "prima-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple") + metaattr005val066 (irregularity: "irregular") | we would go |
| 1312 | andreste | metaattr010val056 (mood: "condizionale") + metaattr019val104 (tense: "condizionale-presente") + metaattr014val061 (person: "seconda-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple") + metaattr005val066 (irregularity: "irregular") | you would go |
| 1313 | andrebbero | metaattr010val056 (mood: "condizionale") + metaattr019val104 (tense: "condizionale-presente") + metaattr014val062 (person: "terza-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple") + metaattr005val066 (irregularity: "irregular") | they would go |
| 1314 | va' | metaattr010val057 (mood: "imperativo") + metaattr019val105 (tense: "imperativo-presente") + metaattr014val061 (person: "seconda-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple") + metaattr005val066 (irregularity: "irregular") | go! |
| 1315 | vada | metaattr010val057 (mood: "imperativo") + metaattr019val105 (tense: "imperativo-presente") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple") + metaattr005val066 (irregularity: "irregular") | let him/her go! |
| 1316 | andiamo | metaattr010val057 (mood: "imperativo") + metaattr019val105 (tense: "imperativo-presente") + metaattr014val060 (person: "prima-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple") | let's go! |
| 1317 | andate | metaattr010val057 (mood: "imperativo") + metaattr019val105 (tense: "imperativo-presente") + metaattr014val061 (person: "seconda-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple") | go! |
| 1318 | vadano | metaattr010val057 (mood: "imperativo") + metaattr019val105 (tense: "imperativo-presente") + metaattr014val062 (person: "terza-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple") + metaattr005val066 (irregularity: "irregular") | let them go! |
| 1319 | andare | metaattr010val058 (mood: "infinito") + metaattr019val106 (tense: "infinito-presente")  + metaattr022val107 (verb_form_type: "simple") | to go |
| 1320 | andante | metaattr010val059 (mood: "participio") + metaattr019val107 (tense: "participio-presente")  + metaattr022val107 (verb_form_type: "simple") | going |
| 1321 | andato | metaattr010val059 (mood: "participio") + metaattr019val108 (tense: "participio-passato")  + metaattr022val107 (verb_form_type: "simple") | gone |
| 1322 | andando | metaattr010val060 (mood: "gerundio") + metaattr019val109 (tense: "gerundio-presente")  + metaattr022val107 (verb_form_type: "simple") | going |

### Compound Forms with essere auxiliary (49 forms)

| Form ID | Form Text | Entity Meta Values | Translation Coverage |
|---------|-----------|-----------|---------------------|
| 1323 | sono andato | metaattr010val054 (mood: "indicativo") + metaattr019val110 (tense: "passato-prossimo") + metaattr014val060 (person: "prima-persona") + metaattr012val054 (number: "singolare") + metaattr022val108 (verb_form_type: "compound") | I have gone |
| 1324 | sei andato | metaattr010val054 (mood: "indicativo") + metaattr019val110 (tense: "passato-prossimo") + metaattr014val061 (person: "seconda-persona") + metaattr012val054 (number: "singolare") + metaattr022val108 (verb_form_type: "compound") | you have gone |
| 1325 | è andato | metaattr010val054 (mood: "indicativo") + metaattr019val110 (tense: "passato-prossimo") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val108 (verb_form_type: "compound") | he/she has gone |
| 1326 | siamo andati | metaattr010val054 (mood: "indicativo") + metaattr019val110 (tense: "passato-prossimo") + metaattr014val060 (person: "prima-persona") + metaattr012val055 (number: "plurale") + metaattr022val108 (verb_form_type: "compound") | we have gone |
| 1327 | siete andati | metaattr010val054 (mood: "indicativo") + metaattr019val110 (tense: "passato-prossimo") + metaattr014val061 (person: "seconda-persona") + metaattr012val055 (number: "plurale") + metaattr022val108 (verb_form_type: "compound") | you have gone |
| 1328 | sono andati | metaattr010val054 (mood: "indicativo") + metaattr019val110 (tense: "passato-prossimo") + metaattr014val062 (person: "terza-persona") + metaattr012val055 (number: "plurale") + metaattr022val108 (verb_form_type: "compound") | they have gone |
| 1329 | ero andato | metaattr010val054 (mood: "indicativo") + metaattr019val111 (tense: "trapassato-prossimo") + metaattr014val060 (person: "prima-persona") + metaattr012val054 (number: "singolare") + metaattr022val108 (verb_form_type: "compound") | I had gone |
| 1330 | eri andato | metaattr010val054 (mood: "indicativo") + metaattr019val111 (tense: "trapassato-prossimo") + metaattr014val061 (person: "seconda-persona") + metaattr012val054 (number: "singolare") + metaattr022val108 (verb_form_type: "compound") | you had gone |
| 1331 | era andato | metaattr010val054 (mood: "indicativo") + metaattr019val111 (tense: "trapassato-prossimo") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val108 (verb_form_type: "compound") | he/she had gone |
| 1332 | eravamo andati | metaattr010val054 (mood: "indicativo") + metaattr019val111 (tense: "trapassato-prossimo") + metaattr014val060 (person: "prima-persona") + metaattr012val055 (number: "plurale") + metaattr022val108 (verb_form_type: "compound") | we had gone |
| 1333 | eravate andati | metaattr010val054 (mood: "indicativo") + metaattr019val111 (tense: "trapassato-prossimo") + metaattr014val061 (person: "seconda-persona") + metaattr012val055 (number: "plurale") + metaattr022val108 (verb_form_type: "compound") | you had gone |
| 1334 | erano andati | metaattr010val054 (mood: "indicativo") + metaattr019val111 (tense: "trapassato-prossimo") + metaattr014val062 (person: "terza-persona") + metaattr012val055 (number: "plurale") + metaattr022val108 (verb_form_type: "compound") | they had gone |
| 1335 | fui andato | metaattr010val054 (mood: "indicativo") + metaattr019val112 (tense: "trapassato-remoto") + metaattr014val060 (person: "prima-persona") + metaattr012val054 (number: "singolare") + metaattr022val108 (verb_form_type: "compound") | I had gone |
| 1336 | fosti andato | metaattr010val054 (mood: "indicativo") + metaattr019val112 (tense: "trapassato-remoto") + metaattr014val061 (person: "seconda-persona") + metaattr012val054 (number: "singolare") + metaattr022val108 (verb_form_type: "compound") | you had gone |
| 1337 | fu andato | metaattr010val054 (mood: "indicativo") + metaattr019val112 (tense: "trapassato-remoto") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val108 (verb_form_type: "compound") | he/she had gone |
| 1338 | fummo andati | metaattr010val054 (mood: "indicativo") + metaattr019val112 (tense: "trapassato-remoto") + metaattr014val060 (person: "prima-persona") + metaattr012val055 (number: "plurale") + metaattr022val108 (verb_form_type: "compound") | we had gone |
| 1339 | foste andati | metaattr010val054 (mood: "indicativo") + metaattr019val112 (tense: "trapassato-remoto") + metaattr014val061 (person: "seconda-persona") + metaattr012val055 (number: "plurale") + metaattr022val108 (verb_form_type: "compound") | you had gone |
| 1340 | furono andati | metaattr010val054 (mood: "indicativo") + metaattr019val112 (tense: "trapassato-remoto") + metaattr014val062 (person: "terza-persona") + metaattr012val055 (number: "plurale") + metaattr022val108 (verb_form_type: "compound") | they had gone |
| 1341 | sarò andato | metaattr010val054 (mood: "indicativo") + metaattr019val113 (tense: "futuro-anteriore") + metaattr014val060 (person: "prima-persona") + metaattr012val054 (number: "singolare") + metaattr022val108 (verb_form_type: "compound") | I will have gone |
| 1342 | sarai andato | metaattr010val054 (mood: "indicativo") + metaattr019val113 (tense: "futuro-anteriore") + metaattr014val061 (person: "seconda-persona") + metaattr012val054 (number: "singolare") + metaattr022val108 (verb_form_type: "compound") | you will have gone |
| 1343 | sarà andato | metaattr010val054 (mood: "indicativo") + metaattr019val113 (tense: "futuro-anteriore") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val108 (verb_form_type: "compound") | he/she will have gone |
| 1344 | saremo andati | metaattr010val054 (mood: "indicativo") + metaattr019val113 (tense: "futuro-anteriore") + metaattr014val060 (person: "prima-persona") + metaattr012val055 (number: "plurale") + metaattr022val108 (verb_form_type: "compound") | we will have gone |
| 1345 | sarete andati | metaattr010val054 (mood: "indicativo") + metaattr019val113 (tense: "futuro-anteriore") + metaattr014val061 (person: "seconda-persona") + metaattr012val055 (number: "plurale") + metaattr022val108 (verb_form_type: "compound") | you will have gone |
| 1346 | saranno andati | metaattr010val054 (mood: "indicativo") + metaattr019val113 (tense: "futuro-anteriore") + metaattr014val062 (person: "terza-persona") + metaattr012val055 (number: "plurale") + metaattr022val108 (verb_form_type: "compound") | they will have gone |
| 1347 | sia andato | metaattr010val055 (mood: "congiuntivo") + metaattr019val114 (tense: "congiuntivo-passato") + metaattr014val060 (person: "prima-persona") + metaattr012val054 (number: "singolare") + metaattr022val108 (verb_form_type: "compound") | (that) I have gone |
| 1348 | sia andato | metaattr010val055 (mood: "congiuntivo") + metaattr019val114 (tense: "congiuntivo-passato") + metaattr014val061 (person: "seconda-persona") + metaattr012val054 (number: "singolare") + metaattr022val108 (verb_form_type: "compound") | (that) you have gone |
| 1349 | sia andato | metaattr010val055 (mood: "congiuntivo") + metaattr019val114 (tense: "congiuntivo-passato") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val108 (verb_form_type: "compound") | (that) he/she has gone |
| 1350 | siamo andati | metaattr010val055 (mood: "congiuntivo") + metaattr019val114 (tense: "congiuntivo-passato") + metaattr014val060 (person: "prima-persona") + metaattr012val055 (number: "plurale") + metaattr022val108 (verb_form_type: "compound") | (that) we have gone |
| 1351 | siate andati | metaattr010val055 (mood: "congiuntivo") + metaattr019val114 (tense: "congiuntivo-passato") + metaattr014val061 (person: "seconda-persona") + metaattr012val055 (number: "plurale") + metaattr022val108 (verb_form_type: "compound") | (that) you have gone |
| 1352 | siano andati | metaattr010val055 (mood: "congiuntivo") + metaattr019val114 (tense: "congiuntivo-passato") + metaattr014val062 (person: "terza-persona") + metaattr012val055 (number: "plurale") + metaattr022val108 (verb_form_type: "compound") | (that) they have gone |
| 1353 | fossi andato | metaattr010val055 (mood: "congiuntivo") + metaattr019val115 (tense: "congiuntivo-trapassato") + metaattr014val060 (person: "prima-persona") + metaattr012val054 (number: "singolare") + metaattr022val108 (verb_form_type: "compound") | (that) I had gone |
| 1354 | fossi andato | metaattr010val055 (mood: "congiuntivo") + metaattr019val115 (tense: "congiuntivo-trapassato") + metaattr014val061 (person: "seconda-persona") + metaattr012val054 (number: "singolare") + metaattr022val108 (verb_form_type: "compound") | (that) you had gone |
| 1355 | fosse andato | metaattr010val055 (mood: "congiuntivo") + metaattr019val115 (tense: "congiuntivo-trapassato") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val108 (verb_form_type: "compound") | (that) he/she had gone |
| 1356 | fossimo andati | metaattr010val055 (mood: "congiuntivo") + metaattr019val115 (tense: "congiuntivo-trapassato") + metaattr014val060 (person: "prima-persona") + metaattr012val055 (number: "plurale") + metaattr022val108 (verb_form_type: "compound") | (that) we had gone |
| 1357 | foste andati | metaattr010val055 (mood: "congiuntivo") + metaattr019val115 (tense: "congiuntivo-trapassato") + metaattr014val061 (person: "seconda-persona") + metaattr012val055 (number: "plurale") + metaattr022val108 (verb_form_type: "compound") | (that) you had gone |
| 1358 | fossero andati | metaattr010val055 (mood: "congiuntivo") + metaattr019val115 (tense: "congiuntivo-trapassato") + metaattr014val062 (person: "terza-persona") + metaattr012val055 (number: "plurale") + metaattr022val108 (verb_form_type: "compound") | (that) they had gone |
| 1359 | sarei andato | metaattr010val056 (mood: "condizionale") + metaattr019val116 (tense: "condizionale-passato") + metaattr014val060 (person: "prima-persona") + metaattr012val054 (number: "singolare") + metaattr022val108 (verb_form_type: "compound") | I would have gone |
| 1360 | saresti andato | metaattr010val056 (mood: "condizionale") + metaattr019val116 (tense: "condizionale-passato") + metaattr014val061 (person: "seconda-persona") + metaattr012val054 (number: "singolare") + metaattr022val108 (verb_form_type: "compound") | you would have gone |
| 1361 | sarebbe andato | metaattr010val056 (mood: "condizionale") + metaattr019val116 (tense: "condizionale-passato") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val108 (verb_form_type: "compound") | he/she would have gone |
| 1362 | saremmo andati | metaattr010val056 (mood: "condizionale") + metaattr019val116 (tense: "condizionale-passato") + metaattr014val060 (person: "prima-persona") + metaattr012val055 (number: "plurale") + metaattr022val108 (verb_form_type: "compound") | we would have gone |
| 1363 | sareste andati | metaattr010val056 (mood: "condizionale") + metaattr019val116 (tense: "condizionale-passato") + metaattr014val061 (person: "seconda-persona") + metaattr012val055 (number: "plurale") + metaattr022val108 (verb_form_type: "compound") | you would have gone |
| 1364 | sarebbero andati | metaattr010val056 (mood: "condizionale") + metaattr019val116 (tense: "condizionale-passato") + metaattr014val062 (person: "terza-persona") + metaattr012val055 (number: "plurale") + metaattr022val108 (verb_form_type: "compound") | they would have gone |
| 1365 | sii andato | metaattr010val057 (mood: "imperativo") + metaattr019val117 (tense: "imperativo-passato") + metaattr014val061 (person: "seconda-persona") + metaattr012val054 (number: "singolare") + metaattr022val108 (verb_form_type: "compound") | have gone! |
| 1366 | sia andato | metaattr010val057 (mood: "imperativo") + metaattr019val117 (tense: "imperativo-passato") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val108 (verb_form_type: "compound") | let him/her have gone! |
| 1367 | siamo andati | metaattr010val057 (mood: "imperativo") + metaattr019val117 (tense: "imperativo-passato") + metaattr014val060 (person: "prima-persona") + metaattr012val055 (number: "plurale") + metaattr022val108 (verb_form_type: "compound") | let's have gone! |
| 1368 | siate andati | metaattr010val057 (mood: "imperativo") + metaattr019val117 (tense: "imperativo-passato") + metaattr014val061 (person: "seconda-persona") + metaattr012val055 (number: "plurale") + metaattr022val108 (verb_form_type: "compound") | have gone! |
| 1369 | siano andati | metaattr010val057 (mood: "imperativo") + metaattr019val117 (tense: "imperativo-passato") + metaattr014val062 (person: "terza-persona") + metaattr012val055 (number: "plurale") + metaattr022val108 (verb_form_type: "compound") | let them have gone! |
| 1370 | essendo andato | metaattr010val060 (mood: "gerundio") + metaattr019val118 (tense: "gerundio-passato")  + metaattr022val108 (verb_form_type: "compound") | having gone |
| 1371 | essere andato | metaattr010val058 (mood: "infinito") + metaattr019val119 (tense: "infinito-passato")  + metaattr022val108 (verb_form_type: "compound") | to have gone |

### Progressive Forms with stare auxiliary (37 forms)

| Form ID | Form Text | Entity Meta Values | Translation Coverage |
|---------|-----------|-----------|---------------------|
| 1372 | sto andando | metaattr010val054 (mood: "indicativo") + metaattr019val120 (tense: "presente-progressivo") + metaattr014val060 (person: "prima-persona") + metaattr012val054 (number: "singolare") + metaattr022val109 (verb_form_type: "progressive") | I am going |
| 1373 | stai andando | metaattr010val054 (mood: "indicativo") + metaattr019val120 (tense: "presente-progressivo") + metaattr014val061 (person: "seconda-persona") + metaattr012val054 (number: "singolare") + metaattr022val109 (verb_form_type: "progressive") | you are going |
| 1374 | sta andando | metaattr010val054 (mood: "indicativo") + metaattr019val120 (tense: "presente-progressivo") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val109 (verb_form_type: "progressive") | he/she is going |
| 1375 | stiamo andando | metaattr010val054 (mood: "indicativo") + metaattr019val120 (tense: "presente-progressivo") + metaattr014val060 (person: "prima-persona") + metaattr012val055 (number: "plurale") + metaattr022val109 (verb_form_type: "progressive") | we are going |
| 1376 | state andando | metaattr010val054 (mood: "indicativo") + metaattr019val120 (tense: "presente-progressivo") + metaattr014val061 (person: "seconda-persona") + metaattr012val055 (number: "plurale") + metaattr022val109 (verb_form_type: "progressive") | you are going |
| 1377 | stanno andando | metaattr010val054 (mood: "indicativo") + metaattr019val120 (tense: "presente-progressivo") + metaattr014val062 (person: "terza-persona") + metaattr012val055 (number: "plurale") + metaattr022val109 (verb_form_type: "progressive") | they are going |
| 1378 | stavo andando | metaattr010val054 (mood: "indicativo") + metaattr019val121 (tense: "passato-progressivo") + metaattr014val060 (person: "prima-persona") + metaattr012val054 (number: "singolare") + metaattr022val109 (verb_form_type: "progressive") | I was going |
| 1379 | stavi andando | metaattr010val054 (mood: "indicativo") + metaattr019val121 (tense: "passato-progressivo") + metaattr014val061 (person: "seconda-persona") + metaattr012val054 (number: "singolare") + metaattr022val109 (verb_form_type: "progressive") | you were going |
| 1380 | stava andando | metaattr010val054 (mood: "indicativo") + metaattr019val121 (tense: "passato-progressivo") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val109 (verb_form_type: "progressive") | he/she was going |
| 1381 | stavamo andando | metaattr010val054 (mood: "indicativo") + metaattr019val121 (tense: "passato-progressivo") + metaattr014val060 (person: "prima-persona") + metaattr012val055 (number: "plurale") + metaattr022val109 (verb_form_type: "progressive") | we were going |
| 1382 | stavate andando | metaattr010val054 (mood: "indicativo") + metaattr019val121 (tense: "passato-progressivo") + metaattr014val061 (person: "seconda-persona") + metaattr012val055 (number: "plurale") + metaattr022val109 (verb_form_type: "progressive") | you were going |
| 1383 | stavano andando | metaattr010val054 (mood: "indicativo") + metaattr019val121 (tense: "passato-progressivo") + metaattr014val062 (person: "terza-persona") + metaattr012val055 (number: "plurale") + metaattr022val109 (verb_form_type: "progressive") | they were going |
| 1384 | starò andando | metaattr010val054 (mood: "indicativo") + metaattr019val122 (tense: "futuro-progressivo") + metaattr014val060 (person: "prima-persona") + metaattr012val054 (number: "singolare") + metaattr022val109 (verb_form_type: "progressive") | I will be going |
| 1385 | starai andando | metaattr010val054 (mood: "indicativo") + metaattr019val122 (tense: "futuro-progressivo") + metaattr014val061 (person: "seconda-persona") + metaattr012val054 (number: "singolare") + metaattr022val109 (verb_form_type: "progressive") | you will be going |
| 1386 | starà andando | metaattr010val054 (mood: "indicativo") + metaattr019val122 (tense: "futuro-progressivo") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val109 (verb_form_type: "progressive") | he/she will be going |
| 1387 | staremo andando | metaattr010val054 (mood: "indicativo") + metaattr019val122 (tense: "futuro-progressivo") + metaattr014val060 (person: "prima-persona") + metaattr012val055 (number: "plurale") + metaattr022val109 (verb_form_type: "progressive") | we will be going |
| 1388 | starete andando | metaattr010val054 (mood: "indicativo") + metaattr019val122 (tense: "futuro-progressivo") + metaattr014val061 (person: "seconda-persona") + metaattr012val055 (number: "plurale") + metaattr022val109 (verb_form_type: "progressive") | you will be going |
| 1389 | staranno andando | metaattr010val054 (mood: "indicativo") + metaattr019val122 (tense: "futuro-progressivo") + metaattr014val062 (person: "terza-persona") + metaattr012val055 (number: "plurale") + metaattr022val109 (verb_form_type: "progressive") | they will be going |
| 1390 | stia andando | metaattr010val055 (mood: "congiuntivo") + metaattr019val123 (tense: "congiuntivo-presente-progressivo") + metaattr014val060 (person: "prima-persona") + metaattr012val054 (number: "singolare") + metaattr022val109 (verb_form_type: "progressive") | (that) I be going |
| 1391 | stia andando | metaattr010val055 (mood: "congiuntivo") + metaattr019val123 (tense: "congiuntivo-presente-progressivo") + metaattr014val061 (person: "seconda-persona") + metaattr012val054 (number: "singolare") + metaattr022val109 (verb_form_type: "progressive") | (that) you be going |
| 1392 | stia andando | metaattr010val055 (mood: "congiuntivo") + metaattr019val123 (tense: "congiuntivo-presente-progressivo") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val109 (verb_form_type: "progressive") | (that) he/she be going |
| 1393 | stiamo andando | metaattr010val055 (mood: "congiuntivo") + metaattr019val123 (tense: "congiuntivo-presente-progressivo") + metaattr014val060 (person: "prima-persona") + metaattr012val055 (number: "plurale") + metaattr022val109 (verb_form_type: "progressive") | (that) we be going |
| 1394 | stiate andando | metaattr010val055 (mood: "congiuntivo") + metaattr019val123 (tense: "congiuntivo-presente-progressivo") + metaattr014val061 (person: "seconda-persona") + metaattr012val055 (number: "plurale") + metaattr022val109 (verb_form_type: "progressive") | (that) you be going |
| 1395 | stiano andando | metaattr010val055 (mood: "congiuntivo") + metaattr019val123 (tense: "congiuntivo-presente-progressivo") + metaattr014val062 (person: "terza-persona") + metaattr012val055 (number: "plurale") + metaattr022val109 (verb_form_type: "progressive") | (that) they be going |
| 1396 | stessi andando | metaattr010val055 (mood: "congiuntivo") + metaattr019val124 (tense: "congiuntivo-imperfetto-progressivo") + metaattr014val060 (person: "prima-persona") + metaattr012val054 (number: "singolare") + metaattr022val109 (verb_form_type: "progressive") | (that) I were going |
| 1397 | stessi andando | metaattr010val055 (mood: "congiuntivo") + metaattr019val124 (tense: "congiuntivo-imperfetto-progressivo") + metaattr014val061 (person: "seconda-persona") + metaattr012val054 (number: "singolare") + metaattr022val109 (verb_form_type: "progressive") | (that) you were going |
| 1398 | stesse andando | metaattr010val055 (mood: "congiuntivo") + metaattr019val124 (tense: "congiuntivo-imperfetto-progressivo") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val109 (verb_form_type: "progressive") | (that) he/she were going |
| 1399 | stessimo andando | metaattr010val055 (mood: "congiuntivo") + metaattr019val124 (tense: "congiuntivo-imperfetto-progressivo") + metaattr014val060 (person: "prima-persona") + metaattr012val055 (number: "plurale") + metaattr022val109 (verb_form_type: "progressive") | (that) we were going |
| 1400 | steste andando | metaattr010val055 (mood: "congiuntivo") + metaattr019val124 (tense: "congiuntivo-imperfetto-progressivo") + metaattr014val061 (person: "seconda-persona") + metaattr012val055 (number: "plurale") + metaattr022val109 (verb_form_type: "progressive") | (that) you were going |
| 1401 | stessero andando | metaattr010val055 (mood: "congiuntivo") + metaattr019val124 (tense: "congiuntivo-imperfetto-progressivo") + metaattr014val062 (person: "terza-persona") + metaattr012val055 (number: "plurale") + metaattr022val109 (verb_form_type: "progressive") | (that) they were going |
| 1402 | starei andando | metaattr010val056 (mood: "condizionale") + metaattr019val125 (tense: "condizionale-progressivo") + metaattr014val060 (person: "prima-persona") + metaattr012val054 (number: "singolare") + metaattr022val109 (verb_form_type: "progressive") | I would be going |
| 1403 | staresti andando | metaattr010val056 (mood: "condizionale") + metaattr019val125 (tense: "condizionale-progressivo") + metaattr014val061 (person: "seconda-persona") + metaattr012val054 (number: "singolare") + metaattr022val109 (verb_form_type: "progressive") | you would be going |
| 1404 | starebbe andando | metaattr010val056 (mood: "condizionale") + metaattr019val125 (tense: "condizionale-progressivo") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val109 (verb_form_type: "progressive") | he/she would be going |
| 1405 | staremmo andando | metaattr010val056 (mood: "condizionale") + metaattr019val125 (tense: "condizionale-progressivo") + metaattr014val060 (person: "prima-persona") + metaattr012val055 (number: "plurale") + metaattr022val109 (verb_form_type: "progressive") | we would be going |
| 1406 | stareste andando | metaattr010val056 (mood: "condizionale") + metaattr019val125 (tense: "condizionale-progressivo") + metaattr014val061 (person: "seconda-persona") + metaattr012val055 (number: "plurale") + metaattr022val109 (verb_form_type: "progressive") | you would be going |
| 1407 | starebbero andando | metaattr010val056 (mood: "condizionale") + metaattr019val125 (tense: "condizionale-progressivo") + metaattr014val062 (person: "terza-persona") + metaattr012val055 (number: "plurale") + metaattr022val109 (verb_form_type: "progressive") | they would be going |
| 1408 | stando andando | metaattr010val060 (mood: "gerundio") + metaattr019val126 (tense: "gerundio-progressivo")  + metaattr022val109 (verb_form_type: "progressive") | being going |

## Form_Translations Coverage

**Complete Coverage**: All 137 forms link to the single "to go" translation with no restrictions. This demonstrates the standard intransitive verb pattern where all forms are semantically valid and accessible.

## Architectural Significance

Section 8.7 establishes the architectural pattern for irregular verbs in the Misti system:

1. **Form-Level Irregularity Marking**: Only truly irregular forms receive the metaattr005val066 (irregularity: "irregular") attribute at form level
2. **Pattern Consistency**: Regular patterns within irregular verbs follow standard metavalue structures
3. **Auxiliary Specification**: essere auxiliary properly specified at translation level for motion verbs
4. **Complete Form Generation**: Every grammatically possible form exists, with appropriate irregularity markers
5. **Architectural Rule**: Irregularity is a form-level property, not translation-level - irregular forms are marked individually

This complete inventory demonstrates how the existing attribute system handles irregular verbs by marking individual irregular forms rather than classifying the entire verb as irregular at the translation level.