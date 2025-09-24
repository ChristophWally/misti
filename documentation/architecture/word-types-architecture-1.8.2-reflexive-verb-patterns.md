> **Part of**: [Misti Verb Forms System Architecture](./word-types-architecture-1-verbs.md)
> **Section**: 8.2 - Reflexive Verb Patterns
> **Example Verb**: "lavarsi" (to wash oneself/each other)

---

# Reflexive Verb Patterns: "lavarsi" (to wash oneself/each other) - Complete Form Inventory

## Overview
This section provides a comprehensive form inventory showing EVERY form and form_translation for the reflexive verb "lavarsi" in the Misti system. This demonstrates reflexive clitic integration, dual translation patterns, and architectural patterns for reflexive Italian verbs.

**Total Forms**: 137 (51 simple + 49 compound + 37 progressive)  
**Key Feature**: Integrated reflexive pronouns (mi, ti, si, ci, vi, si) in all forms
**Dual Translations**: "to wash oneself" (singular/plural) + "to wash each other" (plural only)

## Dictionary Entry
```sql
-- dictionary table
id: 770e8400-e29b-41d4-a716-446655440000
lemma: "lavarsi"
word_type: "verb"
```

## Word-Level Metadata (via entity_meta_values)
```sql
-- entity_type='word', entity_id=770e8400-e29b-41d4-a716-446655440000
value_id → meta_values.value: "are-conjugation"  (conjugation_type)
value_id → meta_values.value: "direct-reflexive" (verb_type)
value_id → meta_values.value: "intransitive"     (transitivity)
value_id → meta_values.value: "freq-top200"      (frequency_tier)
value_id → meta_values.value: "CEFR-A2"          (cefr_level)
```

## Translation 1: Direct Reflexive "to wash oneself"
```sql
-- word_translations table
id: 880e8400-e29b-41d4-a716-446655440001
word_id: 770e8400-e29b-41d4-a716-446655440000
translation: "to wash oneself"
display_priority: 1

-- entity_meta_values for this translation
-- entity_type='word_translation', entity_id=880e8400-e29b-41d4-a716-446655440001
value_id → metaattr002val015 (auxiliary: "essere")
value_id → metaattr021val102 (verb_type: "direct-reflexive")
value_id → metaattr020val100 (transitivity: "intransitive")
```

## Translation 2: Reciprocal "to wash each other" (MANDATORY)
```sql
-- word_translations table  
id: 880e8400-e29b-41d4-a716-446655440002
word_id: 770e8400-e29b-41d4-a716-446655440000
translation: "to wash each other"
display_priority: 2

-- entity_meta_values for this translation
-- entity_type='word_translation', entity_id=880e8400-e29b-41d4-a716-446655440002
value_id → metaattr002val015 (auxiliary: "essere")
value_id → metaattr021val103 (verb_type: "reciprocal")
value_id → metaattr013val056 (number_restriction: "plural-only")
```

## Complete Form Inventory with Integrated Clitics (137 Total Forms)

### Reflexive Metadata Architecture
Each form includes reflexive clitic integration with same metavalue stable_ids as Scenario A, plus:
- **Translation Restrictions**: Translation 2 (reciprocal) restricted to plural forms only via translation-level `number_restriction`
- **Agreement**: Compound forms with essere auxiliary require gender/number agreement matching

### Simple Forms with Reflexive Pronouns (51 forms)

| Form ID | Form Text | Entity Meta Values | Translation Coverage 1 | Translation Coverage 2 |
|---------|-----------|-----------|---------------------|---------------------|
| 201 | mi lavo | metaattr010val054 (mood: "indicativo") + metaattr019val096 (tense: "presente") + metaattr014val060 (person: "prima-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple")  | I wash myself | - |
| 202 | ti lavi | metaattr010val054 (mood: "indicativo") + metaattr019val096 (tense: "presente") + metaattr014val061 (person: "seconda-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple")  | you wash yourself | - |
| 203 | si lava | metaattr010val054 (mood: "indicativo") + metaattr019val096 (tense: "presente") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple")  | he/she washes himself/herself | - |
| 204 | ci laviamo | metaattr010val054 (mood: "indicativo") + metaattr019val096 (tense: "presente") + metaattr014val060 (person: "prima-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple")  | we wash ourselves | we wash each other |
| 205 | vi lavate | metaattr010val054 (mood: "indicativo") + metaattr019val096 (tense: "presente") + metaattr014val061 (person: "seconda-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple")  | you wash yourselves | you wash each other |
| 206 | si lavano | metaattr010val054 (mood: "indicativo") + metaattr019val096 (tense: "presente") + metaattr014val062 (person: "terza-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple")  | they wash themselves | they wash each other |
| 207 | mi lavavo | metaattr010val054 (mood: "indicativo") + metaattr019val097 (tense: "imperfetto") + metaattr014val060 (person: "prima-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple")  | I was washing myself | - |
| 208 | ti lavavi | metaattr010val054 (mood: "indicativo") + metaattr019val097 (tense: "imperfetto") + metaattr014val061 (person: "seconda-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple")  | you were washing yourself | - |
| 209 | si lavava | metaattr010val054 (mood: "indicativo") + metaattr019val097 (tense: "imperfetto") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple")  | he/she was washing himself/herself | - |
| 210 | ci lavavamo | metaattr010val054 (mood: "indicativo") + metaattr019val097 (tense: "imperfetto") + metaattr014val060 (person: "prima-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple")  | we were washing ourselves | we were washing each other |
| 211 | vi lavavate | metaattr010val054 (mood: "indicativo") + metaattr019val097 (tense: "imperfetto") + metaattr014val061 (person: "seconda-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple")  | you were washing yourselves | you were washing each other |
| 212 | si lavavano | metaattr010val054 (mood: "indicativo") + metaattr019val097 (tense: "imperfetto") + metaattr014val062 (person: "terza-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple")  | they were washing themselves | they were washing each other |
| 213 | mi lavai | metaattr010val054 (mood: "indicativo") + metaattr019val098 (tense: "passato-remoto") + metaattr014val060 (person: "prima-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple")  | I washed myself | - |
| 214 | ti lavasti | metaattr010val054 (mood: "indicativo") + metaattr019val098 (tense: "passato-remoto") + metaattr014val061 (person: "seconda-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple")  | you washed yourself | - |
| 215 | si lavò | metaattr010val054 (mood: "indicativo") + metaattr019val098 (tense: "passato-remoto") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple")  | he/she washed himself/herself | - |
| 216 | ci lavammo | metaattr010val054 (mood: "indicativo") + metaattr019val098 (tense: "passato-remoto") + metaattr014val060 (person: "prima-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple")  | we washed ourselves | we washed each other |
| 217 | vi lavaste | metaattr010val054 (mood: "indicativo") + metaattr019val098 (tense: "passato-remoto") + metaattr014val061 (person: "seconda-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple")  | you washed yourselves | you washed each other |
| 218 | si lavarono | metaattr010val054 (mood: "indicativo") + metaattr019val098 (tense: "passato-remoto") + metaattr014val062 (person: "terza-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple")  | they washed themselves | they washed each other |
| 219 | mi laverò | metaattr010val054 (mood: "indicativo") + metaattr019val099 (tense: "futuro-semplice") + metaattr014val060 (person: "prima-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple")  | I will wash myself | - |
| 220 | ti laverai | metaattr010val054 (mood: "indicativo") + metaattr019val099 (tense: "futuro-semplice") + metaattr014val061 (person: "seconda-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple")  | you will wash yourself | - |
| 221 | si laverà | metaattr010val054 (mood: "indicativo") + metaattr019val099 (tense: "futuro-semplice") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple")  | he/she will wash himself/herself | - |
| 222 | ci laveremo | metaattr010val054 (mood: "indicativo") + metaattr019val099 (tense: "futuro-semplice") + metaattr014val060 (person: "prima-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple")  | we will wash ourselves | we will wash each other |
| 223 | vi laverete | metaattr010val054 (mood: "indicativo") + metaattr019val099 (tense: "futuro-semplice") + metaattr014val061 (person: "seconda-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple")  | you will wash yourselves | you will wash each other |
| 224 | si laveranno | metaattr010val054 (mood: "indicativo") + metaattr019val099 (tense: "futuro-semplice") + metaattr014val062 (person: "terza-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple")  | they will wash themselves | they will wash each other |
| 225 | mi lavi | metaattr010val055 (mood: "congiuntivo") + metaattr019val102 (tense: "congiuntivo-presente") + metaattr014val060 (person: "prima-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple")  | (that) I wash myself | - |
| 226 | ti lavi | metaattr010val055 (mood: "congiuntivo") + metaattr019val102 (tense: "congiuntivo-presente") + metaattr014val061 (person: "seconda-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple")  | (that) you wash yourself | - |
| 227 | si lavi | metaattr010val055 (mood: "congiuntivo") + metaattr019val102 (tense: "congiuntivo-presente") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple")  | (that) he/she washes himself/herself | - |
| 228 | ci laviamo | metaattr010val055 (mood: "congiuntivo") + metaattr019val102 (tense: "congiuntivo-presente") + metaattr014val060 (person: "prima-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple")  | (that) we wash ourselves | (that) we wash each other |
| 229 | vi laviate | metaattr010val055 (mood: "congiuntivo") + metaattr019val102 (tense: "congiuntivo-presente") + metaattr014val061 (person: "seconda-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple")  | (that) you wash yourselves | (that) you wash each other |
| 230 | si lavino | metaattr010val055 (mood: "congiuntivo") + metaattr019val102 (tense: "congiuntivo-presente") + metaattr014val062 (person: "terza-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple")  | (that) they wash themselves | (that) they wash each other |
| 231 | mi lavassi | metaattr010val055 (mood: "congiuntivo") + metaattr019val103 (tense: "congiuntivo-imperfetto") + metaattr014val060 (person: "prima-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple")  | (that) I washed myself | - |
| 232 | ti lavassi | metaattr010val055 (mood: "congiuntivo") + metaattr019val103 (tense: "congiuntivo-imperfetto") + metaattr014val061 (person: "seconda-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple")  | (that) you washed yourself | - |
| 233 | si lavasse | metaattr010val055 (mood: "congiuntivo") + metaattr019val103 (tense: "congiuntivo-imperfetto") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple")  | (that) he/she washed himself/herself | - |
| 234 | ci lavassimo | metaattr010val055 (mood: "congiuntivo") + metaattr019val103 (tense: "congiuntivo-imperfetto") + metaattr014val060 (person: "prima-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple")  | (that) we washed ourselves | (that) we washed each other |
| 235 | vi lavaste | metaattr010val055 (mood: "congiuntivo") + metaattr019val103 (tense: "congiuntivo-imperfetto") + metaattr014val061 (person: "seconda-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple")  | (that) you washed yourselves | (that) you washed each other |
| 236 | si lavassero | metaattr010val055 (mood: "congiuntivo") + metaattr019val103 (tense: "congiuntivo-imperfetto") + metaattr014val062 (person: "terza-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple")  | (that) they washed themselves | (that) they washed each other |
| 237 | mi laverei | metaattr010val056 (mood: "condizionale") + metaattr019val104 (tense: "condizionale-presente") + metaattr014val060 (person: "prima-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple")  | I would wash myself | - |
| 238 | ti laveresti | metaattr010val056 (mood: "condizionale") + metaattr019val104 (tense: "condizionale-presente") + metaattr014val061 (person: "seconda-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple")  | you would wash yourself | - |
| 239 | si laverebbe | metaattr010val056 (mood: "condizionale") + metaattr019val104 (tense: "condizionale-presente") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple")  | he/she would wash himself/herself | - |
| 240 | ci laveremmo | metaattr010val056 (mood: "condizionale") + metaattr019val104 (tense: "condizionale-presente") + metaattr014val060 (person: "prima-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple")  | we would wash ourselves | we would wash each other |
| 241 | vi lavereste | metaattr010val056 (mood: "condizionale") + metaattr019val104 (tense: "condizionale-presente") + metaattr014val061 (person: "seconda-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple")  | you would wash yourselves | you would wash each other |
| 242 | si laverebbero | metaattr010val056 (mood: "condizionale") + metaattr019val104 (tense: "condizionale-presente") + metaattr014val062 (person: "terza-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple")  | they would wash themselves | they would wash each other |
| 243 | lavati | metaattr010val057 (mood: "imperativo") + metaattr019val105 (tense: "imperativo-presente") + metaattr014val061 (person: "seconda-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple")  | wash yourself! | - |
| 244 | si lavi | metaattr010val057 (mood: "imperativo") + metaattr019val105 (tense: "imperativo-presente") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple")  | let him/her wash himself/herself! | - |
| 245 | laviamoci | metaattr010val057 (mood: "imperativo") + metaattr019val105 (tense: "imperativo-presente") + metaattr014val060 (person: "prima-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple")  | let's wash ourselves! | let's wash each other! |
| 246 | lavatevi | metaattr010val057 (mood: "imperativo") + metaattr019val105 (tense: "imperativo-presente") + metaattr014val061 (person: "seconda-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple")  | wash yourselves! | wash each other! |
| 247 | si lavino | metaattr010val057 (mood: "imperativo") + metaattr019val105 (tense: "imperativo-presente") + metaattr014val062 (person: "terza-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple")  | let them wash themselves! | let them wash each other! |
| 248 | lavarsi | metaattr010val058 (mood: "infinito") + metaattr019val106 (tense: "infinito-presente")  + metaattr022val107 (verb_form_type: "simple")  | to wash oneself | to wash each other |
| 249 | lavantesi | metaattr010val059 (mood: "participio") + metaattr019val107 (tense: "participio-presente")  + metaattr022val107 (verb_form_type: "simple")  | washing oneself | washing each other |
| 250 | lavatosi | metaattr010val059 (mood: "participio") + metaattr019val108 (tense: "participio-passato")  + metaattr022val107 (verb_form_type: "simple")   | washed oneself | washed each other |
| 251 | lavandosi | metaattr010val060 (mood: "gerundio") + metaattr019val109 (tense: "gerundio-presente")  + metaattr022val107 (verb_form_type: "simple")  | washing oneself | washing each other |

### Compound Forms with essere auxiliary (49 forms)

| Form ID | Form Text | Entity Meta Values | Translation Coverage 1 | Translation Coverage 2 |
|---------|-----------|-----------|---------------------|---------------------|
| 252 | sono lavato | metaattr010val054 (mood: "indicativo") + metaattr019val110 (tense: "passato-prossimo") + metaattr014val060 (person: "prima-persona") + metaattr012val054 (number: "singolare") + metaattr022val108 (verb_form_type: "compound")   | I have washed myself | - |
| 253 | ti sei lavato/a | metaattr010val054 (mood: "indicativo") + metaattr019val110 (tense: "passato-prossimo") + metaattr014val061 (person: "seconda-persona") + metaattr012val054 (number: "singolare") + metaattr022val108 (verb_form_type: "compound")   | you have washed yourself | - |
| 254 | si è lavato/a | metaattr010val054 (mood: "indicativo") + metaattr019val110 (tense: "passato-prossimo") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val108 (verb_form_type: "compound")   | he/she has washed himself/herself | - |
| 255 | ci siamo lavati/e | metaattr010val054 (mood: "indicativo") + metaattr019val110 (tense: "passato-prossimo") + metaattr014val060 (person: "prima-persona") + metaattr012val055 (number: "plurale") + metaattr022val108 (verb_form_type: "compound")   | we have washed ourselves | we have washed each other |
| 256 | vi siete lavati/e | metaattr010val054 (mood: "indicativo") + metaattr019val110 (tense: "passato-prossimo") + metaattr014val061 (person: "seconda-persona") + metaattr012val055 (number: "plurale") + metaattr022val108 (verb_form_type: "compound")   | you have washed yourselves | you have washed each other |
| 257 | si sono lavati/e | metaattr010val054 (mood: "indicativo") + metaattr019val110 (tense: "passato-prossimo") + metaattr014val062 (person: "terza-persona") + metaattr012val055 (number: "plurale") + metaattr022val108 (verb_form_type: "compound")   | they have washed themselves | they have washed each other |
| 258 | mi ero lavato/a | metaattr010val054 (mood: "indicativo") + metaattr019val111 (tense: "trapassato-prossimo") + metaattr014val060 (person: "prima-persona") + metaattr012val054 (number: "singolare") + metaattr022val108 (verb_form_type: "compound")   | I had washed myself | - |
| 259 | ti eri lavato/a | metaattr010val054 (mood: "indicativo") + metaattr019val111 (tense: "trapassato-prossimo") + metaattr014val061 (person: "seconda-persona") + metaattr012val054 (number: "singolare") + metaattr022val108 (verb_form_type: "compound")   | you had washed yourself | - |
| 260 | si era lavato/a | metaattr010val054 (mood: "indicativo") + metaattr019val111 (tense: "trapassato-prossimo") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val108 (verb_form_type: "compound")   | he/she had washed himself/herself | - |
| 261 | ci eravamo lavati/e | metaattr010val054 (mood: "indicativo") + metaattr019val111 (tense: "trapassato-prossimo") + metaattr014val060 (person: "prima-persona") + metaattr012val055 (number: "plurale") + metaattr022val108 (verb_form_type: "compound")   | we had washed ourselves | we had washed each other |
| 262 | vi eravate lavati/e | metaattr010val054 (mood: "indicativo") + metaattr019val111 (tense: "trapassato-prossimo") + metaattr014val061 (person: "seconda-persona") + metaattr012val055 (number: "plurale") + metaattr022val108 (verb_form_type: "compound")   | you had washed yourselves | you had washed each other |
| 263 | si erano lavati/e | metaattr010val054 (mood: "indicativo") + metaattr019val111 (tense: "trapassato-prossimo") + metaattr014val062 (person: "terza-persona") + metaattr012val055 (number: "plurale") + metaattr022val108 (verb_form_type: "compound")   | they had washed themselves | they had washed each other |
| 264 | mi fui lavato/a | metaattr010val054 (mood: "indicativo") + metaattr019val112 (tense: "trapassato-remoto") + metaattr014val060 (person: "prima-persona") + metaattr012val054 (number: "singolare") + metaattr022val108 (verb_form_type: "compound")   | I had washed myself | - |
| 265 | ti fosti lavato/a | metaattr010val054 (mood: "indicativo") + metaattr019val112 (tense: "trapassato-remoto") + metaattr014val061 (person: "seconda-persona") + metaattr012val054 (number: "singolare") + metaattr022val108 (verb_form_type: "compound")   | you had washed yourself | - |
| 266 | si fu lavato/a | metaattr010val054 (mood: "indicativo") + metaattr019val112 (tense: "trapassato-remoto") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val108 (verb_form_type: "compound")   | he/she had washed himself/herself | - |
| 267 | ci fummo lavati/e | metaattr010val054 (mood: "indicativo") + metaattr019val112 (tense: "trapassato-remoto") + metaattr014val060 (person: "prima-persona") + metaattr012val055 (number: "plurale") + metaattr022val108 (verb_form_type: "compound")   | we had washed ourselves | we had washed each other |
| 268 | vi foste lavati/e | metaattr010val054 (mood: "indicativo") + metaattr019val112 (tense: "trapassato-remoto") + metaattr014val061 (person: "seconda-persona") + metaattr012val055 (number: "plurale") + metaattr022val108 (verb_form_type: "compound")   | you had washed yourselves | you had washed each other |
| 269 | si furono lavati/e | metaattr010val054 (mood: "indicativo") + metaattr019val112 (tense: "trapassato-remoto") + metaattr014val062 (person: "terza-persona") + metaattr012val055 (number: "plurale") + metaattr022val108 (verb_form_type: "compound")   | they had washed themselves | they had washed each other |
| 270 | mi sarò lavato/a | metaattr010val054 (mood: "indicativo") + metaattr019val113 (tense: "futuro-anteriore") + metaattr014val060 (person: "prima-persona") + metaattr012val054 (number: "singolare") + metaattr022val108 (verb_form_type: "compound")   | I will have washed myself | - |
| 271 | ti sarai lavato/a | metaattr010val054 (mood: "indicativo") + metaattr019val113 (tense: "futuro-anteriore") + metaattr014val061 (person: "seconda-persona") + metaattr012val054 (number: "singolare") + metaattr022val108 (verb_form_type: "compound")   | you will have washed yourself | - |
| 272 | si sarà lavato/a | metaattr010val054 (mood: "indicativo") + metaattr019val113 (tense: "futuro-anteriore") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val108 (verb_form_type: "compound")   | he/she will have washed himself/herself | - |
| 273 | ci saremo lavati/e | metaattr010val054 (mood: "indicativo") + metaattr019val113 (tense: "futuro-anteriore") + metaattr014val060 (person: "prima-persona") + metaattr012val055 (number: "plurale") + metaattr022val108 (verb_form_type: "compound")   | we will have washed ourselves | we will have washed each other |
| 274 | vi sarete lavati/e | metaattr010val054 (mood: "indicativo") + metaattr019val113 (tense: "futuro-anteriore") + metaattr014val061 (person: "seconda-persona") + metaattr012val055 (number: "plurale") + metaattr022val108 (verb_form_type: "compound")   | you will have washed yourselves | you will have washed each other |
| 275 | si saranno lavati/e | metaattr010val054 (mood: "indicativo") + metaattr019val113 (tense: "futuro-anteriore") + metaattr014val062 (person: "terza-persona") + metaattr012val055 (number: "plurale") + metaattr022val108 (verb_form_type: "compound")   | they will have washed themselves | they will have washed each other |
| 276 | mi sia lavato/a | metaattr010val055 (mood: "congiuntivo") + metaattr019val114 (tense: "congiuntivo-passato") + metaattr014val060 (person: "prima-persona") + metaattr012val054 (number: "singolare") + metaattr022val108 (verb_form_type: "compound")   | (that) I have washed myself | - |
| 277 | ti sia lavato/a | metaattr010val055 (mood: "congiuntivo") + metaattr019val114 (tense: "congiuntivo-passato") + metaattr014val061 (person: "seconda-persona") + metaattr012val054 (number: "singolare") + metaattr022val108 (verb_form_type: "compound")   | (that) you have washed yourself | - |
| 278 | si sia lavato/a | metaattr010val055 (mood: "congiuntivo") + metaattr019val114 (tense: "congiuntivo-passato") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val108 (verb_form_type: "compound")   | (that) he/she has washed himself/herself | - |
| 279 | ci siamo lavati/e | metaattr010val055 (mood: "congiuntivo") + metaattr019val114 (tense: "congiuntivo-passato") + metaattr014val060 (person: "prima-persona") + metaattr012val055 (number: "plurale") + metaattr022val108 (verb_form_type: "compound")   | (that) we have washed ourselves | (that) we have washed each other |
| 280 | vi siate lavati/e | metaattr010val055 (mood: "congiuntivo") + metaattr019val114 (tense: "congiuntivo-passato") + metaattr014val061 (person: "seconda-persona") + metaattr012val055 (number: "plurale") + metaattr022val108 (verb_form_type: "compound")   | (that) you have washed yourselves | (that) you have washed each other |
| 281 | si siano lavati/e | metaattr010val055 (mood: "congiuntivo") + metaattr019val114 (tense: "congiuntivo-passato") + metaattr014val062 (person: "terza-persona") + metaattr012val055 (number: "plurale") + metaattr022val108 (verb_form_type: "compound")   | (that) they have washed themselves | (that) they have washed each other |
| 282 | mi fossi lavato/a | metaattr010val055 (mood: "congiuntivo") + metaattr019val115 (tense: "congiuntivo-trapassato") + metaattr014val060 (person: "prima-persona") + metaattr012val054 (number: "singolare") + metaattr022val108 (verb_form_type: "compound")   | (that) I had washed myself | - |
| 283 | ti fossi lavato/a | metaattr010val055 (mood: "congiuntivo") + metaattr019val115 (tense: "congiuntivo-trapassato") + metaattr014val061 (person: "seconda-persona") + metaattr012val054 (number: "singolare") + metaattr022val108 (verb_form_type: "compound")   | (that) you had washed yourself | - |
| 284 | si fosse lavato/a | metaattr010val055 (mood: "congiuntivo") + metaattr019val115 (tense: "congiuntivo-trapassato") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val108 (verb_form_type: "compound")   | (that) he/she had washed himself/herself | - |
| 285 | ci fossimo lavati/e | metaattr010val055 (mood: "congiuntivo") + metaattr019val115 (tense: "congiuntivo-trapassato") + metaattr014val060 (person: "prima-persona") + metaattr012val055 (number: "plurale") + metaattr022val108 (verb_form_type: "compound")   | (that) we had washed ourselves | (that) we had washed each other |
| 286 | vi foste lavati/e | metaattr010val055 (mood: "congiuntivo") + metaattr019val115 (tense: "congiuntivo-trapassato") + metaattr014val061 (person: "seconda-persona") + metaattr012val055 (number: "plurale") + metaattr022val108 (verb_form_type: "compound")   | (that) you had washed yourselves | (that) you had washed each other |
| 287 | si fossero lavati/e | metaattr010val055 (mood: "congiuntivo") + metaattr019val115 (tense: "congiuntivo-trapassato") + metaattr014val062 (person: "terza-persona") + metaattr012val055 (number: "plurale") + metaattr022val108 (verb_form_type: "compound")   | (that) they had washed themselves | (that) they had washed each other |
| 288 | mi sarei lavato/a | metaattr010val056 (mood: "condizionale") + metaattr019val116 (tense: "condizionale-passato") + metaattr014val060 (person: "prima-persona") + metaattr012val054 (number: "singolare") + metaattr022val108 (verb_form_type: "compound")   | I would have washed myself | - |
| 289 | ti saresti lavato/a | metaattr010val056 (mood: "condizionale") + metaattr019val116 (tense: "condizionale-passato") + metaattr014val061 (person: "seconda-persona") + metaattr012val054 (number: "singolare") + metaattr022val108 (verb_form_type: "compound")   | you would have washed yourself | - |
| 290 | si sarebbe lavato/a | metaattr010val056 (mood: "condizionale") + metaattr019val116 (tense: "condizionale-passato") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val108 (verb_form_type: "compound")   | he/she would have washed himself/herself | - |
| 291 | ci saremmo lavati/e | metaattr010val056 (mood: "condizionale") + metaattr019val116 (tense: "condizionale-passato") + metaattr014val060 (person: "prima-persona") + metaattr012val055 (number: "plurale") + metaattr022val108 (verb_form_type: "compound")   | we would have washed ourselves | we would have washed each other |
| 292 | vi sareste lavati/e | metaattr010val056 (mood: "condizionale") + metaattr019val116 (tense: "condizionale-passato") + metaattr014val061 (person: "seconda-persona") + metaattr012val055 (number: "plurale") + metaattr022val108 (verb_form_type: "compound")   | you would have washed yourselves | you would have washed each other |
| 293 | si sarebbero lavati/e | metaattr010val056 (mood: "condizionale") + metaattr019val116 (tense: "condizionale-passato") + metaattr014val062 (person: "terza-persona") + metaattr012val055 (number: "plurale") + metaattr022val108 (verb_form_type: "compound")   | they would have washed themselves | they would have washed each other |
| 294 | sii lavato/a | metaattr010val057 (mood: "imperativo") + metaattr019val117 (tense: "imperativo-passato") + metaattr014val061 (person: "seconda-persona") + metaattr012val054 (number: "singolare") + metaattr022val108 (verb_form_type: "compound")   | have washed yourself! | - |
| 295 | si sia lavato/a | metaattr010val057 (mood: "imperativo") + metaattr019val117 (tense: "imperativo-passato") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val108 (verb_form_type: "compound")   | let him/her have washed himself/herself! | - |
| 296 | siamo lavati/e | metaattr010val057 (mood: "imperativo") + metaattr019val117 (tense: "imperativo-passato") + metaattr014val060 (person: "prima-persona") + metaattr012val055 (number: "plurale") + metaattr022val108 (verb_form_type: "compound")   | let's have washed ourselves! | let's have washed each other! |
| 297 | siate lavati/e | metaattr010val057 (mood: "imperativo") + metaattr019val117 (tense: "imperativo-passato") + metaattr014val061 (person: "seconda-persona") + metaattr012val055 (number: "plurale") + metaattr022val108 (verb_form_type: "compound")   | have washed yourselves! | have washed each other! |
| 298 | si siano lavati/e | metaattr010val057 (mood: "imperativo") + metaattr019val117 (tense: "imperativo-passato") + metaattr014val062 (person: "terza-persona") + metaattr012val055 (number: "plurale") + metaattr022val108 (verb_form_type: "compound")   | let them have washed themselves! | let them have washed each other! |
| 299 | essendosi lavato/a/i/e | metaattr010val060 (mood: "gerundio") + metaattr019val118 (tense: "gerundio-passato")  + metaattr022val108 (verb_form_type: "compound")   | having washed oneself | having washed each other |
| 300 | essersi lavato/a/i/e | metaattr010val058 (mood: "infinito") + metaattr019val119 (tense: "infinito-passato")  + metaattr022val108 (verb_form_type: "compound")   | to have washed oneself | to have washed each other |

### Progressive Forms with stare auxiliary (37 forms)

| Form ID | Form Text | Entity Meta Values | Translation Coverage 1 | Translation Coverage 2 |
|---------|-----------|-----------|---------------------|---------------------|
| 301 | mi sto lavando | metaattr010val054 (mood: "indicativo") + metaattr019val120 (tense: "presente-progressivo") + metaattr014val060 (person: "prima-persona") + metaattr012val054 (number: "singolare") + metaattr022val109 (verb_form_type: "progressive")  | I am washing myself | - |
| 302 | ti stai lavando | metaattr010val054 (mood: "indicativo") + metaattr019val120 (tense: "presente-progressivo") + metaattr014val061 (person: "seconda-persona") + metaattr012val054 (number: "singolare") + metaattr022val109 (verb_form_type: "progressive")  | you are washing yourself | - |
| 303 | si sta lavando | metaattr010val054 (mood: "indicativo") + metaattr019val120 (tense: "presente-progressivo") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val109 (verb_form_type: "progressive")  | he/she is washing himself/herself | - |
| 304 | ci stiamo lavando | metaattr010val054 (mood: "indicativo") + metaattr019val120 (tense: "presente-progressivo") + metaattr014val060 (person: "prima-persona") + metaattr012val055 (number: "plurale") + metaattr022val109 (verb_form_type: "progressive")  | we are washing ourselves | we are washing each other |
| 305 | vi state lavando | metaattr010val054 (mood: "indicativo") + metaattr019val120 (tense: "presente-progressivo") + metaattr014val061 (person: "seconda-persona") + metaattr012val055 (number: "plurale") + metaattr022val109 (verb_form_type: "progressive")  | you are washing yourselves | you are washing each other |
| 306 | si stanno lavando | metaattr010val054 (mood: "indicativo") + metaattr019val120 (tense: "presente-progressivo") + metaattr014val062 (person: "terza-persona") + metaattr012val055 (number: "plurale") + metaattr022val109 (verb_form_type: "progressive")  | they are washing themselves | they are washing each other |
| 307 | mi stavo lavando | metaattr010val054 (mood: "indicativo") + metaattr019val121 (tense: "passato-progressivo") + metaattr014val060 (person: "prima-persona") + metaattr012val054 (number: "singolare") + metaattr022val109 (verb_form_type: "progressive")  | I was washing myself | - |
| 308 | ti stavi lavando | metaattr010val054 (mood: "indicativo") + metaattr019val121 (tense: "passato-progressivo") + metaattr014val061 (person: "seconda-persona") + metaattr012val054 (number: "singolare") + metaattr022val109 (verb_form_type: "progressive")  | you were washing yourself | - |
| 309 | si stava lavando | metaattr010val054 (mood: "indicativo") + metaattr019val121 (tense: "passato-progressivo") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val109 (verb_form_type: "progressive")  | he/she was washing himself/herself | - |
| 310 | ci stavamo lavando | metaattr010val054 (mood: "indicativo") + metaattr019val121 (tense: "passato-progressivo") + metaattr014val060 (person: "prima-persona") + metaattr012val055 (number: "plurale") + metaattr022val109 (verb_form_type: "progressive")  | we were washing ourselves | we were washing each other |
| 311 | vi stavate lavando | metaattr010val054 (mood: "indicativo") + metaattr019val121 (tense: "passato-progressivo") + metaattr014val061 (person: "seconda-persona") + metaattr012val055 (number: "plurale") + metaattr022val109 (verb_form_type: "progressive")  | you were washing yourselves | you were washing each other |
| 312 | si stavano lavando | metaattr010val054 (mood: "indicativo") + metaattr019val121 (tense: "passato-progressivo") + metaattr014val062 (person: "terza-persona") + metaattr012val055 (number: "plurale") + metaattr022val109 (verb_form_type: "progressive")  | they were washing themselves | they were washing each other |
| 313 | mi starò lavando | metaattr010val054 (mood: "indicativo") + metaattr019val122 (tense: "futuro-progressivo") + metaattr014val060 (person: "prima-persona") + metaattr012val054 (number: "singolare") + metaattr022val109 (verb_form_type: "progressive")  | I will be washing myself | - |
| 314 | ti starai lavando | metaattr010val054 (mood: "indicativo") + metaattr019val122 (tense: "futuro-progressivo") + metaattr014val061 (person: "seconda-persona") + metaattr012val054 (number: "singolare") + metaattr022val109 (verb_form_type: "progressive")  | you will be washing yourself | - |
| 315 | si starà lavando | metaattr010val054 (mood: "indicativo") + metaattr019val122 (tense: "futuro-progressivo") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val109 (verb_form_type: "progressive")  | he/she will be washing himself/herself | - |
| 316 | ci staremo lavando | metaattr010val054 (mood: "indicativo") + metaattr019val122 (tense: "futuro-progressivo") + metaattr014val060 (person: "prima-persona") + metaattr012val055 (number: "plurale") + metaattr022val109 (verb_form_type: "progressive")  | we will be washing ourselves | we will be washing each other |
| 317 | vi starete lavando | metaattr010val054 (mood: "indicativo") + metaattr019val122 (tense: "futuro-progressivo") + metaattr014val061 (person: "seconda-persona") + metaattr012val055 (number: "plurale") + metaattr022val109 (verb_form_type: "progressive")  | you will be washing yourselves | you will be washing each other |
| 318 | si staranno lavando | metaattr010val054 (mood: "indicativo") + metaattr019val122 (tense: "futuro-progressivo") + metaattr014val062 (person: "terza-persona") + metaattr012val055 (number: "plurale") + metaattr022val109 (verb_form_type: "progressive")  | they will be washing themselves | they will be washing each other |
| 319 | mi stia lavando | metaattr010val055 (mood: "congiuntivo") + metaattr019val123 (tense: "congiuntivo-presente-progressivo") + metaattr014val060 (person: "prima-persona") + metaattr012val054 (number: "singolare") + metaattr022val109 (verb_form_type: "progressive")  | (that) I be washing myself | - |
| 320 | ti stia lavando | metaattr010val055 (mood: "congiuntivo") + metaattr019val123 (tense: "congiuntivo-presente-progressivo") + metaattr014val061 (person: "seconda-persona") + metaattr012val054 (number: "singolare") + metaattr022val109 (verb_form_type: "progressive")  | (that) you be washing yourself | - |
| 321 | si stia lavando | metaattr010val055 (mood: "congiuntivo") + metaattr019val123 (tense: "congiuntivo-presente-progressivo") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val109 (verb_form_type: "progressive")  | (that) he/she be washing himself/herself | - |
| 322 | ci stiamo lavando | metaattr010val055 (mood: "congiuntivo") + metaattr019val123 (tense: "congiuntivo-presente-progressivo") + metaattr014val060 (person: "prima-persona") + metaattr012val055 (number: "plurale") + metaattr022val109 (verb_form_type: "progressive")  | (that) we be washing ourselves | (that) we be washing each other |
| 323 | vi stiate lavando | metaattr010val055 (mood: "congiuntivo") + metaattr019val123 (tense: "congiuntivo-presente-progressivo") + metaattr014val061 (person: "seconda-persona") + metaattr012val055 (number: "plurale") + metaattr022val109 (verb_form_type: "progressive")  | (that) you be washing yourselves | (that) you be washing each other |
| 324 | si stiano lavando | metaattr010val055 (mood: "congiuntivo") + metaattr019val123 (tense: "congiuntivo-presente-progressivo") + metaattr014val062 (person: "terza-persona") + metaattr012val055 (number: "plurale") + metaattr022val109 (verb_form_type: "progressive")  | (that) they be washing themselves | (that) they be washing each other |
| 325 | mi stessi lavando | metaattr010val055 (mood: "congiuntivo") + metaattr019val124 (tense: "congiuntivo-imperfetto-progressivo") + metaattr014val060 (person: "prima-persona") + metaattr012val054 (number: "singolare") + metaattr022val109 (verb_form_type: "progressive")  | (that) I were washing myself | - |
| 326 | ti stessi lavando | metaattr010val055 (mood: "congiuntivo") + metaattr019val124 (tense: "congiuntivo-imperfetto-progressivo") + metaattr014val061 (person: "seconda-persona") + metaattr012val054 (number: "singolare") + metaattr022val109 (verb_form_type: "progressive")  | (that) you were washing yourself | - |
| 327 | si stesse lavando | metaattr010val055 (mood: "congiuntivo") + metaattr019val124 (tense: "congiuntivo-imperfetto-progressivo") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val109 (verb_form_type: "progressive")  | (that) he/she were washing himself/herself | - |
| 328 | ci stessimo lavando | metaattr010val055 (mood: "congiuntivo") + metaattr019val124 (tense: "congiuntivo-imperfetto-progressivo") + metaattr014val060 (person: "prima-persona") + metaattr012val055 (number: "plurale") + metaattr022val109 (verb_form_type: "progressive")  | (that) we were washing ourselves | (that) we were washing each other |
| 329 | vi steste lavando | metaattr010val055 (mood: "congiuntivo") + metaattr019val124 (tense: "congiuntivo-imperfetto-progressivo") + metaattr014val061 (person: "seconda-persona") + metaattr012val055 (number: "plurale") + metaattr022val109 (verb_form_type: "progressive")  | (that) you were washing yourselves | (that) you were washing each other |
| 330 | si stessero lavando | metaattr010val055 (mood: "congiuntivo") + metaattr019val124 (tense: "congiuntivo-imperfetto-progressivo") + metaattr014val062 (person: "terza-persona") + metaattr012val055 (number: "plurale") + metaattr022val109 (verb_form_type: "progressive")  | (that) they were washing themselves | (that) they were washing each other |
| 331 | mi starei lavando | metaattr010val056 (mood: "condizionale") + metaattr019val125 (tense: "condizionale-progressivo") + metaattr014val060 (person: "prima-persona") + metaattr012val054 (number: "singolare") + metaattr022val109 (verb_form_type: "progressive")  | I would be washing myself | - |
| 332 | ti staresti lavando | metaattr010val056 (mood: "condizionale") + metaattr019val125 (tense: "condizionale-progressivo") + metaattr014val061 (person: "seconda-persona") + metaattr012val054 (number: "singolare") + metaattr022val109 (verb_form_type: "progressive")  | you would be washing yourself | - |
| 333 | si starebbe lavando | metaattr010val056 (mood: "condizionale") + metaattr019val125 (tense: "condizionale-progressivo") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val109 (verb_form_type: "progressive")  | he/she would be washing himself/herself | - |
| 334 | ci staremmo lavando | metaattr010val056 (mood: "condizionale") + metaattr019val125 (tense: "condizionale-progressivo") + metaattr014val060 (person: "prima-persona") + metaattr012val055 (number: "plurale") + metaattr022val109 (verb_form_type: "progressive")  | we would be washing ourselves | we would be washing each other |
| 335 | vi stareste lavando | metaattr010val056 (mood: "condizionale") + metaattr019val125 (tense: "condizionale-progressivo") + metaattr014val061 (person: "seconda-persona") + metaattr012val055 (number: "plurale") + metaattr022val109 (verb_form_type: "progressive")  | you would be washing yourselves | you would be washing each other |
| 336 | si starebbero lavando | metaattr010val056 (mood: "condizionale") + metaattr019val125 (tense: "condizionale-progressivo") + metaattr014val062 (person: "terza-persona") + metaattr012val055 (number: "plurale") + metaattr022val109 (verb_form_type: "progressive")  | they would be washing themselves | they would be washing each other |
| 337 | standosi lavando | metaattr010val060 (mood: "gerundio") + metaattr019val126 (tense: "gerundio-progressivo")  + metaattr022val109 (verb_form_type: "progressive")  | being washing oneself | being washing each other |

## Form_Translations Coverage

**Translation 1**: "to wash oneself" - covers ALL 137 forms  
**Translation 2**: "to wash each other" - covers only PLURAL forms (52 forms total: 17 simple + 17 compound + 18 progressive)

**Architectural Pattern**: Demonstrates translation-level restrictions where reciprocal interpretation applies only to semantically appropriate plural forms.

## Reflexive Architecture Significance

Section 8.2 establishes the reflexive verb architectural pattern for the Misti system:

1. **Integrated Clitic Pronouns**: Every form includes the appropriate reflexive pronoun (mi/ti/si/ci/vi/si)
2. **Dual Translation Support**: Architectural framework for multiple translation contexts on same forms
3. **Agreement Requirements**: Compound forms require gender/number agreement with essere auxiliary
4. **Translation Restrictions**: Demonstrates how semantic restrictions apply at the translation level
5. **Pronoun-Form Integration**: Shows how clitics integrate into the metavalue architecture

This complete inventory serves as the definitive reference for implementing reflexive verbs in the Misti database.