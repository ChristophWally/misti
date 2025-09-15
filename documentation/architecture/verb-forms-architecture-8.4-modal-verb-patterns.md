> **Part of**: [Misti Verb Forms System Architecture](./verb-forms-system-architecture.md)
> **Section**: 8.4 - Modal Verb Patterns
> **Example Verb**: "dovere" (must/have to; to owe)

---

# Modal Verb Patterns: "dovere" (must/have to; to owe) - Complete Form Inventory

## Overview
This section provides a comprehensive form inventory showing EVERY form and form_translation for the modal verb "dovere" in the Misti system. This demonstrates modal verb architecture with dual semantic meanings, complex auxiliary patterns, and translation coverage matrices for Italian modal verbs.

**Total Forms**: 137 (51 simple + 49 compound + 37 progressive)

## Dictionary Entry
```sql
-- dictionary table
id: 990e8400-e29b-41d4-a716-446655440003
lemma: "dovere"
word_type: "verb"
```

## Word-Level Metadata (via entity_meta_values)
```sql
-- entity_type='word', entity_id=990e8400-e29b-41d4-a716-446655440003
value_id → meta_values.value: "ere-conjugation"    (conjugation_type)
value_id → meta_values.value: "freq-top50"         (frequency_tier)
value_id → meta_values.value: "CEFR-A2"            (cefr_level)
```

## Translation 1: "must/have to" (modal meaning)
```sql
-- word_translations table
id: 770e8400-e29b-41d4-a716-446655440001
word_id: 990e8400-e29b-41d4-a716-446655440003
translation: "must/have to"
display_priority: 1

-- entity_meta_values for this translation
-- entity_type='word_translation', entity_id=770e8400-e29b-41d4-a716-446655440001
value_id → metaattr002val014 (auxiliary: "avere")
value_id → metaattr020val100 (transitivity: "intransitive")
value_id → metaattr021val115 (verb_type: "modal")
```

## Translation 2: "to owe" (transitive meaning)
```sql
-- word_translations table
id: 770e8400-e29b-41d4-a716-446655440002
word_id: 990e8400-e29b-41d4-a716-446655440003
translation: "to owe"
display_priority: 2

-- entity_meta_values for this translation
-- entity_type='word_translation', entity_id=770e8400-e29b-41d4-a716-446655440002
value_id → metaattr002val014 (auxiliary: "avere")
value_id → metaattr020val099 (transitivity: "transitive")
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

### Simple Forms (51 forms)

| Form ID | Form Text | Entity Meta Values | Translation Coverage 1 | Translation Coverage 2 |
|---------|-----------|-----------|---------------------|---------------------|
| 631 | devo | metaattr010val054 (mood: "indicativo") + metaattr019val096 (tense: "presente") + metaattr014val060 (person: "prima-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple") | I must/have to | I owe |
| 632 | devi | metaattr010val054 (mood: "indicativo") + metaattr019val096 (tense: "presente") + metaattr014val061 (person: "seconda-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple") | you must/have to | you owe |
| 633 | deve | metaattr010val054 (mood: "indicativo") + metaattr019val096 (tense: "presente") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple") | he/she must/has to | he/she owes |
| 634 | dobbiamo | metaattr010val054 (mood: "indicativo") + metaattr019val096 (tense: "presente") + metaattr014val060 (person: "prima-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple") | we must/have to | we owe |
| 635 | dovete | metaattr010val054 (mood: "indicativo") + metaattr019val096 (tense: "presente") + metaattr014val061 (person: "seconda-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple") | you must/have to | you owe |
| 636 | devono | metaattr010val054 (mood: "indicativo") + metaattr019val096 (tense: "presente") + metaattr014val062 (person: "terza-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple") | they must/have to | they owe |
| 637 | dovevo | metaattr010val054 (mood: "indicativo") + metaattr019val097 (tense: "imperfetto") + metaattr014val060 (person: "prima-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple") | I had to | I owed |
| 638 | dovevi | metaattr010val054 (mood: "indicativo") + metaattr019val097 (tense: "imperfetto") + metaattr014val061 (person: "seconda-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple") | you had to | you owed |
| 639 | doveva | metaattr010val054 (mood: "indicativo") + metaattr019val097 (tense: "imperfetto") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple") | he/she had to | he/she owed |
| 640 | dovevamo | metaattr010val054 (mood: "indicativo") + metaattr019val097 (tense: "imperfetto") + metaattr014val060 (person: "prima-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple") | we had to | we owed |
| 641 | dovevate | metaattr010val054 (mood: "indicativo") + metaattr019val097 (tense: "imperfetto") + metaattr014val061 (person: "seconda-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple") | you had to | you owed |
| 642 | dovevano | metaattr010val054 (mood: "indicativo") + metaattr019val097 (tense: "imperfetto") + metaattr014val062 (person: "terza-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple") | they had to | they owed |
| 643 | dovei | metaattr010val054 (mood: "indicativo") + metaattr019val098 (tense: "passato-remoto") + metaattr014val060 (person: "prima-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple") | I had to | I owed |
| 644 | dovesti | metaattr010val054 (mood: "indicativo") + metaattr019val098 (tense: "passato-remoto") + metaattr014val061 (person: "seconda-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple") | you had to | you owed |
| 645 | dovè | metaattr010val054 (mood: "indicativo") + metaattr019val098 (tense: "passato-remoto") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple") | he/she had to | he/she owed |
| 646 | dovemmo | metaattr010val054 (mood: "indicativo") + metaattr019val098 (tense: "passato-remoto") + metaattr014val060 (person: "prima-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple") | we had to | we owed |
| 647 | doveste | metaattr010val054 (mood: "indicativo") + metaattr019val098 (tense: "passato-remoto") + metaattr014val061 (person: "seconda-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple") | you had to | you owed |
| 648 | doverono | metaattr010val054 (mood: "indicativo") + metaattr019val098 (tense: "passato-remoto") + metaattr014val062 (person: "terza-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple") | they had to | they owed |
| 649 | dovrò | metaattr010val054 (mood: "indicativo") + metaattr019val099 (tense: "futuro-semplice") + metaattr014val060 (person: "prima-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple") | I will have to | I will owe |
| 650 | dovrai | metaattr010val054 (mood: "indicativo") + metaattr019val099 (tense: "futuro-semplice") + metaattr014val061 (person: "seconda-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple") | you will have to | you will owe |
| 651 | dovrà | metaattr010val054 (mood: "indicativo") + metaattr019val099 (tense: "futuro-semplice") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple") | he/she will have to | he/she will owe |
| 652 | dovremo | metaattr010val054 (mood: "indicativo") + metaattr019val099 (tense: "futuro-semplice") + metaattr014val060 (person: "prima-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple") | we will have to | we will owe |
| 653 | dovrete | metaattr010val054 (mood: "indicativo") + metaattr019val099 (tense: "futuro-semplice") + metaattr014val061 (person: "seconda-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple") | you will have to | you will owe |
| 654 | dovranno | metaattr010val054 (mood: "indicativo") + metaattr019val099 (tense: "futuro-semplice") + metaattr014val062 (person: "terza-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple") | they will have to | they will owe |
| 655 | deva | metaattr010val055 (mood: "congiuntivo") + metaattr019val102 (tense: "congiuntivo-presente") + metaattr014val060 (person: "prima-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple") | (that) I must | (that) I owe |
| 656 | deva | metaattr010val055 (mood: "congiuntivo") + metaattr019val102 (tense: "congiuntivo-presente") + metaattr014val061 (person: "seconda-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple") | (that) you must | (that) you owe |
| 657 | deva | metaattr010val055 (mood: "congiuntivo") + metaattr019val102 (tense: "congiuntivo-presente") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple") | (that) he/she must | (that) he/she owes |
| 658 | dobbiamo | metaattr010val055 (mood: "congiuntivo") + metaattr019val102 (tense: "congiuntivo-presente") + metaattr014val060 (person: "prima-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple") | (that) we must | (that) we owe |
| 659 | dobbiate | metaattr010val055 (mood: "congiuntivo") + metaattr019val102 (tense: "congiuntivo-presente") + metaattr014val061 (person: "seconda-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple") | (that) you must | (that) you owe |
| 660 | devano | metaattr010val055 (mood: "congiuntivo") + metaattr019val102 (tense: "congiuntivo-presente") + metaattr014val062 (person: "terza-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple") | (that) they must | (that) they owe |
| 661 | dovessi | metaattr010val055 (mood: "congiuntivo") + metaattr019val103 (tense: "congiuntivo-imperfetto") + metaattr014val060 (person: "prima-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple") | (that) I had to | (that) I owed |
| 662 | dovessi | metaattr010val055 (mood: "congiuntivo") + metaattr019val103 (tense: "congiuntivo-imperfetto") + metaattr014val061 (person: "seconda-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple") | (that) you had to | (that) you owed |
| 663 | dovesse | metaattr010val055 (mood: "congiuntivo") + metaattr019val103 (tense: "congiuntivo-imperfetto") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple") | (that) he/she had to | (that) he/she owed |
| 664 | dovessimo | metaattr010val055 (mood: "congiuntivo") + metaattr019val103 (tense: "congiuntivo-imperfetto") + metaattr014val060 (person: "prima-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple") | (that) we had to | (that) we owed |
| 665 | doveste | metaattr010val055 (mood: "congiuntivo") + metaattr019val103 (tense: "congiuntivo-imperfetto") + metaattr014val061 (person: "seconda-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple") | (that) you had to | (that) you owed |
| 666 | dovessero | metaattr010val055 (mood: "congiuntivo") + metaattr019val103 (tense: "congiuntivo-imperfetto") + metaattr014val062 (person: "terza-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple") | (that) they had to | (that) they owed |
| 667 | dovrei | metaattr010val056 (mood: "condizionale") + metaattr019val104 (tense: "condizionale-presente") + metaattr014val060 (person: "prima-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple") | I should/would have to | I would owe |
| 668 | dovresti | metaattr010val056 (mood: "condizionale") + metaattr019val104 (tense: "condizionale-presente") + metaattr014val061 (person: "seconda-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple") | you should/would have to | you would owe |
| 669 | dovrebbe | metaattr010val056 (mood: "condizionale") + metaattr019val104 (tense: "condizionale-presente") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple") | he/she should/would have to | he/she would owe |
| 670 | dovremmo | metaattr010val056 (mood: "condizionale") + metaattr019val104 (tense: "condizionale-presente") + metaattr014val060 (person: "prima-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple") | we should/would have to | we would owe |
| 671 | dovreste | metaattr010val056 (mood: "condizionale") + metaattr019val104 (tense: "condizionale-presente") + metaattr014val061 (person: "seconda-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple") | you should/would have to | you would owe |
| 672 | dovrebbero | metaattr010val056 (mood: "condizionale") + metaattr019val104 (tense: "condizionale-presente") + metaattr014val062 (person: "terza-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple") | they should/would have to | they would owe |
| 673 | (no form) | metaattr010val057 (mood: "imperativo") + metaattr019val105 (tense: "imperativo-presente") + metaattr014val060 (person: "prima-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple") | (no command form) | (no command form) |
| 674 | devi | metaattr010val057 (mood: "imperativo") + metaattr019val105 (tense: "imperativo-presente") + metaattr014val061 (person: "seconda-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple") | must! (rare) | owe! (rare) |
| 675 | deva | metaattr010val057 (mood: "imperativo") + metaattr019val105 (tense: "imperativo-presente") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val107 (verb_form_type: "simple") | let him/her have to! (rare) | let him/her owe! (rare) |
| 676 | dobbiamo | metaattr010val057 (mood: "imperativo") + metaattr019val105 (tense: "imperativo-presente") + metaattr014val060 (person: "prima-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple") | let's have to! (rare) | let's owe! (rare) |
| 677 | dovete | metaattr010val057 (mood: "imperativo") + metaattr019val105 (tense: "imperativo-presente") + metaattr014val061 (person: "seconda-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple") | must! (rare) | owe! (rare) |
| 678 | devano | metaattr010val057 (mood: "imperativo") + metaattr019val105 (tense: "imperativo-presente") + metaattr014val062 (person: "terza-persona") + metaattr012val055 (number: "plurale") + metaattr022val107 (verb_form_type: "simple") | let them have to! (rare) | let them owe! (rare) |
| 679 | dovere | metaattr010val058 (mood: "infinito") + metaattr019val106 (tense: "infinito-presente")  + metaattr022val107 (verb_form_type: "simple") | to have to/must | to owe |
| 680 | dovente | metaattr010val059 (mood: "participio") + metaattr019val107 (tense: "participio-presente")  + metaattr022val107 (verb_form_type: "simple") | having to | owing |
| 681 | dovuto | metaattr010val059 (mood: "participio") + metaattr019val108 (tense: "participio-passato")  + metaattr022val107 (verb_form_type: "simple") | had to | owed |
| 682 | dovendo | metaattr010val060 (mood: "gerundio") + metaattr019val109 (tense: "gerundio-presente")  + metaattr022val107 (verb_form_type: "simple") | having to | owing |

### Compound Forms with avere auxiliary (49 forms)

| Form ID | Form Text | Entity Meta Values | Translation Coverage 1 | Translation Coverage 2 |
|---------|-----------|-----------|---------------------|---------------------|
| 683 | ho dovuto | metaattr010val054 (mood: "indicativo") + metaattr019val110 (tense: "passato-prossimo") + metaattr014val060 (person: "prima-persona") + metaattr012val054 (number: "singolare") + metaattr022val108 (verb_form_type: "compound") | I have had to | I have owed |
| 684 | hai dovuto | metaattr010val054 (mood: "indicativo") + metaattr019val110 (tense: "passato-prossimo") + metaattr014val061 (person: "seconda-persona") + metaattr012val054 (number: "singolare") + metaattr022val108 (verb_form_type: "compound") | you have had to | you have owed |
| 685 | ha dovuto | metaattr010val054 (mood: "indicativo") + metaattr019val110 (tense: "passato-prossimo") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val108 (verb_form_type: "compound") | he/she has had to | he/she has owed |
| 686 | abbiamo dovuto | metaattr010val054 (mood: "indicativo") + metaattr019val110 (tense: "passato-prossimo") + metaattr014val060 (person: "prima-persona") + metaattr012val055 (number: "plurale") + metaattr022val108 (verb_form_type: "compound") | we have had to | we have owed |
| 687 | avete dovuto | metaattr010val054 (mood: "indicativo") + metaattr019val110 (tense: "passato-prossimo") + metaattr014val061 (person: "seconda-persona") + metaattr012val055 (number: "plurale") + metaattr022val108 (verb_form_type: "compound") | you have had to | you have owed |
| 688 | hanno dovuto | metaattr010val054 (mood: "indicativo") + metaattr019val110 (tense: "passato-prossimo") + metaattr014val062 (person: "terza-persona") + metaattr012val055 (number: "plurale") + metaattr022val108 (verb_form_type: "compound") | they have had to | they have owed |
| 689 | avevo dovuto | metaattr010val054 (mood: "indicativo") + metaattr019val111 (tense: "trapassato-prossimo") + metaattr014val060 (person: "prima-persona") + metaattr012val054 (number: "singolare") + metaattr022val108 (verb_form_type: "compound") | I had had to | I had owed |
| 690 | avevi dovuto | metaattr010val054 (mood: "indicativo") + metaattr019val111 (tense: "trapassato-prossimo") + metaattr014val061 (person: "seconda-persona") + metaattr012val054 (number: "singolare") + metaattr022val108 (verb_form_type: "compound") | you had had to | you had owed |
| 691 | aveva dovuto | metaattr010val054 (mood: "indicativo") + metaattr019val111 (tense: "trapassato-prossimo") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val108 (verb_form_type: "compound") | he/she had had to | he/she had owed |
| 692 | avevamo dovuto | metaattr010val054 (mood: "indicativo") + metaattr019val111 (tense: "trapassato-prossimo") + metaattr014val060 (person: "prima-persona") + metaattr012val055 (number: "plurale") + metaattr022val108 (verb_form_type: "compound") | we had had to | we had owed |
| 693 | avevate dovuto | metaattr010val054 (mood: "indicativo") + metaattr019val111 (tense: "trapassato-prossimo") + metaattr014val061 (person: "seconda-persona") + metaattr012val055 (number: "plurale") + metaattr022val108 (verb_form_type: "compound") | you had had to | you had owed |
| 694 | avevano dovuto | metaattr010val054 (mood: "indicativo") + metaattr019val111 (tense: "trapassato-prossimo") + metaattr014val062 (person: "terza-persona") + metaattr012val055 (number: "plurale") + metaattr022val108 (verb_form_type: "compound") | they had had to | they had owed |
| 695 | ebbi dovuto | metaattr010val054 (mood: "indicativo") + metaattr019val112 (tense: "trapassato-remoto") + metaattr014val060 (person: "prima-persona") + metaattr012val054 (number: "singolare") + metaattr022val108 (verb_form_type: "compound") | I had had to | I had owed |
| 696 | avesti dovuto | metaattr010val054 (mood: "indicativo") + metaattr019val112 (tense: "trapassato-remoto") + metaattr014val061 (person: "seconda-persona") + metaattr012val054 (number: "singolare") + metaattr022val108 (verb_form_type: "compound") | you had had to | you had owed |
| 697 | ebbe dovuto | metaattr010val054 (mood: "indicativo") + metaattr019val112 (tense: "trapassato-remoto") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val108 (verb_form_type: "compound") | he/she had had to | he/she had owed |
| 698 | avemmo dovuto | metaattr010val054 (mood: "indicativo") + metaattr019val112 (tense: "trapassato-remoto") + metaattr014val060 (person: "prima-persona") + metaattr012val055 (number: "plurale") + metaattr022val108 (verb_form_type: "compound") | we had had to | we had owed |
| 699 | aveste dovuto | metaattr010val054 (mood: "indicativo") + metaattr019val112 (tense: "trapassato-remoto") + metaattr014val061 (person: "seconda-persona") + metaattr012val055 (number: "plurale") + metaattr022val108 (verb_form_type: "compound") | you had had to | you had owed |
| 700 | ebbero dovuto | metaattr010val054 (mood: "indicativo") + metaattr019val112 (tense: "trapassato-remoto") + metaattr014val062 (person: "terza-persona") + metaattr012val055 (number: "plurale") + metaattr022val108 (verb_form_type: "compound") | they had had to | they had owed |
| 701 | avrò dovuto | metaattr010val054 (mood: "indicativo") + metaattr019val113 (tense: "futuro-anteriore") + metaattr014val060 (person: "prima-persona") + metaattr012val054 (number: "singolare") + metaattr022val108 (verb_form_type: "compound") | I will have had to | I will have owed |
| 702 | avrai dovuto | metaattr010val054 (mood: "indicativo") + metaattr019val113 (tense: "futuro-anteriore") + metaattr014val061 (person: "seconda-persona") + metaattr012val054 (number: "singolare") + metaattr022val108 (verb_form_type: "compound") | you will have had to | you will have owed |
| 703 | avrà dovuto | metaattr010val054 (mood: "indicativo") + metaattr019val113 (tense: "futuro-anteriore") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val108 (verb_form_type: "compound") | he/she will have had to | he/she will have owed |
| 704 | avremo dovuto | metaattr010val054 (mood: "indicativo") + metaattr019val113 (tense: "futuro-anteriore") + metaattr014val060 (person: "prima-persona") + metaattr012val055 (number: "plurale") + metaattr022val108 (verb_form_type: "compound") | we will have had to | we will have owed |
| 705 | avrete dovuto | metaattr010val054 (mood: "indicativo") + metaattr019val113 (tense: "futuro-anteriore") + metaattr014val061 (person: "seconda-persona") + metaattr012val055 (number: "plurale") + metaattr022val108 (verb_form_type: "compound") | you will have had to | you will have owed |
| 706 | avranno dovuto | metaattr010val054 (mood: "indicativo") + metaattr019val113 (tense: "futuro-anteriore") + metaattr014val062 (person: "terza-persona") + metaattr012val055 (number: "plurale") + metaattr022val108 (verb_form_type: "compound") | they will have had to | they will have owed |
| 707 | abbia dovuto | metaattr010val055 (mood: "congiuntivo") + metaattr019val114 (tense: "congiuntivo-passato") + metaattr014val060 (person: "prima-persona") + metaattr012val054 (number: "singolare") + metaattr022val108 (verb_form_type: "compound") | (that) I have had to | (that) I have owed |
| 708 | abbia dovuto | metaattr010val055 (mood: "congiuntivo") + metaattr019val114 (tense: "congiuntivo-passato") + metaattr014val061 (person: "seconda-persona") + metaattr012val054 (number: "singolare") + metaattr022val108 (verb_form_type: "compound") | (that) you have had to | (that) you have owed |
| 709 | abbia dovuto | metaattr010val055 (mood: "congiuntivo") + metaattr019val114 (tense: "congiuntivo-passato") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val108 (verb_form_type: "compound") | (that) he/she has had to | (that) he/she has owed |
| 710 | abbiamo dovuto | metaattr010val055 (mood: "congiuntivo") + metaattr019val114 (tense: "congiuntivo-passato") + metaattr014val060 (person: "prima-persona") + metaattr012val055 (number: "plurale") + metaattr022val108 (verb_form_type: "compound") | (that) we have had to | (that) we have owed |
| 711 | abbiate dovuto | metaattr010val055 (mood: "congiuntivo") + metaattr019val114 (tense: "congiuntivo-passato") + metaattr014val061 (person: "seconda-persona") + metaattr012val055 (number: "plurale") + metaattr022val108 (verb_form_type: "compound") | (that) you have had to | (that) you have owed |
| 712 | abbiano dovuto | metaattr010val055 (mood: "congiuntivo") + metaattr019val114 (tense: "congiuntivo-passato") + metaattr014val062 (person: "terza-persona") + metaattr012val055 (number: "plurale") + metaattr022val108 (verb_form_type: "compound") | (that) they have had to | (that) they have owed |
| 713 | avessi dovuto | metaattr010val055 (mood: "congiuntivo") + metaattr019val115 (tense: "congiuntivo-trapassato") + metaattr014val060 (person: "prima-persona") + metaattr012val054 (number: "singolare") + metaattr022val108 (verb_form_type: "compound") | (that) I had had to | (that) I had owed |
| 714 | avessi dovuto | metaattr010val055 (mood: "congiuntivo") + metaattr019val115 (tense: "congiuntivo-trapassato") + metaattr014val061 (person: "seconda-persona") + metaattr012val054 (number: "singolare") + metaattr022val108 (verb_form_type: "compound") | (that) you had had to | (that) you had owed |
| 715 | avesse dovuto | metaattr010val055 (mood: "congiuntivo") + metaattr019val115 (tense: "congiuntivo-trapassato") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val108 (verb_form_type: "compound") | (that) he/she had had to | (that) he/she had owed |
| 716 | avessimo dovuto | metaattr010val055 (mood: "congiuntivo") + metaattr019val115 (tense: "congiuntivo-trapassato") + metaattr014val060 (person: "prima-persona") + metaattr012val055 (number: "plurale") + metaattr022val108 (verb_form_type: "compound") | (that) we had had to | (that) we had owed |
| 717 | aveste dovuto | metaattr010val055 (mood: "congiuntivo") + metaattr019val115 (tense: "congiuntivo-trapassato") + metaattr014val061 (person: "seconda-persona") + metaattr012val055 (number: "plurale") + metaattr022val108 (verb_form_type: "compound") | (that) you had had to | (that) you had owed |
| 718 | avessero dovuto | metaattr010val055 (mood: "congiuntivo") + metaattr019val115 (tense: "congiuntivo-trapassato") + metaattr014val062 (person: "terza-persona") + metaattr012val055 (number: "plurale") + metaattr022val108 (verb_form_type: "compound") | (that) they had had to | (that) they had owed |
| 719 | avrei dovuto | metaattr010val056 (mood: "condizionale") + metaattr019val116 (tense: "condizionale-passato") + metaattr014val060 (person: "prima-persona") + metaattr012val054 (number: "singolare") + metaattr022val108 (verb_form_type: "compound") | I would have had to | I would have owed |
| 720 | avresti dovuto | metaattr010val056 (mood: "condizionale") + metaattr019val116 (tense: "condizionale-passato") + metaattr014val061 (person: "seconda-persona") + metaattr012val054 (number: "singolare") + metaattr022val108 (verb_form_type: "compound") | you would have had to | you would have owed |
| 721 | avrebbe dovuto | metaattr010val056 (mood: "condizionale") + metaattr019val116 (tense: "condizionale-passato") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val108 (verb_form_type: "compound") | he/she would have had to | he/she would have owed |
| 722 | avremmo dovuto | metaattr010val056 (mood: "condizionale") + metaattr019val116 (tense: "condizionale-passato") + metaattr014val060 (person: "prima-persona") + metaattr012val055 (number: "plurale") + metaattr022val108 (verb_form_type: "compound") | we would have had to | we would have owed |
| 723 | avreste dovuto | metaattr010val056 (mood: "condizionale") + metaattr019val116 (tense: "condizionale-passato") + metaattr014val061 (person: "seconda-persona") + metaattr012val055 (number: "plurale") + metaattr022val108 (verb_form_type: "compound") | you would have had to | you would have owed |
| 724 | avrebbero dovuto | metaattr010val056 (mood: "condizionale") + metaattr019val116 (tense: "condizionale-passato") + metaattr014val062 (person: "terza-persona") + metaattr012val055 (number: "plurale") + metaattr022val108 (verb_form_type: "compound") | they would have had to | they would have owed |
| 725 | abbi dovuto | metaattr010val057 (mood: "imperativo") + metaattr019val117 (tense: "imperativo-passato") + metaattr014val061 (person: "seconda-persona") + metaattr012val054 (number: "singolare") + metaattr022val108 (verb_form_type: "compound") | have had to! (rare) | have owed! (rare) |
| 726 | abbia dovuto | metaattr010val057 (mood: "imperativo") + metaattr019val117 (tense: "imperativo-passato") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val108 (verb_form_type: "compound") | let him/her have had to! (rare) | let him/her have owed! (rare) |
| 727 | abbiamo dovuto | metaattr010val057 (mood: "imperativo") + metaattr019val117 (tense: "imperativo-passato") + metaattr014val060 (person: "prima-persona") + metaattr012val055 (number: "plurale") + metaattr022val108 (verb_form_type: "compound") | let's have had to! (rare) | let's have owed! (rare) |
| 728 | abbiate dovuto | metaattr010val057 (mood: "imperativo") + metaattr019val117 (tense: "imperativo-passato") + metaattr014val061 (person: "seconda-persona") + metaattr012val055 (number: "plurale") + metaattr022val108 (verb_form_type: "compound") | have had to! (rare) | have owed! (rare) |
| 729 | abbiano dovuto | metaattr010val057 (mood: "imperativo") + metaattr019val117 (tense: "imperativo-passato") + metaattr014val062 (person: "terza-persona") + metaattr012val055 (number: "plurale") + metaattr022val108 (verb_form_type: "compound") | let them have had to! (rare) | let them have owed! (rare) |
| 730 | avendo dovuto | metaattr010val060 (mood: "gerundio") + metaattr019val118 (tense: "gerundio-passato")  + metaattr022val108 (verb_form_type: "compound") | having had to | having owed |
| 731 | aver dovuto | metaattr010val058 (mood: "infinito") + metaattr019val119 (tense: "infinito-passato")  + metaattr022val108 (verb_form_type: "compound") | to have had to | to have owed |

### Progressive Forms with stare auxiliary (37 forms)

| Form ID | Form Text | Entity Meta Values | Translation Coverage 1 | Translation Coverage 2 |
|---------|-----------|-----------|---------------------|---------------------|
| 732 | sto dovendo | metaattr010val054 (mood: "indicativo") + metaattr019val120 (tense: "presente-progressivo") + metaattr014val060 (person: "prima-persona") + metaattr012val054 (number: "singolare") + metaattr022val109 (verb_form_type: "progressive") | I am having to | I am owing |
| 733 | stai dovendo | metaattr010val054 (mood: "indicativo") + metaattr019val120 (tense: "presente-progressivo") + metaattr014val061 (person: "seconda-persona") + metaattr012val054 (number: "singolare") + metaattr022val109 (verb_form_type: "progressive") | you are having to | you are owing |
| 734 | sta dovendo | metaattr010val054 (mood: "indicativo") + metaattr019val120 (tense: "presente-progressivo") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val109 (verb_form_type: "progressive") | he/she is having to | he/she is owing |
| 735 | stiamo dovendo | metaattr010val054 (mood: "indicativo") + metaattr019val120 (tense: "presente-progressivo") + metaattr014val060 (person: "prima-persona") + metaattr012val055 (number: "plurale") + metaattr022val109 (verb_form_type: "progressive") | we are having to | we are owing |
| 736 | state dovendo | metaattr010val054 (mood: "indicativo") + metaattr019val120 (tense: "presente-progressivo") + metaattr014val061 (person: "seconda-persona") + metaattr012val055 (number: "plurale") + metaattr022val109 (verb_form_type: "progressive") | you are having to | you are owing |
| 737 | stanno dovendo | metaattr010val054 (mood: "indicativo") + metaattr019val120 (tense: "presente-progressivo") + metaattr014val062 (person: "terza-persona") + metaattr012val055 (number: "plurale") + metaattr022val109 (verb_form_type: "progressive") | they are having to | they are owing |
| 738 | stavo dovendo | metaattr010val054 (mood: "indicativo") + metaattr019val121 (tense: "passato-progressivo") + metaattr014val060 (person: "prima-persona") + metaattr012val054 (number: "singolare") + metaattr022val109 (verb_form_type: "progressive") | I was having to | I was owing |
| 739 | stavi dovendo | metaattr010val054 (mood: "indicativo") + metaattr019val121 (tense: "passato-progressivo") + metaattr014val061 (person: "seconda-persona") + metaattr012val054 (number: "singolare") + metaattr022val109 (verb_form_type: "progressive") | you were having to | you were owing |
| 740 | stava dovendo | metaattr010val054 (mood: "indicativo") + metaattr019val121 (tense: "passato-progressivo") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val109 (verb_form_type: "progressive") | he/she was having to | he/she was owing |
| 741 | stavamo dovendo | metaattr010val054 (mood: "indicativo") + metaattr019val121 (tense: "passato-progressivo") + metaattr014val060 (person: "prima-persona") + metaattr012val055 (number: "plurale") + metaattr022val109 (verb_form_type: "progressive") | we were having to | we were owing |
| 742 | stavate dovendo | metaattr010val054 (mood: "indicativo") + metaattr019val121 (tense: "passato-progressivo") + metaattr014val061 (person: "seconda-persona") + metaattr012val055 (number: "plurale") + metaattr022val109 (verb_form_type: "progressive") | you were having to | you were owing |
| 743 | stavano dovendo | metaattr010val054 (mood: "indicativo") + metaattr019val121 (tense: "passato-progressivo") + metaattr014val062 (person: "terza-persona") + metaattr012val055 (number: "plurale") + metaattr022val109 (verb_form_type: "progressive") | they were having to | they were owing |
| 744 | starò dovendo | metaattr010val054 (mood: "indicativo") + metaattr019val122 (tense: "futuro-progressivo") + metaattr014val060 (person: "prima-persona") + metaattr012val054 (number: "singolare") + metaattr022val109 (verb_form_type: "progressive") | I will be having to | I will be owing |
| 745 | starai dovendo | metaattr010val054 (mood: "indicativo") + metaattr019val122 (tense: "futuro-progressivo") + metaattr014val061 (person: "seconda-persona") + metaattr012val054 (number: "singolare") + metaattr022val109 (verb_form_type: "progressive") | you will be having to | you will be owing |
| 746 | starà dovendo | metaattr010val054 (mood: "indicativo") + metaattr019val122 (tense: "futuro-progressivo") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val109 (verb_form_type: "progressive") | he/she will be having to | he/she will be owing |
| 747 | staremo dovendo | metaattr010val054 (mood: "indicativo") + metaattr019val122 (tense: "futuro-progressivo") + metaattr014val060 (person: "prima-persona") + metaattr012val055 (number: "plurale") + metaattr022val109 (verb_form_type: "progressive") | we will be having to | we will be owing |
| 748 | starete dovendo | metaattr010val054 (mood: "indicativo") + metaattr019val122 (tense: "futuro-progressivo") + metaattr014val061 (person: "seconda-persona") + metaattr012val055 (number: "plurale") + metaattr022val109 (verb_form_type: "progressive") | you will be having to | you will be owing |
| 749 | staranno dovendo | metaattr010val054 (mood: "indicativo") + metaattr019val122 (tense: "futuro-progressivo") + metaattr014val062 (person: "terza-persona") + metaattr012val055 (number: "plurale") + metaattr022val109 (verb_form_type: "progressive") | they will be having to | they will be owing |
| 750 | stia dovendo | metaattr010val055 (mood: "congiuntivo") + metaattr019val123 (tense: "congiuntivo-presente-progressivo") + metaattr014val060 (person: "prima-persona") + metaattr012val054 (number: "singolare") + metaattr022val109 (verb_form_type: "progressive") | (that) I be having to | (that) I be owing |
| 751 | stia dovendo | metaattr010val055 (mood: "congiuntivo") + metaattr019val123 (tense: "congiuntivo-presente-progressivo") + metaattr014val061 (person: "seconda-persona") + metaattr012val054 (number: "singolare") + metaattr022val109 (verb_form_type: "progressive") | (that) you be having to | (that) you be owing |
| 752 | stia dovendo | metaattr010val055 (mood: "congiuntivo") + metaattr019val123 (tense: "congiuntivo-presente-progressivo") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val109 (verb_form_type: "progressive") | (that) he/she be having to | (that) he/she be owing |
| 753 | stiamo dovendo | metaattr010val055 (mood: "congiuntivo") + metaattr019val123 (tense: "congiuntivo-presente-progressivo") + metaattr014val060 (person: "prima-persona") + metaattr012val055 (number: "plurale") + metaattr022val109 (verb_form_type: "progressive") | (that) we be having to | (that) we be owing |
| 754 | stiate dovendo | metaattr010val055 (mood: "congiuntivo") + metaattr019val123 (tense: "congiuntivo-presente-progressivo") + metaattr014val061 (person: "seconda-persona") + metaattr012val055 (number: "plurale") + metaattr022val109 (verb_form_type: "progressive") | (that) you be having to | (that) you be owing |
| 755 | stiano dovendo | metaattr010val055 (mood: "congiuntivo") + metaattr019val123 (tense: "congiuntivo-presente-progressivo") + metaattr014val062 (person: "terza-persona") + metaattr012val055 (number: "plurale") + metaattr022val109 (verb_form_type: "progressive") | (that) they be having to | (that) they be owing |
| 756 | stessi dovendo | metaattr010val055 (mood: "congiuntivo") + metaattr019val124 (tense: "congiuntivo-imperfetto-progressivo") + metaattr014val060 (person: "prima-persona") + metaattr012val054 (number: "singolare") + metaattr022val109 (verb_form_type: "progressive") | (that) I were having to | (that) I were owing |
| 757 | stessi dovendo | metaattr010val055 (mood: "congiuntivo") + metaattr019val124 (tense: "congiuntivo-imperfetto-progressivo") + metaattr014val061 (person: "seconda-persona") + metaattr012val054 (number: "singolare") + metaattr022val109 (verb_form_type: "progressive") | (that) you were having to | (that) you were owing |
| 758 | stesse dovendo | metaattr010val055 (mood: "congiuntivo") + metaattr019val124 (tense: "congiuntivo-imperfetto-progressivo") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val109 (verb_form_type: "progressive") | (that) he/she were having to | (that) he/she were owing |
| 759 | stessimo dovendo | metaattr010val055 (mood: "congiuntivo") + metaattr019val124 (tense: "congiuntivo-imperfetto-progressivo") + metaattr014val060 (person: "prima-persona") + metaattr012val055 (number: "plurale") + metaattr022val109 (verb_form_type: "progressive") | (that) we were having to | (that) we were owing |
| 760 | steste dovendo | metaattr010val055 (mood: "congiuntivo") + metaattr019val124 (tense: "congiuntivo-imperfetto-progressivo") + metaattr014val061 (person: "seconda-persona") + metaattr012val055 (number: "plurale") + metaattr022val109 (verb_form_type: "progressive") | (that) you were having to | (that) you were owing |
| 761 | stessero dovendo | metaattr010val055 (mood: "congiuntivo") + metaattr019val124 (tense: "congiuntivo-imperfetto-progressivo") + metaattr014val062 (person: "terza-persona") + metaattr012val055 (number: "plurale") + metaattr022val109 (verb_form_type: "progressive") | (that) they were having to | (that) they were owing |
| 762 | starei dovendo | metaattr010val056 (mood: "condizionale") + metaattr019val125 (tense: "condizionale-progressivo") + metaattr014val060 (person: "prima-persona") + metaattr012val054 (number: "singolare") + metaattr022val109 (verb_form_type: "progressive") | I would be having to | I would be owing |
| 763 | staresti dovendo | metaattr010val056 (mood: "condizionale") + metaattr019val125 (tense: "condizionale-progressivo") + metaattr014val061 (person: "seconda-persona") + metaattr012val054 (number: "singolare") + metaattr022val109 (verb_form_type: "progressive") | you would be having to | you would be owing |
| 764 | starebbe dovendo | metaattr010val056 (mood: "condizionale") + metaattr019val125 (tense: "condizionale-progressivo") + metaattr014val062 (person: "terza-persona") + metaattr012val054 (number: "singolare") + metaattr022val109 (verb_form_type: "progressive") | he/she would be having to | he/she would be owing |
| 765 | staremmo dovendo | metaattr010val056 (mood: "condizionale") + metaattr019val125 (tense: "condizionale-progressivo") + metaattr014val060 (person: "prima-persona") + metaattr012val055 (number: "plurale") + metaattr022val109 (verb_form_type: "progressive") | we would be having to | we would be owing |
| 766 | stareste dovendo | metaattr010val056 (mood: "condizionale") + metaattr019val125 (tense: "condizionale-progressivo") + metaattr014val061 (person: "seconda-persona") + metaattr012val055 (number: "plurale") + metaattr022val109 (verb_form_type: "progressive") | you would be having to | you would be owing |
| 767 | starebbero dovendo | metaattr010val056 (mood: "condizionale") + metaattr019val125 (tense: "condizionale-progressivo") + metaattr014val062 (person: "terza-persona") + metaattr012val055 (number: "plurale") + metaattr022val109 (verb_form_type: "progressive") | they would be having to | they would be owing |
| 768 | stando dovendo | metaattr010val060 (mood: "gerundio") + metaattr019val126 (tense: "gerundio-progressivo")  + metaattr022val109 (verb_form_type: "progressive") | being having to | being owing |

## Form_Translations Coverage

**Dual Translation Coverage**: All 137 forms link to both translations with specific contextual usage:

### Translation 1: "must/have to" (Modal Usage)
- **Coverage**: All forms support modal meaning expressing necessity/obligation
- **Usage Context**: With infinitive complements or absolute usage
- **Examples**: "devo mangiare" (I must eat), "ho dovuto partire" (I had to leave)

### Translation 2: "to owe" (Transitive Usage)  
- **Coverage**: All forms support transitive meaning expressing debt/obligation
- **Usage Context**: With direct objects or indirect object constructions
- **Examples**: "devo cento euro" (I owe one hundred euros), "gli devo un favore" (I owe him a favor)

## Architectural Significance

Section 8.4 demonstrates the most complex verb architecture in the Misti system:

1. **Modal Verb Complexity**: Dual semantic functions requiring separate translation coverage
2. **Auxiliary Selection**: Inherits auxiliary from complement verb type in modal usage
3. **Complete Form Generation**: All 137 forms exist with dual translation potential
4. **Translation-Level Metadata**: Verb type classification moved from word-level to translation-level
5. **Database Architecture**: Requires sophisticated handling of dual meanings and auxiliary inheritance

This complete inventory serves as the definitive reference for implementing modal verb architecture with dual semantic meanings in the Misti database, demonstrating how complex Italian modal verbs require specialized database design patterns.