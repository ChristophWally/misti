# Section 8.7: Weather Verb "piovere" (to rain) - Complete Form Inventory

## Overview
This section provides a comprehensive form inventory showing EVERY form and form_translation for the weather verb "piovere" in the Misti system. This demonstrates weather verb architecture with semantic constraints, showing how meteorological phenomena verbs function with limited personal subjects.

**Total Forms**: 67 (limited due to weather verb restrictions)

## Dictionary Entry
```sql
-- dictionary table
id: 990e8400-e29b-41d4-a716-446655440006
lemma: "piovere"
word_type: "verb"
```

## Word-Level Metadata (via entity_meta_values)
```sql
-- entity_type='word', entity_id=990e8400-e29b-41d4-a716-446655440006
value_id → meta_values.value: "ere-conjugation"    (conjugation_type)
value_id → meta_values.value: "freq-top1000"       (frequency_tier)
value_id → meta_values.value: "CEFR-A2"           (cefr_level)
value_id → meta_values.value: "weather"           (verb_type)
```

## Translation: "to rain" (primary meaning)
```sql
-- word_translations table
id: 770e8400-e29b-41d4-a716-446655440007
word_id: 990e8400-e29b-41d4-a716-446655440006
translation: "to rain"
display_priority: 1

-- entity_meta_values for this translation
-- entity_type='word_translation', entity_id=770e8400-e29b-41d4-a716-446655440007
value_id → metaattr002val015 (auxiliary: "essere")
value_id → metaattr021val127 (verb_type: "weather")
```

## Complete Form Inventory (67 Total Forms)

### Metadata Architecture
All forms use the consolidated Entity Meta Values architecture:
- **Mood**: metaattr010val054 (indicativo), metaattr010val055 (congiuntivo), metaattr010val056 (condizionale), metaattr010val057 (imperativo), metaattr010val058 (infinito), metaattr010val059 (participio), metaattr010val060 (gerundio)
- **Tense**: metaattr019val096 (presente), metaattr019val097 (imperfetto), metaattr019val098 (passato-remoto), metaattr019val099 (futuro-semplice), etc.
- **Person**: metaattr014val060 (prima-persona), metaattr014val061 (seconda-persona), metaattr014val062 (terza-persona), metaattr014val063 (none)
- **Number**: metaattr012val054 (singolare), metaattr012val055 (plurale), metaattr012val056 (none)
- **Verb Form Type**: metaattr022val107 (simple), metaattr022val108 (compound), metaattr022val109 (progressive)
- **Weather Constraints**: metaattr021val127 (verb_type: "weather"), metaattr013val130 (restriction: "impersonal-weather")

### Simple Forms (21 forms)

| Form ID | Form Text | Entity Meta Values | Translation Coverage |
|---------|-----------|-----------|---------------------|
| 1205 | piove | metaattr010val054 (mood: "indicativo") + metaattr019val096 (tense: "presente") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple") + metaattr021val127 (verb_type: "weather") + metaattr013val130 (restriction: "impersonal-weather") | it rains |
| 1206 | pioveva | metaattr010val054 (mood: "indicativo") + metaattr019val097 (tense: "imperfetto") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple") + metaattr021val127 (verb_type: "weather") + metaattr013val130 (restriction: "impersonal-weather") | it was raining |
| 1207 | piovve | metaattr010val054 (mood: "indicativo") + metaattr019val098 (tense: "passato-remoto") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple") + metaattr021val127 (verb_type: "weather") + metaattr013val130 (restriction: "impersonal-weather") | it rained |
| 1208 | pioverà | metaattr010val054 (mood: "indicativo") + metaattr019val099 (tense: "futuro-semplice") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple") + metaattr021val127 (verb_type: "weather") + metaattr013val130 (restriction: "impersonal-weather") | it will rain |
| 1209 | piova | metaattr010val055 (mood: "congiuntivo") + metaattr019val102 (tense: "congiuntivo-presente") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple") + metaattr021val127 (verb_type: "weather") + metaattr013val130 (restriction: "impersonal-weather") | (that) it rain |
| 1210 | piovesse | metaattr010val055 (mood: "congiuntivo") + metaattr019val103 (tense: "congiuntivo-imperfetto") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple") + metaattr021val127 (verb_type: "weather") + metaattr013val130 (restriction: "impersonal-weather") | (that) it rained |
| 1211 | pioverebbe | metaattr010val056 (mood: "condizionale") + metaattr019val104 (tense: "condizionale-presente") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple") + metaattr021val127 (verb_type: "weather") + metaattr013val130 (restriction: "impersonal-weather") | it would rain |
| 1212 | piovere | metaattr010val058 (mood: "infinito") + metaattr019val106 (tense: "infinito-presente") + metaattr014val063 (person: "none") + metaattr012val056 (number: "none") + metaattr022val107 (verb_form_type: "simple") + metaattr021val127 (verb_type: "weather") | to rain |
| 1213 | piovente | metaattr010val059 (mood: "participio") + metaattr019val107 (tense: "participio-presente") + metaattr014val063 (person: "none") + metaattr012val056 (number: "none") + metaattr022val107 (verb_form_type: "simple") + metaattr021val127 (verb_type: "weather") | raining |
| 1214 | piovuto | metaattr010val059 (mood: "participio") + metaattr019val108 (tense: "participio-passato") + metaattr014val063 (person: "none") + metaattr012val056 (number: "none") + metaattr022val107 (verb_form_type: "simple") + metaattr021val127 (verb_type: "weather") | rained |
| 1215 | piovendo | metaattr010val060 (mood: "gerundio") + metaattr019val109 (tense: "gerundio-presente") + metaattr014val063 (person: "none") + metaattr012val056 (number: "none") + metaattr022val107 (verb_form_type: "simple") + metaattr021val127 (verb_type: "weather") | raining |
| 1216 | piovo | metaattr010val054 (mood: "indicativo") + metaattr019val096 (tense: "presente") + metaattr014val060 (person: "prima-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple") + metaattr021val127 (verb_type: "weather") | I rain down |
| 1217 | piovi | metaattr010val054 (mood: "indicativo") + metaattr019val096 (tense: "presente") + metaattr014val061 (person: "seconda-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple") + metaattr021val127 (verb_type: "weather") | you rain down |
| 1218 | pioviamo | metaattr010val054 (mood: "indicativo") + metaattr019val096 (tense: "presente") + metaattr014val060 (person: "prima-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple") + metaattr021val127 (verb_type: "weather") | we rain down |
| 1219 | piovete | metaattr010val054 (mood: "indicativo") + metaattr019val096 (tense: "presente") + metaattr014val061 (person: "seconda-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple") + metaattr021val127 (verb_type: "weather") | you rain down |
| 1220 | piovono | metaattr010val054 (mood: "indicativo") + metaattr019val096 (tense: "presente") + metaattr014val062 (person: "terza-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple") + metaattr021val127 (verb_type: "weather") | they rain down |
| 1221 | piovevo | metaattr010val054 (mood: "indicativo") + metaattr019val097 (tense: "imperfetto") + metaattr014val060 (person: "prima-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple") + metaattr021val127 (verb_type: "weather") | I was raining down |
| 1222 | piovevi | metaattr010val054 (mood: "indicativo") + metaattr019val097 (tense: "imperfetto") + metaattr014val061 (person: "seconda-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple") + metaattr021val127 (verb_type: "weather") | you were raining down |
| 1223 | piovevamo | metaattr010val054 (mood: "indicativo") + metaattr019val097 (tense: "imperfetto") + metaattr014val060 (person: "prima-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple") + metaattr021val127 (verb_type: "weather") | we were raining down |
| 1224 | piovevate | metaattr010val054 (mood: "indicativo") + metaattr019val097 (tense: "imperfetto") + metaattr014val061 (person: "seconda-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple") + metaattr021val127 (verb_type: "weather") | you were raining down |
| 1225 | piovevano | metaattr010val054 (mood: "indicativo") + metaattr019val097 (tense: "imperfetto") + metaattr014val062 (person: "terza-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple") + metaattr021val127 (verb_type: "weather") | they were raining down |

### Compound Forms with essere auxiliary (23 forms)

| Form ID | Form Text | Entity Meta Values | Translation Coverage |
|---------|-----------|-----------|---------------------|
| 1226 | è piovuto | metaattr010val054 (mood: "indicativo") + metaattr019val110 (tense: "passato-prossimo") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val108 (verb_form_type: "compound") + metaattr021val127 (verb_type: "weather") + metaattr013val130 (restriction: "impersonal-weather") | it has rained |
| 1227 | era piovuto | metaattr010val054 (mood: "indicativo") + metaattr019val111 (tense: "trapassato-prossimo") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val108 (verb_form_type: "compound") + metaattr021val127 (verb_type: "weather") + metaattr013val130 (restriction: "impersonal-weather") | it had rained |
| 1228 | fu piovuto | metaattr010val054 (mood: "indicativo") + metaattr019val112 (tense: "trapassato-remoto") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val108 (verb_form_type: "compound") + metaattr021val127 (verb_type: "weather") + metaattr013val130 (restriction: "impersonal-weather") | it had rained |
| 1229 | sarà piovuto | metaattr010val054 (mood: "indicativo") + metaattr019val113 (tense: "futuro-anteriore") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val108 (verb_form_type: "compound") + metaattr021val127 (verb_type: "weather") + metaattr013val130 (restriction: "impersonal-weather") | it will have rained |
| 1230 | sia piovuto | metaattr010val055 (mood: "congiuntivo") + metaattr019val114 (tense: "congiuntivo-passato") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val108 (verb_form_type: "compound") + metaattr021val127 (verb_type: "weather") + metaattr013val130 (restriction: "impersonal-weather") | (that) it has rained |
| 1231 | fosse piovuto | metaattr010val055 (mood: "congiuntivo") + metaattr019val115 (tense: "congiuntivo-trapassato") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val108 (verb_form_type: "compound") + metaattr021val127 (verb_type: "weather") + metaattr013val130 (restriction: "impersonal-weather") | (that) it had rained |
| 1232 | sarebbe piovuto | metaattr010val056 (mood: "condizionale") + metaattr019val116 (tense: "condizionale-passato") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val108 (verb_form_type: "compound") + metaattr021val127 (verb_type: "weather") + metaattr013val130 (restriction: "impersonal-weather") | it would have rained |
| 1233 | essere piovuto | metaattr010val058 (mood: "infinito") + metaattr019val119 (tense: "infinito-passato") + metaattr014val063 (person: "none") + metaattr012val056 (number: "none") + metaattr022val108 (verb_form_type: "compound") + metaattr021val127 (verb_type: "weather") | to have rained |
| 1234 | essendo piovuto | metaattr010val060 (mood: "gerundio") + metaattr019val118 (tense: "gerundio-passato") + metaattr014val063 (person: "none") + metaattr012val056 (number: "none") + metaattr022val108 (verb_form_type: "compound") + metaattr021val127 (verb_type: "weather") | having rained |
| 1235 | sono piovuto/a | metaattr010val054 (mood: "indicativo") + metaattr019val110 (tense: "passato-prossimo") + metaattr014val060 (person: "prima-persona") + metaattr012val054 (number: "singolare") + metaattr022val108 (verb_form_type: "compound") + metaattr021val127 (verb_type: "weather") | I have rained down |
| 1236 | sei piovuto/a | metaattr010val054 (mood: "indicativo") + metaattr019val110 (tense: "passato-prossimo") + metaattr014val061 (person: "seconda-persona") + metaattr012val054 (number: "singolare") + metaattr022val108 (verb_form_type: "compound") + metaattr021val127 (verb_type: "weather") | you have rained down |
| 1237 | siamo piovuti/e | metaattr010val054 (mood: "indicativo") + metaattr019val110 (tense: "passato-prossimo") + metaattr014val060 (person: "prima-persona") + metaattr012val055 (number: "plurale") + metaattr022val108 (verb_form_type: "compound") + metaattr021val127 (verb_type: "weather") | we have rained down |
| 1238 | siete piovuti/e | metaattr010val054 (mood: "indicativo") + metaattr019val110 (tense: "passato-prossimo") + metaattr014val061 (person: "seconda-persona") + metaattr012val055 (number: "plurale") + metaattr022val108 (verb_form_type: "compound") + metaattr021val127 (verb_type: "weather") | you have rained down |
| 1239 | sono piovuti | metaattr010val054 (mood: "indicativo") + metaattr019val110 (tense: "passato-prossimo") + metaattr014val062 (person: "terza-persona") + metaattr012val055 (number: "plurale") + metaattr022val108 (verb_form_type: "compound") + metaattr021val127 (verb_type: "weather") | they have rained down |
| 1240 | ero piovuto/a | metaattr010val054 (mood: "indicativo") + metaattr019val111 (tense: "trapassato-prossimo") + metaattr014val060 (person: "prima-persona") + metaattr012val054 (number: "singolare") + metaattr022val108 (verb_form_type: "compound") + metaattr021val127 (verb_type: "weather") | I had rained down |
| 1241 | eri piovuto/a | metaattr010val054 (mood: "indicativo") + metaattr019val111 (tense: "trapassato-prossimo") + metaattr014val061 (person: "seconda-persona") + metaattr012val054 (number: "singolare") + metaattr022val108 (verb_form_type: "compound") + metaattr021val127 (verb_type: "weather") | you had rained down |
| 1242 | eravamo piovuti/e | metaattr010val054 (mood: "indicativo") + metaattr019val111 (tense: "trapassato-prossimo") + metaattr014val060 (person: "prima-persona") + metaattr012val055 (number: "plurale") + metaattr022val108 (verb_form_type: "compound") + metaattr021val127 (verb_type: "weather") | we had rained down |
| 1243 | eravate piovuti/e | metaattr010val054 (mood: "indicativo") + metaattr019val111 (tense: "trapassato-prossimo") + metaattr014val061 (person: "seconda-persona") + metaattr012val055 (number: "plurale") + metaattr022val108 (verb_form_type: "compound") + metaattr021val127 (verb_type: "weather") | you had rained down |
| 1244 | erano piovuti | metaattr010val054 (mood: "indicativo") + metaattr019val111 (tense: "trapassato-prossimo") + metaattr014val062 (person: "terza-persona") + metaattr012val055 (number: "plurale") + metaattr022val108 (verb_form_type: "compound") + metaattr021val127 (verb_type: "weather") | they had rained down |
| 1245 | sarò piovuto/a | metaattr010val054 (mood: "indicativo") + metaattr019val113 (tense: "futuro-anteriore") + metaattr014val060 (person: "prima-persona") + metaattr012val054 (number: "singolare") + metaattr022val108 (verb_form_type: "compound") + metaattr021val127 (verb_type: "weather") | I will have rained down |
| 1246 | sarai piovuto/a | metaattr010val054 (mood: "indicativo") + metaattr019val113 (tense: "futuro-anteriore") + metaattr014val061 (person: "seconda-persona") + metaattr012val054 (number: "singolare") + metaattr022val108 (verb_form_type: "compound") + metaattr021val127 (verb_type: "weather") | you will have rained down |
| 1247 | saremo piovuti/e | metaattr010val054 (mood: "indicativo") + metaattr019val113 (tense: "futuro-anteriore") + metaattr014val060 (person: "prima-persona") + metaattr012val055 (number: "plurale") + metaattr022val108 (verb_form_type: "compound") + metaattr021val127 (verb_type: "weather") | we will have rained down |
| 1248 | sarete piovuti/e | metaattr010val054 (mood: "indicativo") + metaattr019val113 (tense: "futuro-anteriore") + metaattr014val061 (person: "seconda-persona") + metaattr012val055 (number: "plurale") + metaattr022val108 (verb_form_type: "compound") + metaattr021val127 (verb_type: "weather") | you will have rained down |

### Progressive Forms with stare auxiliary (23 forms)

| Form ID | Form Text | Entity Meta Values | Translation Coverage |
|---------|-----------|-----------|---------------------|
| 1249 | sta piovendo | metaattr010val054 (mood: "indicativo") + metaattr019val120 (tense: "presente-progressivo") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val109 (verb_form_type: "progressive") + metaattr021val127 (verb_type: "weather") + metaattr013val130 (restriction: "impersonal-weather") | it is raining |
| 1250 | stava piovendo | metaattr010val054 (mood: "indicativo") + metaattr019val121 (tense: "passato-progressivo") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val109 (verb_form_type: "progressive") + metaattr021val127 (verb_type: "weather") + metaattr013val130 (restriction: "impersonal-weather") | it was raining |
| 1251 | starà piovendo | metaattr010val054 (mood: "indicativo") + metaattr019val122 (tense: "futuro-progressivo") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val109 (verb_form_type: "progressive") + metaattr021val127 (verb_type: "weather") + metaattr013val130 (restriction: "impersonal-weather") | it will be raining |
| 1252 | stia piovendo | metaattr010val055 (mood: "congiuntivo") + metaattr019val123 (tense: "congiuntivo-presente-progressivo") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val109 (verb_form_type: "progressive") + metaattr021val127 (verb_type: "weather") + metaattr013val130 (restriction: "impersonal-weather") | (that) it be raining |
| 1253 | stesse piovendo | metaattr010val055 (mood: "congiuntivo") + metaattr019val124 (tense: "congiuntivo-imperfetto-progressivo") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val109 (verb_form_type: "progressive") + metaattr021val127 (verb_type: "weather") + metaattr013val130 (restriction: "impersonal-weather") | (that) it were raining |
| 1254 | starebbe piovendo | metaattr010val056 (mood: "condizionale") + metaattr019val125 (tense: "condizionale-progressivo") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val109 (verb_form_type: "progressive") + metaattr021val127 (verb_type: "weather") + metaattr013val130 (restriction: "impersonal-weather") | it would be raining |
| 1255 | stando piovendo | metaattr010val060 (mood: "gerundio") + metaattr019val126 (tense: "gerundio-progressivo") + metaattr014val063 (person: "none") + metaattr012val056 (number: "none") + metaattr022val109 (verb_form_type: "progressive") + metaattr021val127 (verb_type: "weather") | being raining |
| 1256 | sto piovendo | metaattr010val054 (mood: "indicativo") + metaattr019val120 (tense: "presente-progressivo") + metaattr014val060 (person: "prima-persona") + metaattr012val054 (number: "singolare") + metaattr022val109 (verb_form_type: "progressive") + metaattr021val127 (verb_type: "weather") | I am raining down |
| 1257 | stai piovendo | metaattr010val054 (mood: "indicativo") + metaattr019val120 (tense: "presente-progressivo") + metaattr014val061 (person: "seconda-persona") + metaattr012val054 (number: "singolare") + metaattr022val109 (verb_form_type: "progressive") + metaattr021val127 (verb_type: "weather") | you are raining down |
| 1258 | stiamo piovendo | metaattr010val054 (mood: "indicativo") + metaattr019val120 (tense: "presente-progressivo") + metaattr014val060 (person: "prima-persona") + metaattr012val055 (number: "plurale") + metaattr022val109 (verb_form_type: "progressive") + metaattr021val127 (verb_type: "weather") | we are raining down |
| 1259 | state piovendo | metaattr010val054 (mood: "indicativo") + metaattr019val120 (tense: "presente-progressivo") + metaattr014val061 (person: "seconda-persona") + metaattr012val055 (number: "plurale") + metaattr022val109 (verb_form_type: "progressive") + metaattr021val127 (verb_type: "weather") | you are raining down |
| 1260 | stanno piovendo | metaattr010val054 (mood: "indicativo") + metaattr019val120 (tense: "presente-progressivo") + metaattr014val062 (person: "terza-persona") + metaattr012val055 (number: "plurale") + metaattr022val109 (verb_form_type: "progressive") + metaattr021val127 (verb_type: "weather") | they are raining down |
| 1261 | stavo piovendo | metaattr010val054 (mood: "indicativo") + metaattr019val121 (tense: "passato-progressivo") + metaattr014val060 (person: "prima-persona") + metaattr012val054 (number: "singolare") + metaattr022val109 (verb_form_type: "progressive") + metaattr021val127 (verb_type: "weather") | I was raining down |
| 1262 | stavi piovendo | metaattr010val054 (mood: "indicativo") + metaattr019val121 (tense: "passato-progressivo") + metaattr014val061 (person: "seconda-persona") + metaattr012val054 (number: "singolare") + metaattr022val109 (verb_form_type: "progressive") + metaattr021val127 (verb_type: "weather") | you were raining down |
| 1263 | stavamo piovendo | metaattr010val054 (mood: "indicativo") + metaattr019val121 (tense: "passato-progressivo") + metaattr014val060 (person: "prima-persona") + metaattr012val055 (number: "plurale") + metaattr022val109 (verb_form_type: "progressive") + metaattr021val127 (verb_type: "weather") | we were raining down |
| 1264 | stavate piovendo | metaattr010val054 (mood: "indicativo") + metaattr019val121 (tense: "passato-progressivo") + metaattr014val061 (person: "seconda-persona") + metaattr012val055 (number: "plurale") + metaattr022val109 (verb_form_type: "progressive") + metaattr021val127 (verb_type: "weather") | you were raining down |
| 1265 | stavano piovendo | metaattr010val054 (mood: "indicativo") + metaattr019val121 (tense: "passato-progressivo") + metaattr014val062 (person: "terza-persona") + metaattr012val055 (number: "plurale") + metaattr022val109 (verb_form_type: "progressive") + metaattr021val127 (verb_type: "weather") | they were raining down |
| 1266 | starò piovendo | metaattr010val054 (mood: "indicativo") + metaattr019val122 (tense: "futuro-progressivo") + metaattr014val060 (person: "prima-persona") + metaattr012val054 (number: "singolare") + metaattr022val109 (verb_form_type: "progressive") + metaattr021val127 (verb_type: "weather") | I will be raining down |
| 1267 | starai piovendo | metaattr010val054 (mood: "indicativo") + metaattr019val122 (tense: "futuro-progressivo") + metaattr014val061 (person: "seconda-persona") + metaattr012val054 (number: "singolare") + metaattr022val109 (verb_form_type: "progressive") + metaattr021val127 (verb_type: "weather") | you will be raining down |
| 1268 | staremo piovendo | metaattr010val054 (mood: "indicativo") + metaattr019val122 (tense: "futuro-progressivo") + metaattr014val060 (person: "prima-persona") + metaattr012val055 (number: "plurale") + metaattr022val109 (verb_form_type: "progressive") + metaattr021val127 (verb_type: "weather") | we will be raining down |
| 1269 | starete piovendo | metaattr010val054 (mood: "indicativo") + metaattr019val122 (tense: "futuro-progressivo") + metaattr014val061 (person: "seconda-persona") + metaattr012val055 (number: "plurale") + metaattr022val109 (verb_form_type: "progressive") + metaattr021val127 (verb_type: "weather") | you will be raining down |
| 1270 | staranno piovendo | metaattr010val054 (mood: "indicativo") + metaattr019val122 (tense: "futuro-progressivo") + metaattr014val062 (person: "terza-persona") + metaattr012val055 (number: "plurale") + metaattr022val109 (verb_form_type: "progressive") + metaattr021val127 (verb_type: "weather") | they will be raining down |
| 1271 | starei piovendo | metaattr010val056 (mood: "condizionale") + metaattr019val125 (tense: "condizionale-progressivo") + metaattr014val060 (person: "prima-persona") + metaattr012val054 (number: "singolare") + metaattr022val109 (verb_form_type: "progressive") + metaattr021val127 (verb_type: "weather") | I would be raining down |

## Missing Forms Documentation

### No Passato Remoto Personal Forms
Weather verbs typically exclude passato remoto in first and second person as meteorological events are not associated with personal agency in historical narrative contexts.

### No Past Remote Compound Forms
Forms like "ebbi piovuto" (first person) are excluded as they conflict with the impersonal nature of weather phenomena.

### Limited Imperative Forms
Weather verbs have highly restricted imperative usage, limited to:
- "che piova!" (let it rain!) - subjunctive form used imperatively
- No second person imperatives for literal weather meaning

### No Plural Forms in Core Weather Usage
Primary meteorological usage (metaattr013val130) is strictly third person singular. Plural forms exist only for metaphorical extensions (non-weather meanings).

## Form_Translations Coverage

**Selective Coverage**: Only 67 forms due to weather verb constraints. Primary forms (marked with metaattr013val130) cover literal meteorological meaning "it rains". Extended forms support metaphorical "rain down" meaning with personal subjects.

## Architectural Significance

Section 8.7 demonstrates weather verb architecture showing how semantic constraints limit form availability:

1. **Restricted Form Generation**: Not all grammatically possible forms exist due to semantic incompatibility
2. **Constraint-Based Metadata**: metaattr013val130 marks core impersonal weather usage
3. **Auxiliary Restrictions**: Weather verbs use only "essere" auxiliary (never "avere")
4. **Semantic Layering**: Supports both literal weather and metaphorical "rain down" meanings
5. **Natural Limitations**: Shows how real-world semantics constrain database architecture

This weather verb pattern serves as the template for all meteorological verbs (nevicare, grandinare, etc.) in the Misti system.