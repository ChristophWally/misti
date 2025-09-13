# Section 8.7: Complete Forms for "Piovere" (To Rain) - Weather Verb Architecture

## Overview

**Verb**: piovere (to rain / to rain down)
**Type**: Weather verb with dual usage patterns
**Total Forms**: ~67 individual conjugations
**Key Restriction**: Primarily 3rd person usage with semantic constraints

### Usage Patterns
1. **Literal (meteorological)**: "to rain" - 3rd person singular only
2. **Metaphorical**: "to rain down" - 3rd person plural allowed (rare but valid)

---

## Simple Forms (18 forms)

### Present Indicative (6 forms)
```sql
-- 1st person singular (metaphorical only)
INSERT INTO VerbConjugations VALUES (
    'piovo', 'piovere', 'present', 'indicative', 'active', 'first', 'singular',
    'I rain down (metaphorical)',
    'metaattr021val125,metaattr013val131'  -- meteorological-verb, metaphorical-extension
);

-- 2nd person singular (metaphorical only)
INSERT INTO VerbConjugations VALUES (
    'piovi', 'piovere', 'present', 'indicative', 'active', 'second', 'singular',
    'you rain down (metaphorical)',
    'metaattr021val125,metaattr013val131'
);

-- 3rd person singular (PRIMARY USAGE - literal)
INSERT INTO VerbConjugations VALUES (
    'piove', 'piovere', 'present', 'indicative', 'active', 'third', 'singular',
    'it rains',
    'metaattr021val125,metaattr013val130'  -- meteorological-verb, third-singular-only
);

-- 1st person plural (metaphorical only)
INSERT INTO VerbConjugations VALUES (
    'pioviamo', 'piovere', 'present', 'indicative', 'active', 'first', 'plural',
    'we rain down (metaphorical)',
    'metaattr021val125,metaattr013val131'
);

-- 2nd person plural (metaphorical only)
INSERT INTO VerbConjugations VALUES (
    'piovete', 'piovere', 'present', 'indicative', 'active', 'second', 'plural',
    'you rain down (metaphorical)',
    'metaattr021val125,metaattr013val131'
);

-- 3rd person plural (metaphorical extension)
INSERT INTO VerbConjugations VALUES (
    'piovono', 'piovere', 'present', 'indicative', 'active', 'third', 'plural',
    'they rain down (metaphorical)',
    'metaattr021val125,metaattr013val131'
);
```

### Imperfect Indicative (6 forms)
```sql
-- 1st person singular
INSERT INTO VerbConjugations VALUES (
    'piovevo', 'piovere', 'imperfect', 'indicative', 'active', 'first', 'singular',
    'I was raining down (metaphorical)',
    'metaattr021val125,metaattr013val131'
);

-- 2nd person singular
INSERT INTO VerbConjugations VALUES (
    'piovevi', 'piovere', 'imperfect', 'indicative', 'active', 'second', 'singular',
    'you were raining down (metaphorical)',
    'metaattr021val125,metaattr013val131'
);

-- 3rd person singular (PRIMARY)
INSERT INTO VerbConjugations VALUES (
    'pioveva', 'piovere', 'imperfect', 'indicative', 'active', 'third', 'singular',
    'it was raining',
    'metaattr021val125,metaattr013val130'
);

-- 1st person plural
INSERT INTO VerbConjugations VALUES (
    'piovevamo', 'piovere', 'imperfect', 'indicative', 'active', 'first', 'plural',
    'we were raining down (metaphorical)',
    'metaattr021val125,metaattr013val131'
);

-- 2nd person plural
INSERT INTO VerbConjugations VALUES (
    'piovevate', 'piovere', 'imperfect', 'indicative', 'active', 'second', 'plural',
    'you were raining down (metaphorical)',
    'metaattr021val125,metaattr013val131'
);

-- 3rd person plural
INSERT INTO VerbConjugations VALUES (
    'piovevano', 'piovere', 'imperfect', 'indicative', 'active', 'third', 'plural',
    'they were raining down (metaphorical)',
    'metaattr021val125,metaattr013val131'
);
```

### Future Simple (6 forms)
```sql
-- 1st person singular
INSERT INTO VerbConjugations VALUES (
    'pioverò', 'piovere', 'future', 'indicative', 'active', 'first', 'singular',
    'I will rain down (metaphorical)',
    'metaattr021val125,metaattr013val131'
);

-- 2nd person singular
INSERT INTO VerbConjugations VALUES (
    'pioverai', 'piovere', 'future', 'indicative', 'active', 'second', 'singular',
    'you will rain down (metaphorical)',
    'metaattr021val125,metaattr013val131'
);

-- 3rd person singular (PRIMARY)
INSERT INTO VerbConjugations VALUES (
    'pioverà', 'piovere', 'future', 'indicative', 'active', 'third', 'singular',
    'it will rain',
    'metaattr021val125,metaattr013val130'
);

-- 1st person plural
INSERT INTO VerbConjugations VALUES (
    'pioveremo', 'piovere', 'future', 'indicative', 'active', 'first', 'plural',
    'we will rain down (metaphorical)',
    'metaattr021val125,metaattr013val131'
);

-- 2nd person plural
INSERT INTO VerbConjugations VALUES (
    'pioverete', 'piovere', 'future', 'indicative', 'active', 'second', 'plural',
    'you will rain down (metaphorical)',
    'metaattr021val125,metaattr013val131'
);

-- 3rd person plural
INSERT INTO VerbConjugations VALUES (
    'pioveranno', 'piovere', 'future', 'indicative', 'active', 'third', 'plural',
    'they will rain down (metaphorical)',
    'metaattr021val125,metaattr013val131'
);
```

---

## Compound Past Forms (12 forms)

### Present Perfect (6 forms)
```sql
-- 1st person singular (with essere)
INSERT INTO VerbConjugations VALUES (
    'sono piovuto/a', 'piovere', 'present_perfect', 'indicative', 'active', 'first', 'singular',
    'I have rained down (metaphorical)',
    'metaattr021val125,metaattr013val131,metaattr007val089'  -- with-essere
);

-- 2nd person singular (with essere)
INSERT INTO VerbConjugations VALUES (
    'sei piovuto/a', 'piovere', 'present_perfect', 'indicative', 'active', 'second', 'singular',
    'you have rained down (metaphorical)',
    'metaattr021val125,metaattr013val131,metaattr007val089'
);

-- 3rd person singular (PRIMARY - with essere)
INSERT INTO VerbConjugations VALUES (
    'è piovuto', 'piovere', 'present_perfect', 'indicative', 'active', 'third', 'singular',
    'it has rained',
    'metaattr021val125,metaattr013val130,metaattr007val089'
);

-- 1st person plural (with essere)
INSERT INTO VerbConjugations VALUES (
    'siamo piovuti/e', 'piovere', 'present_perfect', 'indicative', 'active', 'first', 'plural',
    'we have rained down (metaphorical)',
    'metaattr021val125,metaattr013val131,metaattr007val089'
);

-- 2nd person plural (with essere)
INSERT INTO VerbConjugations VALUES (
    'siete piovuti/e', 'piovere', 'present_perfect', 'indicative', 'active', 'second', 'plural',
    'you have rained down (metaphorical)',
    'metaattr021val125,metaattr013val131,metaattr007val089'
);

-- 3rd person plural (with essere)
INSERT INTO VerbConjugations VALUES (
    'sono piovuti', 'piovere', 'present_perfect', 'indicative', 'active', 'third', 'plural',
    'they have rained down (metaphorical)',
    'metaattr021val125,metaattr013val131,metaattr007val089'
);
```

### Pluperfect (6 forms)
```sql
-- 1st person singular
INSERT INTO VerbConjugations VALUES (
    'ero piovuto/a', 'piovere', 'pluperfect', 'indicative', 'active', 'first', 'singular',
    'I had rained down (metaphorical)',
    'metaattr021val125,metaattr013val131,metaattr007val089'
);

-- 2nd person singular
INSERT INTO VerbConjugations VALUES (
    'eri piovuto/a', 'piovere', 'pluperfect', 'indicative', 'active', 'second', 'singular',
    'you had rained down (metaphorical)',
    'metaattr021val125,metaattr013val131,metaattr007val089'
);

-- 3rd person singular (PRIMARY)
INSERT INTO VerbConjugations VALUES (
    'era piovuto', 'piovere', 'pluperfect', 'indicative', 'active', 'third', 'singular',
    'it had rained',
    'metaattr021val125,metaattr013val130,metaattr007val089'
);

-- 1st person plural
INSERT INTO VerbConjugations VALUES (
    'eravamo piovuti/e', 'piovere', 'pluperfect', 'indicative', 'active', 'first', 'plural',
    'we had rained down (metaphorical)',
    'metaattr021val125,metaattr013val131,metaattr007val089'
);

-- 2nd person plural
INSERT INTO VerbConjugations VALUES (
    'eravate piovuti/e', 'piovere', 'pluperfect', 'indicative', 'active', 'second', 'plural',
    'you had rained down (metaphorical)',
    'metaattr021val125,metaattr013val131,metaattr007val089'
);

-- 3rd person plural
INSERT INTO VerbConjugations VALUES (
    'erano piovuti', 'piovere', 'pluperfect', 'indicative', 'active', 'third', 'plural',
    'they had rained down (metaphorical)',
    'metaattr021val125,metaattr013val131,metaattr007val089'
);
```

---

## Conditional Forms (12 forms)

### Present Conditional (6 forms)
```sql
-- 1st person singular
INSERT INTO VerbConjugations VALUES (
    'pioverei', 'piovere', 'conditional', 'conditional', 'active', 'first', 'singular',
    'I would rain down (metaphorical)',
    'metaattr021val125,metaattr013val131'
);

-- 2nd person singular
INSERT INTO VerbConjugations VALUES (
    'pioveresti', 'piovere', 'conditional', 'conditional', 'active', 'second', 'singular',
    'you would rain down (metaphorical)',
    'metaattr021val125,metaattr013val131'
);

-- 3rd person singular (PRIMARY)
INSERT INTO VerbConjugations VALUES (
    'pioverebbe', 'piovere', 'conditional', 'conditional', 'active', 'third', 'singular',
    'it would rain',
    'metaattr021val125,metaattr013val130'
);

-- 1st person plural
INSERT INTO VerbConjugations VALUES (
    'pioveremmo', 'piovere', 'conditional', 'conditional', 'active', 'first', 'plural',
    'we would rain down (metaphorical)',
    'metaattr021val125,metaattr013val131'
);

-- 2nd person plural
INSERT INTO VerbConjugations VALUES (
    'piovereste', 'piovere', 'conditional', 'conditional', 'active', 'second', 'plural',
    'you would rain down (metaphorical)',
    'metaattr021val125,metaattr013val131'
);

-- 3rd person plural
INSERT INTO VerbConjugations VALUES (
    'pioverebbero', 'piovere', 'conditional', 'conditional', 'active', 'third', 'plural',
    'they would rain down (metaphorical)',
    'metaattr021val125,metaattr013val131'
);
```

### Conditional Perfect (6 forms)
```sql
-- 1st person singular
INSERT INTO VerbConjugations VALUES (
    'sarei piovuto/a', 'piovere', 'conditional_perfect', 'conditional', 'active', 'first', 'singular',
    'I would have rained down (metaphorical)',
    'metaattr021val125,metaattr013val131,metaattr007val089'
);

-- 2nd person singular
INSERT INTO VerbConjugations VALUES (
    'saresti piovuto/a', 'piovere', 'conditional_perfect', 'conditional', 'active', 'second', 'singular',
    'you would have rained down (metaphorical)',
    'metaattr021val125,metaattr013val131,metaattr007val089'
);

-- 3rd person singular (PRIMARY)
INSERT INTO VerbConjugations VALUES (
    'sarebbe piovuto', 'piovere', 'conditional_perfect', 'conditional', 'active', 'third', 'singular',
    'it would have rained',
    'metaattr021val125,metaattr013val130,metaattr007val089'
);

-- 1st person plural
INSERT INTO VerbConjugations VALUES (
    'saremmo piovuti/e', 'piovere', 'conditional_perfect', 'conditional', 'active', 'first', 'plural',
    'we would have rained down (metaphorical)',
    'metaattr021val125,metaattr013val131,metaattr007val089'
);

-- 2nd person plural
INSERT INTO VerbConjugations VALUES (
    'sareste piovuti/e', 'piovere', 'conditional_perfect', 'conditional', 'active', 'second', 'plural',
    'you would have rained down (metaphorical)',
    'metaattr021val125,metaattr013val131,metaattr007val089'
);

-- 3rd person plural
INSERT INTO VerbConjugations VALUES (
    'sarebbero piovuti', 'piovere', 'conditional_perfect', 'conditional', 'active', 'third', 'plural',
    'they would have rained down (metaphorical)',
    'metaattr021val125,metaattr013val131,metaattr007val089'
);
```

---

## Subjunctive Forms (12 forms)

### Present Subjunctive (6 forms)
```sql
-- 1st person singular
INSERT INTO VerbConjugations VALUES (
    'piova', 'piovere', 'present', 'subjunctive', 'active', 'first', 'singular',
    'that I rain down (metaphorical)',
    'metaattr021val125,metaattr013val131'
);

-- 2nd person singular
INSERT INTO VerbConjugations VALUES (
    'piova', 'piovere', 'present', 'subjunctive', 'active', 'second', 'singular',
    'that you rain down (metaphorical)',
    'metaattr021val125,metaattr013val131'
);

-- 3rd person singular (PRIMARY)
INSERT INTO VerbConjugations VALUES (
    'piova', 'piovere', 'present', 'subjunctive', 'active', 'third', 'singular',
    'that it rain',
    'metaattr021val125,metaattr013val130'
);

-- 1st person plural
INSERT INTO VerbConjugations VALUES (
    'pioviamo', 'piovere', 'present', 'subjunctive', 'active', 'first', 'plural',
    'that we rain down (metaphorical)',
    'metaattr021val125,metaattr013val131'
);

-- 2nd person plural
INSERT INTO VerbConjugations VALUES (
    'pioviate', 'piovere', 'present', 'subjunctive', 'active', 'second', 'plural',
    'that you rain down (metaphorical)',
    'metaattr021val125,metaattr013val131'
);

-- 3rd person plural
INSERT INTO VerbConjugations VALUES (
    'piovano', 'piovere', 'present', 'subjunctive', 'active', 'third', 'plural',
    'that they rain down (metaphorical)',
    'metaattr021val125,metaattr013val131'
);
```

### Imperfect Subjunctive (6 forms)
```sql
-- 1st person singular
INSERT INTO VerbConjugations VALUES (
    'piovessi', 'piovere', 'imperfect', 'subjunctive', 'active', 'first', 'singular',
    'that I rained down (metaphorical)',
    'metaattr021val125,metaattr013val131'
);

-- 2nd person singular
INSERT INTO VerbConjugations VALUES (
    'piovessi', 'piovere', 'imperfect', 'subjunctive', 'active', 'second', 'singular',
    'that you rained down (metaphorical)',
    'metaattr021val125,metaattr013val131'
);

-- 3rd person singular (PRIMARY)
INSERT INTO VerbConjugations VALUES (
    'piovesse', 'piovere', 'imperfect', 'subjunctive', 'active', 'third', 'singular',
    'that it rained',
    'metaattr021val125,metaattr013val130'
);

-- 1st person plural
INSERT INTO VerbConjugations VALUES (
    'piovessimo', 'piovere', 'imperfect', 'subjunctive', 'active', 'first', 'plural',
    'that we rained down (metaphorical)',
    'metaattr021val125,metaattr013val131'
);

-- 2nd person plural
INSERT INTO VerbConjugations VALUES (
    'pioveste', 'piovere', 'imperfect', 'subjunctive', 'active', 'second', 'plural',
    'that you rained down (metaphorical)',
    'metaattr021val125,metaattr013val131'
);

-- 3rd person plural
INSERT INTO VerbConjugations VALUES (
    'piovessero', 'piovere', 'imperfect', 'subjunctive', 'active', 'third', 'plural',
    'that they rained down (metaphorical)',
    'metaattr021val125,metaattr013val131'
);
```

---

## Progressive Forms (12 forms)

### Present Progressive (6 forms)
```sql
-- 1st person singular
INSERT INTO VerbConjugations VALUES (
    'sto piovendo', 'piovere', 'present_progressive', 'indicative', 'active', 'first', 'singular',
    'I am raining down (metaphorical)',
    'metaattr021val125,metaattr013val131,metaattr008val092'  -- progressive-form
);

-- 2nd person singular
INSERT INTO VerbConjugations VALUES (
    'stai piovendo', 'piovere', 'present_progressive', 'indicative', 'active', 'second', 'singular',
    'you are raining down (metaphorical)',
    'metaattr021val125,metaattr013val131,metaattr008val092'
);

-- 3rd person singular (PRIMARY)
INSERT INTO VerbConjugations VALUES (
    'sta piovendo', 'piovere', 'present_progressive', 'indicative', 'active', 'third', 'singular',
    'it is raining',
    'metaattr021val125,metaattr013val130,metaattr008val092'
);

-- 1st person plural
INSERT INTO VerbConjugations VALUES (
    'stiamo piovendo', 'piovere', 'present_progressive', 'indicative', 'active', 'first', 'plural',
    'we are raining down (metaphorical)',
    'metaattr021val125,metaattr013val131,metaattr008val092'
);

-- 2nd person plural
INSERT INTO VerbConjugations VALUES (
    'state piovendo', 'piovere', 'present_progressive', 'indicative', 'active', 'second', 'plural',
    'you are raining down (metaphorical)',
    'metaattr021val125,metaattr013val131,metaattr008val092'
);

-- 3rd person plural
INSERT INTO VerbConjugations VALUES (
    'stanno piovendo', 'piovere', 'present_progressive', 'indicative', 'active', 'third', 'plural',
    'they are raining down (metaphorical)',
    'metaattr021val125,metaattr013val131,metaattr008val092'
);
```

### Past Progressive (6 forms)
```sql
-- 1st person singular
INSERT INTO VerbConjugations VALUES (
    'stavo piovendo', 'piovere', 'past_progressive', 'indicative', 'active', 'first', 'singular',
    'I was raining down (metaphorical)',
    'metaattr021val125,metaattr013val131,metaattr008val092'
);

-- 2nd person singular
INSERT INTO VerbConjugations VALUES (
    'stavi piovendo', 'piovere', 'past_progressive', 'indicative', 'active', 'second', 'singular',
    'you were raining down (metaphorical)',
    'metaattr021val125,metaattr013val131,metaattr008val092'
);

-- 3rd person singular (PRIMARY)
INSERT INTO VerbConjugations VALUES (
    'stava piovendo', 'piovere', 'past_progressive', 'indicative', 'active', 'third', 'singular',
    'it was raining',
    'metaattr021val125,metaattr013val130,metaattr008val092'
);

-- 1st person plural
INSERT INTO VerbConjugations VALUES (
    'stavamo piovendo', 'piovere', 'past_progressive', 'indicative', 'active', 'first', 'plural',
    'we were raining down (metaphorical)',
    'metaattr021val125,metaattr013val131,metaattr008val092'
);

-- 2nd person plural
INSERT INTO VerbConjugations VALUES (
    'stavate piovendo', 'piovere', 'past_progressive', 'indicative', 'active', 'second', 'plural',
    'you were raining down (metaphorical)',
    'metaattr021val125,metaattr013val131,metaattr008val092'
);

-- 3rd person plural
INSERT INTO VerbConjugations VALUES (
    'stavano piovendo', 'piovere', 'past_progressive', 'indicative', 'active', 'third', 'plural',
    'they were raining down (metaphorical)',
    'metaattr021val125,metaattr013val131,metaattr008val092'
);
```

---

## Imperative Forms (5 forms)

```sql
-- 2nd person singular
INSERT INTO VerbConjugations VALUES (
    'piovi', 'piovere', 'imperative', 'imperative', 'active', 'second', 'singular',
    'rain down! (metaphorical)',
    'metaattr021val125,metaattr013val131'
);

-- 3rd person singular (formal "Lei")
INSERT INTO VerbConjugations VALUES (
    'piova', 'piovere', 'imperative', 'imperative', 'active', 'third', 'singular',
    'let it rain! / rain down! (formal)',
    'metaattr021val125,metaattr013val130'  -- can be literal or metaphorical
);

-- 1st person plural
INSERT INTO VerbConjugations VALUES (
    'pioviamo', 'piovere', 'imperative', 'imperative', 'active', 'first', 'plural',
    'let us rain down! (metaphorical)',
    'metaattr021val125,metaattr013val131'
);

-- 2nd person plural
INSERT INTO VerbConjugations VALUES (
    'piovete', 'piovere', 'imperative', 'imperative', 'active', 'second', 'plural',
    'rain down! (metaphorical)',
    'metaattr021val125,metaattr013val131'
);

-- 3rd person plural (formal "Loro")
INSERT INTO VerbConjugations VALUES (
    'piovano', 'piovere', 'imperative', 'imperative', 'active', 'third', 'plural',
    'let them rain down! (formal)',
    'metaattr021val125,metaattr013val131'
);
```

---

## Non-Finite Forms (5 forms)

```sql
-- Infinitive
INSERT INTO VerbConjugations VALUES (
    'piovere', 'piovere', 'infinitive', NULL, 'active', NULL, NULL,
    'to rain / to rain down',
    'metaattr021val125,metaattr013val130'
);

-- Present Participle
INSERT INTO VerbConjugations VALUES (
    'piovente', 'piovere', 'present_participle', NULL, 'active', NULL, NULL,
    'raining / raining down',
    'metaattr021val125,metaattr013val130'
);

-- Past Participle
INSERT INTO VerbConjugations VALUES (
    'piovuto', 'piovere', 'past_participle', NULL, 'active', NULL, NULL,
    'rained / rained down',
    'metaattr021val125,metaattr013val130'
);

-- Gerund
INSERT INTO VerbConjugations VALUES (
    'piovendo', 'piovere', 'gerund', NULL, 'active', NULL, NULL,
    'raining / raining down',
    'metaattr021val125,metaattr013val130'
);

-- Past Gerund
INSERT INTO VerbConjugations VALUES (
    'essendo piovuto', 'piovere', 'past_gerund', NULL, 'active', NULL, NULL,
    'having rained / having rained down',
    'metaattr021val125,metaattr013val130,metaattr007val089'
);
```

---

## Architecture Summary

**Total Forms**: 67 individual conjugations

### Form Distribution:
- **Simple Forms**: 18 (Present, Imperfect, Future)
- **Compound Forms**: 12 (Present Perfect, Pluperfect) 
- **Conditional Forms**: 12 (Present, Perfect)
- **Subjunctive Forms**: 12 (Present, Imperfect)
- **Progressive Forms**: 12 (Present, Past)
- **Imperative Forms**: 5 
- **Non-Finite Forms**: 5

### Key Meta Attributes:
- **metaattr021val125**: meteorological-verb (all forms)
- **metaattr013val130**: third-singular-only (literal usage)
- **metaattr013val131**: metaphorical-extension (non-literal usage)
- **metaattr007val089**: with-essere auxiliary
- **metaattr008val092**: progressive-form marker

### Usage Restrictions:
1. **Primary Usage**: 3rd person singular for literal meteorological meaning
2. **Extended Usage**: Other persons for metaphorical "rain down" meaning
3. **Auxiliary**: Uses "essere" for all compound forms
4. **Agreement**: Past participle agrees with subject in compound forms

This weather verb architecture demonstrates the most restricted conjugation pattern in Italian, showing how natural phenomena verbs function within database systems with semantic constraints.