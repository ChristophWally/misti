-- Matrix v5 metadata/rules alignment
-- Generated on 2026-03-14 from /Users/Work/misti/documentation/KAKKI python migration tools/phase1_output_v2/tag analysis/tag csv matrix 5.csv

-- 1) Expand metaval_rules word_type domain for current and planned word types
do $$
begin
  if exists (
    select 1
    from pg_constraint
    where conrelid = 'public.metaval_rules'::regclass
      and conname = 'metaval_rules_word_type_check'
  ) then
    alter table public.metaval_rules drop constraint metaval_rules_word_type_check;
  end if;

  alter table public.metaval_rules
    add constraint metaval_rules_word_type_check
    check (
      word_type = any (array[
        'noun'::text,
        'verb'::text,
        'adjective'::text,
        'adverb'::text,
        'preposition'::text,
        'pronoun'::text,
        'determiner'::text,
        'conjunction'::text,
        'interjection'::text,
        'phrase'::text,
        'abbreviation'::text,
        'affix'::text,
        'symbol'::text
      ])
    );
end $$;

-- 2) Ensure all matrix attributes exist and align source levels
with matrix_levels(attribute, source_level, description) as (
  values
    ('adjective_type', 'word', 'High-level class of adjective for learning and grammar behaviour (quality vs fixed comparative vs relational/category adjectives).'),
    ('adverb_type', 'word,form', 'Functional/semantic class of adverb (time/place/manner/etc.) used to organise and tag adverbs for learning.'),
    ('article_pattern', 'translation', 'How articles behave for a noun *in this sense* (e.g., article required, no article, optional), used to teach natural noun usage.'),
    ('auxiliary', 'translation', 'Which auxiliary (avere/essere) a verb sense uses to form compound tenses. Stored at sense level because some verbs are polysemous.'),
    ('case', 'word,form', 'For pronouns: which grammatical case a specific form represents in the model (subject, object, etc.).'),
    ('case_system', 'word,form', 'For pronouns: which case distinctions exist for the lemma (only subject vs a fuller set of object cases).'),
    ('cefr_level', 'word', 'The CEFR difficulty level for the lemma (A1–C2), used to group vocabulary by learner proficiency. This is populated from curated lists, not inferred by AI.'),
    ('cefr_tier', 'word', 'A flag that explains whether the CEFR tag is foundational (“core”) or supplementary (“extended”) for that level. Used to separate must‑have vocabulary from extra coverage.'),
    ('clitic_availability', 'word,form', 'Whether/what kind of clitic attachment is typical/possible for the item (mainly for adverbs/particles in this dataset).'),
    ('conjugation_type', 'word', 'Verb conjugation class based on the infinitive ending (‑are/‑ere/‑ire/‑ire‑isc), used for form generation and grouping.'),
    ('conjunction_type', 'word,form', 'The syntactic class of conjunction (coordinating/subordinating/correlative), used to organise conjunctions.'),
    ('countable', 'translation', 'For nouns: whether the noun is normally countable (has a normal plural) or uncountable/mass in its usual sense.'),
    ('determiner_type', 'word,form', 'Functional class of determiner (article, demonstrative, possessive, quantifier, etc.), used to organise and tag determiners.'),
    ('emotional_tone', 'word,form', 'For interjections: the general emotional polarity/tone (positive, negative, surprise, etc.) to support pedagogy and filtering.'),
    ('expression_variant', 'form', 'For interjections/forms: the orthographic variant type (base, exclamatory, repeated, lengthened, etc.).'),
    ('expression_type', 'word', 'Learner-facing orthographic structure label for entries (single word vs multiword expression). This is structural metadata and does not change POS classification.'),
    ('form_irregular', 'form', 'Flags an inflected/variant form that a learner cannot reliably predict from the lemma using the default rules for that word type. Use this when a form must be memorized or selected as an allomorph (e.g., bel/bello/bell'' for bello). Do NOT use this for regular agreement (gender/number endings) or for productive gradation (-issimo), even if the surface string differs.'),
    ('form_pattern', 'word', 'For adjectives: the agreement pattern describing how many distinct forms exist across gender/number (2-form/4-form/invariable, etc.).'),
    ('frequency_rank', 'word', 'A coarse bucket for how frequent the lemma is in a corpus (top100/top500/etc.). Used to prioritise learning and ordering.'),
    ('frequency_tier', 'word', 'A pedagogical frequency band (very-common → very-rare) derived from corpus rank thresholds. Used for learning prioritisation.'),
    ('gender', 'word,form', 'Grammatical gender of the lemma or form (masculine/feminine/common-gender), used for agreement and article selection.'),
    ('gender_usage', 'translation', 'For an English translation choice: whether it is restricted to male/female referents or works for mixed/unspecified referents

Be particularly careful with this one, the translation and it’s synonyms have to ALL be restricted by it’s use.'),
    ('government', 'translation', 'Which preposition a specific sense commonly selects when it takes a complement (e.g., parlare di…, andare a…). This helps learners form natural collocations.'),
    ('gradable', 'translation', 'Whether an adjective can normally be compared (more/most) and how comparison is typically formed.'),
    ('interjection_type', 'translation', 'For interjections: what kind of interjection it is (greeting, exclamation, cultural phrase), used for organisation and UX.'),
    ('interrogative_function', 'translation', 'For question words: what kind of information the word asks for (person, thing, place, time, reason, etc.).'),
    ('logical_relationship', 'word,form', 'For conjunctions: the discourse relation expressed (addition, contrast, cause, condition, time, etc.).'),
    ('mood', 'form', 'For verb forms: the grammatical mood (indicative/subjunctive/conditional/imperative/non-finite). Often derived from tense.'),
    ('noun_type', 'word,form', 'Whether a noun is a common noun or a proper noun (a name), used to drive other dependent tags like proper_noun_type.'),
    ('number', 'word,form', 'Grammatical number marking whether a lemma or form is singular or plural. Used for agreement and for handling plural‑only/singular‑only items.'),
    ('particle_function', 'word,form', 'For pronominal particles: the functional role in the construction (partitive/locative/etc.).'),
    ('person', 'form', 'For verb forms (and some determiners/pronouns in the model): grammatical person (1st/2nd/3rd).'),
    ('plural_formation', 'word,form', 'For nouns: how the plural is formed (‑i/‑e/invariable/irregular), used for learning and form generation.'),
    ('position', 'translation', 'Semantic/pragmatic placement preference for this sense (prenominal vs postnominal). Meaning-driven and can vary by sense. This does not encode phonology-conditioned allomorph selection (e.g., bel/bello/bell'' for bello); use phonology_position for that.'),
    ('phonology_position', 'word,form', 'Surface-form placement/allomorph constraint. Encodes where a specific word form is grammatical based on the following word onset (vowel vs consonant, including impure consonant clusters). Independent of sense meaning. Multiple values can apply to the same surface form (e.g., bello can be used after the noun and also before impure consonants).'),
    ('preposition_type', 'word,form', 'Structural class of preposition (simple/complex/contracted), used to organise prepositions and contraction behaviour.'),
    ('pronoun_form', 'word,form', 'Surface form category for pronouns (clitic/full/elision/combined), used to organise pronoun inventories.'),
    ('pronoun_type', 'word,form', 'Functional class of pronoun (personal, relative, demonstrative, indefinite, clitic), used to organise pronouns.'),
    ('proper_noun_type', 'word,form', 'If noun_type=proper: semantic kind of the proper noun (person/place/organization/work/brand/etc.).'),
    ('reflexive', 'word', 'Marks that a verb is inherently reflexive (typically used with reflexive clitics) as a lexical property.'),
    ('register', 'translation,form', 'Register label describing how formal/informal/archaic/etc. a specific sense, usage, or form is. At Translation Level: mandatory on every sense — describes the register of that sense. At Form Level: optional (O) — apply only when a specific form carries a register that differs from the lemma''s default (e.g. archaic contracted forms such as pello, pella, pel for "per"; do not tag forms whose register matches the lemma).'),
    ('syntactic_function', 'translation', 'For pronouns: the grammatical role a pronoun has in a given sense/context (subject, direct object, etc.).'),
    ('syntactic_level', 'word,form', 'For conjunctions: the syntactic scope the conjunction connects (word/phrase/clause level).'),
    ('tense', 'form', 'For verb forms: the specific tense/mood slot (e.g., indicativo-presente), used to build complete conjugation inventories.'),
    ('transitivity', 'translation', 'For verb senses: whether the sense takes a direct object (transitive), not (intransitive), or can be either (ambitransitive).'),
    ('verb_form_type', 'form', 'For verb forms: whether the form is simple, compound (aux + participle), or progressive (stare + gerund).'),
    ('verb_type', 'translation', 'Special behavioural class for verb senses (modal, impersonal, defective, reciprocal, etc.) used for rules and pedagogy.'),
    ('word_restriction', 'word,translation', 'A restriction label showing that a lemma or sense is only used in certain forms (e.g., plural-only nouns, third-person-only verb senses, invariable adjective senses). Prevents teaching/generating unattested forms.'),
    ('abbreviation_type', 'word', 'Type of abbreviation for learner-facing classification.'),
    ('affix_type', 'word', 'Affix subtype for learner-facing morphology classification.')
)
insert into public.meta_attributes (
  id,
  name,
  description,
  source_level,
  display_level,
  propagation_rule,
  display_template,
  combined_value_name,
  is_active,
  created_at,
  conditional_config,
  stable_id,
  display_name
)
select
  gen_random_uuid(),
  ml.attribute,
  ml.description,
  ml.source_level,
  case
    when position('word' in ml.source_level) > 0 then 'word'
    when position('translation' in ml.source_level) > 0 then 'translation'
    else 'form'
  end as display_level,
  'ADMIN_ONLY'::propagation_rule,
  null,
  null,
  true,
  now(),
  '{}'::jsonb,
  'metaattr_matrix5_' || regexp_replace(ml.attribute, '[^a-z0-9]+', '_', 'g'),
  initcap(replace(ml.attribute, '_', ' '))
from matrix_levels ml
where not exists (
  select 1 from public.meta_attributes ma where ma.name = ml.attribute
);

with matrix_levels(attribute, source_level, description) as (
  values
    ('adjective_type', 'word', 'High-level class of adjective for learning and grammar behaviour (quality vs fixed comparative vs relational/category adjectives).'),
    ('adverb_type', 'word,form', 'Functional/semantic class of adverb (time/place/manner/etc.) used to organise and tag adverbs for learning.'),
    ('article_pattern', 'translation', 'How articles behave for a noun *in this sense* (e.g., article required, no article, optional), used to teach natural noun usage.'),
    ('auxiliary', 'translation', 'Which auxiliary (avere/essere) a verb sense uses to form compound tenses. Stored at sense level because some verbs are polysemous.'),
    ('case', 'word,form', 'For pronouns: which grammatical case a specific form represents in the model (subject, object, etc.).'),
    ('case_system', 'word,form', 'For pronouns: which case distinctions exist for the lemma (only subject vs a fuller set of object cases).'),
    ('cefr_level', 'word', 'The CEFR difficulty level for the lemma (A1–C2), used to group vocabulary by learner proficiency. This is populated from curated lists, not inferred by AI.'),
    ('cefr_tier', 'word', 'A flag that explains whether the CEFR tag is foundational (“core”) or supplementary (“extended”) for that level. Used to separate must‑have vocabulary from extra coverage.'),
    ('clitic_availability', 'word,form', 'Whether/what kind of clitic attachment is typical/possible for the item (mainly for adverbs/particles in this dataset).'),
    ('conjugation_type', 'word', 'Verb conjugation class based on the infinitive ending (‑are/‑ere/‑ire/‑ire‑isc), used for form generation and grouping.'),
    ('conjunction_type', 'word,form', 'The syntactic class of conjunction (coordinating/subordinating/correlative), used to organise conjunctions.'),
    ('countable', 'translation', 'For nouns: whether the noun is normally countable (has a normal plural) or uncountable/mass in its usual sense.'),
    ('determiner_type', 'word,form', 'Functional class of determiner (article, demonstrative, possessive, quantifier, etc.), used to organise and tag determiners.'),
    ('emotional_tone', 'word,form', 'For interjections: the general emotional polarity/tone (positive, negative, surprise, etc.) to support pedagogy and filtering.'),
    ('expression_variant', 'form', 'For interjections/forms: the orthographic variant type (base, exclamatory, repeated, lengthened, etc.).'),
    ('expression_type', 'word', 'Learner-facing orthographic structure label for entries (single word vs multiword expression). This is structural metadata and does not change POS classification.'),
    ('form_irregular', 'form', 'Flags an inflected/variant form that a learner cannot reliably predict from the lemma using the default rules for that word type. Use this when a form must be memorized or selected as an allomorph (e.g., bel/bello/bell'' for bello). Do NOT use this for regular agreement (gender/number endings) or for productive gradation (-issimo), even if the surface string differs.'),
    ('form_pattern', 'word', 'For adjectives: the agreement pattern describing how many distinct forms exist across gender/number (2-form/4-form/invariable, etc.).'),
    ('frequency_rank', 'word', 'A coarse bucket for how frequent the lemma is in a corpus (top100/top500/etc.). Used to prioritise learning and ordering.'),
    ('frequency_tier', 'word', 'A pedagogical frequency band (very-common → very-rare) derived from corpus rank thresholds. Used for learning prioritisation.'),
    ('gender', 'word,form', 'Grammatical gender of the lemma or form (masculine/feminine/common-gender), used for agreement and article selection.'),
    ('gender_usage', 'translation', 'For an English translation choice: whether it is restricted to male/female referents or works for mixed/unspecified referents

Be particularly careful with this one, the translation and it’s synonyms have to ALL be restricted by it’s use.'),
    ('government', 'translation', 'Which preposition a specific sense commonly selects when it takes a complement (e.g., parlare di…, andare a…). This helps learners form natural collocations.'),
    ('gradable', 'translation', 'Whether an adjective can normally be compared (more/most) and how comparison is typically formed.'),
    ('interjection_type', 'translation', 'For interjections: what kind of interjection it is (greeting, exclamation, cultural phrase), used for organisation and UX.'),
    ('interrogative_function', 'translation', 'For question words: what kind of information the word asks for (person, thing, place, time, reason, etc.).'),
    ('logical_relationship', 'word,form', 'For conjunctions: the discourse relation expressed (addition, contrast, cause, condition, time, etc.).'),
    ('mood', 'form', 'For verb forms: the grammatical mood (indicative/subjunctive/conditional/imperative/non-finite). Often derived from tense.'),
    ('noun_type', 'word,form', 'Whether a noun is a common noun or a proper noun (a name), used to drive other dependent tags like proper_noun_type.'),
    ('number', 'word,form', 'Grammatical number marking whether a lemma or form is singular or plural. Used for agreement and for handling plural‑only/singular‑only items.'),
    ('particle_function', 'word,form', 'For pronominal particles: the functional role in the construction (partitive/locative/etc.).'),
    ('person', 'form', 'For verb forms (and some determiners/pronouns in the model): grammatical person (1st/2nd/3rd).'),
    ('plural_formation', 'word,form', 'For nouns: how the plural is formed (‑i/‑e/invariable/irregular), used for learning and form generation.'),
    ('position', 'translation', 'Semantic/pragmatic placement preference for this sense (prenominal vs postnominal). Meaning-driven and can vary by sense. This does not encode phonology-conditioned allomorph selection (e.g., bel/bello/bell'' for bello); use phonology_position for that.'),
    ('phonology_position', 'word,form', 'Surface-form placement/allomorph constraint. Encodes where a specific word form is grammatical based on the following word onset (vowel vs consonant, including impure consonant clusters). Independent of sense meaning. Multiple values can apply to the same surface form (e.g., bello can be used after the noun and also before impure consonants).'),
    ('preposition_type', 'word,form', 'Structural class of preposition (simple/complex/contracted), used to organise prepositions and contraction behaviour.'),
    ('pronoun_form', 'word,form', 'Surface form category for pronouns (clitic/full/elision/combined), used to organise pronoun inventories.'),
    ('pronoun_type', 'word,form', 'Functional class of pronoun (personal, relative, demonstrative, indefinite, clitic), used to organise pronouns.'),
    ('proper_noun_type', 'word,form', 'If noun_type=proper: semantic kind of the proper noun (person/place/organization/work/brand/etc.).'),
    ('reflexive', 'word', 'Marks that a verb is inherently reflexive (typically used with reflexive clitics) as a lexical property.'),
    ('register', 'translation,form', 'Register label describing how formal/informal/archaic/etc. a specific sense, usage, or form is. At Translation Level: mandatory on every sense — describes the register of that sense. At Form Level: optional (O) — apply only when a specific form carries a register that differs from the lemma''s default (e.g. archaic contracted forms such as pello, pella, pel for "per"; do not tag forms whose register matches the lemma).'),
    ('syntactic_function', 'translation', 'For pronouns: the grammatical role a pronoun has in a given sense/context (subject, direct object, etc.).'),
    ('syntactic_level', 'word,form', 'For conjunctions: the syntactic scope the conjunction connects (word/phrase/clause level).'),
    ('tense', 'form', 'For verb forms: the specific tense/mood slot (e.g., indicativo-presente), used to build complete conjugation inventories.'),
    ('transitivity', 'translation', 'For verb senses: whether the sense takes a direct object (transitive), not (intransitive), or can be either (ambitransitive).'),
    ('verb_form_type', 'form', 'For verb forms: whether the form is simple, compound (aux + participle), or progressive (stare + gerund).'),
    ('verb_type', 'translation', 'Special behavioural class for verb senses (modal, impersonal, defective, reciprocal, etc.) used for rules and pedagogy.'),
    ('word_restriction', 'word,translation', 'A restriction label showing that a lemma or sense is only used in certain forms (e.g., plural-only nouns, third-person-only verb senses, invariable adjective senses). Prevents teaching/generating unattested forms.'),
    ('abbreviation_type', 'word', 'Type of abbreviation for learner-facing classification.'),
    ('affix_type', 'word', 'Affix subtype for learner-facing morphology classification.')
)
update public.meta_attributes ma
set
  description = case when ml.description <> '' then ml.description else ma.description end,
  source_level = case
    when ma.name = 'optional_tag' then 'word,translation,form'
    when ma.source_level like '%translation_synonym%' and position('translation' in ml.source_level) > 0
      then ml.source_level || ',translation_synonym'
    else ml.source_level
  end,
  display_level = case
    when position('word' in ml.source_level) > 0 then 'word'
    when position('translation' in ml.source_level) > 0 then 'translation'
    else 'form'
  end,
  is_active = true
from matrix_levels ml
where ma.name = ml.attribute;

-- 3) Optional-tag exception namespace + review-only markers
update public.meta_attributes
set source_level = 'word,translation,form',
    display_level = 'word',
    is_active = true
where name = 'optional_tag';

update public.meta_attributes
set is_active = false
where name in ('government_review_needed', 'clitic_review_needed');

-- 4) Ensure matrix value inventory exists (seed missing values, keep active)
with matrix_values(attribute, value, description) as (
  values
    ('adjective_type', 'qualitative', 'Describes an inherent quality and is typically gradable/degree-modifiable (e.g., bello, grande).'),
    ('adjective_type', 'fixed-comparative', 'Lexicalized comparative/superlative meaning not formed regularly from a base adjective (e.g., migliore, peggiore).'),
    ('adjective_type', 'relational', 'Expresses relation/category/material/origin and is typically not gradable (e.g., nazionale, medico, annuale).'),
    ('adverb_type', 'affirmation', 'Confirms/affirms a statement (e.g., sì, certamente).'),
    ('adverb_type', 'conjunctive', 'Connects clauses/ideas (discourse connector), often meaning therefore/however/instead (e.g., quindi, invece, ciononostante).'),
    ('adverb_type', 'doubt', 'Expresses uncertainty/hesitation (e.g., forse, magari).'),
    ('adverb_type', 'emphasis', 'Adds emphasis/intensification to a statement (e.g., proprio, davvero).'),
    ('adverb_type', 'evaluation', 'Expresses speaker evaluation/judgement (e.g., purtroppo, fortunatamente).'),
    ('adverb_type', 'frequency', 'Indicates how often something happens (e.g., sempre, spesso).'),
    ('adverb_type', 'interrogative', 'Used to ask questions (e.g., come, dove, quando, perché, quanto).'),
    ('adverb_type', 'manner', 'Describes how an action is performed (e.g., bene, lentamente).'),
    ('adverb_type', 'negation', 'Negates a statement (e.g., non, mica).'),
    ('adverb_type', 'place', 'Indicates location/direction (e.g., qui, là).'),
    ('adverb_type', 'quantity', 'Indicates degree/amount (e.g., molto, poco).'),
    ('adverb_type', 'time', 'Indicates time/sequence (e.g., oggi, domani).'),
    ('article_pattern', 'flexible-article', 'Article choice varies by context (definite/indefinite/partitive) and is not fixed to one pattern. Example: una casa / la casa / delle case.'),
    ('article_pattern', 'definite-required', 'Typically used with the definite article in normal usage. Example: l’Italia, il Mediterraneo.'),
    ('article_pattern', 'no-article', 'Typically used without an article (especially many personal names/certain proper names). Example: Marco arriva domani.'),
    ('article_pattern', 'definite-or-partitive', 'Commonly appears with either a definite article or a partitive depending on meaning (specific vs some/any amount). Example: il pane (the bread) vs del pane (some bread).'),
    ('article_pattern', 'optional-article', 'Article may be omitted in some standard contexts without changing the core meaning (often in set phrases/telegraphic styles). Example: a scuola vs alla scuola (context-dependent).'),
    ('article_pattern', 'fixed-no-article', 'Fixed/lexicalized construction where an article is normally not used. Example: in casa, a casa (fixed locative uses).'),
    ('auxiliary', 'avere', 'Compound tenses formed with avere (e.g., ho mangiato).'),
    ('auxiliary', 'essere', 'Compound tenses formed with essere (e.g., sono andato; many intransitives/reflexives/passives).'),
    ('case', 'nominative', 'Used as the subject form. Example: io (I) in “io vado”.'),
    ('case', 'accusative', 'Used as a direct object form. Example: mi / lo in “mi vede”, “lo vedo”.'),
    ('case', 'dative', 'Used as an indirect object form (to/for someone). Example: mi / gli in “mi parla”, “gli do”.'),
    ('case', 'ablative', 'Used in prepositional-object contexts in this model (after a preposition). Example: me in “con me”, te in “per te”.'),
    ('case_system', 'nominative_only', 'Only a subject-form distinction is modeled/needed (no separate object-case inventory for this lemma). Example: invariant relative “che”.'),
    ('case_system', 'accusative_dative', 'Has distinct direct vs indirect object forms (and often separate subject forms). Example: lo (DO) vs gli (IO).'),
    ('case_system', 'full_case', 'Has a full set of distinct case roles in the model (subject, direct object, indirect object, and prepositional-object forms). Example: io/me/mi patterns across contexts.'),
    ('cefr_level', 'A1', 'Beginner (basic survival vocabulary)'),
    ('cefr_level', 'A2', 'Elementary (everyday routine topics)'),
    ('cefr_level', 'B1', 'Intermediate (familiar situations; experiences/plans)'),
    ('cefr_level', 'B2', 'Upper-intermediate (more nuanced/abstract topics)'),
    ('cefr_level', 'C1', 'Advanced (complex/academic/professional usage)'),
    ('cefr_level', 'C2', 'Proficient (near-native nuance/idioms)'),
    ('cefr_level', 'academic', 'Academic/scholarly vocabulary (non-CEFR tier)'),
    ('cefr_level', 'business', 'Business/professional vocabulary (non-CEFR tier)'),
    ('cefr_level', 'literary', 'Literary/poetic/older written usage (non-CEFR tier)'),
    ('cefr_level', 'native', 'Native-speaker vocabulary outside CEFR focus (non-CEFR tier)'),
    ('cefr_level', 'regional', 'Regional/dialectal usage (non-CEFR tier)'),
    ('cefr_level', 'specialized', 'Technical/domain-specific vocabulary (non-CEFR tier)'),
    ('cefr_tier', 'core', 'Foundational must-have vocabulary for the level (priority lists)'),
    ('cefr_tier', 'extended', 'Supplementary vocabulary for fuller understanding at the level (only applied if no core tag exists for lemma+POS)'),
    ('clitic_availability', 'core-clitic', 'Typically takes a clitic in standard constructions (core clitic usage is common/expected).'),
    ('clitic_availability', 'indirect-clitic', 'Typically combines with an indirect-object clitic in common constructions.'),
    ('clitic_availability', 'no-clitics', 'Does not form standard cliticized variants in normal usage.'),
    ('clitic_availability', 'optional-clitic', 'May take clitics in some constructions but not required or not typical.'),
    ('clitic_availability', 'reflexive-clitic', 'Occurs with reflexive clitic forms (mi/ti/si/ci/vi) as part of reflexive usage.'),
    ('clitic_availability', 'reciprocal-clitic', 'Occurs with reciprocal readings in plural contexts (ci/si) where participants act on each other.'),
    ('conjugation_type', 'are', 'Verb belongs to -are conjugation (infinitive ends in -are).'),
    ('conjugation_type', 'ere', 'Verb belongs to -ere conjugation (infinitive ends in -ere).'),
    ('conjugation_type', 'ire', 'Verb belongs to -ire conjugation without -isc- infix (e.g., dormire).'),
    ('conjugation_type', 'ire-isc', 'Verb belongs to -ire conjugation with -isc- infix in present forms (e.g., finire → finisco).'),
    ('conjunction_type', 'coordinating', 'Connects elements of equal status (word/phrase/clause). Examples: e (and), ma (but), o (or).'),
    ('conjunction_type', 'correlative', 'Paired conjunction pattern used together. Examples: o…o (either…or), né…né (neither…nor).'),
    ('conjunction_type', 'subordinating', 'Introduces a subordinate clause. Examples: se (if), perché (because), mentre (while).'),
    ('countable', 'countable', 'Can be counted and normally forms a plural (e.g., libro/libri).'),
    ('countable', 'uncountable', 'Typically mass/uncountable; not normally counted or pluralized in the same sense (e.g., musica).'),
    ('determiner_type', 'article', 'Functions as an article (definite/partitive-type determiner forms).'),
    ('determiner_type', 'demonstrative', 'Points to a specific referent (this/that).'),
    ('determiner_type', 'indefinite-article', 'Introduces a non-specific referent (a/an-type determiner).'),
    ('determiner_type', 'interrogative', 'Used to ask which/what/how many (which/what-type determiner).'),
    ('determiner_type', 'possessive', 'Marks possession/association (my/your/his…).'),
    ('determiner_type', 'quantifier', 'Expresses quantity/amount (some, many, each, any…).'),
    ('emotional_tone', 'doubt', 'Signals uncertainty/hesitation.'),
    ('emotional_tone', 'high-sensitivity', 'Potentially sensitive culturally/religiously; requires caution/usage awareness.'),
    ('emotional_tone', 'negative', 'Expresses negative reaction (pain, annoyance, refusal, etc.).'),
    ('emotional_tone', 'neutral', 'Neutral discourse marker or filler without strong emotion.'),
    ('emotional_tone', 'positive', 'Expresses positive reaction/approval.'),
    ('emotional_tone', 'surprise', 'Expresses surprise/shock/amazement.'),
    ('expression_variant', 'base', 'Canonical base spelling without special punctuation or modification.'),
    ('expression_variant', 'capitalized', 'Capitalized form used sentence-initially or as orthographic variant.'),
    ('expression_variant', 'exclamatory', 'Form with exclamation mark or exclamatory punctuation.'),
    ('expression_variant', 'lengthened', 'Lengthened spelling for emphasis (e.g., aaah).'),
    ('expression_variant', 'questioning', 'Form with question mark or interrogative punctuation.'),
    ('expression_variant', 'repeated', 'Repeated token for emphasis (e.g., no no no).'),
    ('expression_type', 'single-word', 'Entry surface contains no spaces. Example: grande, bello.'),
    ('expression_type', 'multiword-expression', 'Entry surface contains one or more spaces. Example: via cavo, de facto.'),
    ('form_irregular', 'irregular', 'Form is non-predictable from the lemma under default learner rules for this word type (irregular conjugation/plural/allomorph selection). Examples: sono (essere), uomini (uomo), bel (bello).'),
    ('form_pattern', 'form-2', 'Two-form agreement pattern (typically common gender singular/plural: grande/grandi).'),
    ('form_pattern', 'form-4', 'Four-form agreement pattern (masc/fem × sing/plur: bello/bella/belli/belle).'),
    ('form_pattern', 'form-invariable', 'Invariable adjective with no gender/number inflection (e.g., blu).'),
    ('form_pattern', 'form-3', 'Three-form pattern (one form shared across genders in one number; used for certain adjective classes).'),
    ('frequency_rank', 'top100', 'corpus rank ≤ 100'),
    ('frequency_rank', 'top500', 'corpus rank ≤ 500'),
    ('frequency_rank', 'top1000', 'corpus rank ≤ 1000'),
    ('frequency_rank', 'top2500', 'corpus rank ≤ 2500'),
    ('frequency_rank', 'top5000', 'corpus rank ≤ 5000'),
    ('frequency_rank', 'top10000', 'corpus rank ≤ 10000'),
    ('frequency_tier', 'very-common', 'corpus rank 1–1000'),
    ('frequency_tier', 'common', 'corpus rank 1001–5000'),
    ('frequency_tier', 'uncommon', 'corpus rank 5001–15000'),
    ('frequency_tier', 'rare', 'corpus rank 15001–50000'),
    ('frequency_tier', 'very-rare', 'corpus rank > 50000'),
    ('gender', 'masculine', 'Grammatically masculine; takes masculine agreement (il, questo).'),
    ('gender', 'feminine', 'Grammatically feminine; takes feminine agreement (la, questa).'),
    ('gender', 'common-gender', 'Works with both genders/invariable by gender (e.g., some determiners/pronouns).'),
    ('gender_usage', 'female-only', 'This translation/synonym is used only for female referents in typical usage.'),
    ('gender_usage', 'male-only', 'This translation/synonym is used only for male referents in typical usage.'),
    ('gender_usage', 'mixed-gender', 'This translation/synonym can apply to mixed/unspecified gender referents (or follows Italian mixed-gender convention).'),
    ('government', 'governs_a', 'Typically takes the preposition “a” to introduce its complement (e.g., andare a Roma; abituato a)'),
    ('government', 'governs_di', 'Typically takes “di” (e.g., parlare di politica; contento di)'),
    ('government', 'governs_da', 'Typically takes “da” (e.g., dipendere da; lontano da)'),
    ('government', 'governs_in', 'Typically takes “in” (e.g., credere in; esperto in)'),
    ('government', 'governs_con', 'Typically takes “con” (e.g., d''accordo con; arrabbiato con)'),
    ('government', 'governs_su', 'Typically takes “su” (e.g., contare su; basato su)'),
    ('government', 'governs_per', 'Typically takes “per” (e.g., adatto per; famoso per)'),
    ('government', 'invariable', 'No single governing preposition is required/expected (or it varies freely by sense/construction)'),
    ('gradable', 'analytical-gradability', 'Comparison is normally expressed with più/meno rather than fixed irregular forms. Example: più facile (easier), meno importante (less important).'),
    ('gradable', 'full-gradability', 'The adjective is naturally gradable (can take degree modifiers and form comparatives/superlatives in standard ways). Example: bello → più bello; molto bello.'),
    ('gradable', 'non-gradable', 'Not normally compared because it’s relational/categorical or otherwise not degree-based. Example: nazionale (national), medico (medical) in their relational senses.'),
    ('interjection_type', 'cultural-phrase', 'Fixed cultural expression functioning as an interjection (multiword or idiomatic).'),
    ('interjection_type', 'exclamation', 'Exclamatory interjection expressing reaction (oh!, ah!, uff!).'),
    ('interjection_type', 'greeting', 'Greeting/farewell interjection used in social interaction (ciao, salve).'),
    ('interrogative_function', 'identity-person', 'Asks who (person identity).'),
    ('interrogative_function', 'identity-thing', 'Asks what/which thing (object identity).'),
    ('interrogative_function', 'indirect-object', 'Asks to/for whom (indirect object).'),
    ('interrogative_function', 'location', 'Asks where (place/direction).'),
    ('interrogative_function', 'manner', 'Asks how (manner).'),
    ('interrogative_function', 'quality', 'Asks what kind/which quality.'),
    ('interrogative_function', 'quantity', 'Asks how much/how many.'),
    ('interrogative_function', 'reason-cause', 'Asks why (reason/cause).'),
    ('interrogative_function', 'time', 'Asks when (time).'),
    ('logical_relationship', 'addition', 'Adds information. Examples: e (and), anche (also).'),
    ('logical_relationship', 'causal', 'Gives a reason/cause. Examples: perché (because), dato che (given that).'),
    ('logical_relationship', 'conditional', 'Sets a condition. Examples: se (if), a meno che (unless).'),
    ('logical_relationship', 'contrast', 'Contrasts or concedes. Examples: ma (but), però (however), sebbene (although).'),
    ('logical_relationship', 'disjunction', 'Presents alternatives/choices. Examples: o (or), oppure (or else).'),
    ('logical_relationship', 'temporal', 'Relates events in time. Examples: quando (when), mentre (while), dopo che (after).'),
    ('mood', 'indicativo', 'Indicative mood (statements of fact).'),
    ('mood', 'congiuntivo', 'Subjunctive mood (doubt, desire, emotion, non-factual contexts).'),
    ('mood', 'condizionale', 'Conditional mood (hypothetical/conditional situations).'),
    ('mood', 'imperativo', 'Imperative mood (commands/requests).'),
    ('mood', 'infinito', 'Infinitive (non-finite base form).'),
    ('mood', 'gerundio', 'Gerund (non-finite -ando/-endo; progressive/adverbial).'),
    ('mood', 'participio', 'Participle (participio presente/passato; non-finite).'),
    ('noun_type', 'common', 'Common noun used as a general category term (e.g., casa).'),
    ('noun_type', 'proper', 'Proper noun used as a name/title (e.g., Roma, Marco).'),
    ('number', 'singolare', 'Singular form (one entity; singular agreement). Examples: casa (noun lemma), dò (verb 1st person singular).'),
    ('number', 'plurale', 'Plural form (more than one; plural agreement). Examples: forbici (plural-only noun lemma), siamo (verb 1st person plural).'),
    ('particle_function', 'indefinite', 'Indefinite reference (“some/any/unspecified”) carried by the particle in context. Example: if tagged, it signals non-specific reference rather than a concrete place/quantity.'),
    ('particle_function', 'locative', 'Points to a location/there-related reference. Example: ci vado (I go there).'),
    ('particle_function', 'partitive', 'Expresses “some/of it/of them”. Example: ne voglio (I want some of it).'),
    ('particle_function', 'possessive', 'Marks possession/association in a pronominal construction (model label; rare). Example: (where applicable) constructions equivalent to “of mine/of yours”.'),
    ('person', 'prima-persona', 'First person (I/we).'),
    ('person', 'seconda-persona', 'Second person (you).'),
    ('person', 'terza-persona', 'Third person (he/she/it/they).'),
    ('plural_formation', 'plural-e', 'Plural formed by -a→-e or similar e-plural pattern (e.g., casa→case).'),
    ('plural_formation', 'plural-e-to-i', 'Plural formed by -e→-i pattern (e.g., occhiale→occhiali).'),
    ('plural_formation', 'plural-i', 'Plural formed by -o→-i or similar i-plural pattern (e.g., libro→libri).'),
    ('plural_formation', 'plural-invariable', 'Plural is identical to singular (invariable).'),
    ('plural_formation', 'plural-irregular', 'Plural is irregular and must be stored/learned as exception.'),
    ('position', 'after', 'Sense is typically used after the noun (postnominal). Example: un ragazzo bello.'),
    ('position', 'before', 'Sense is typically used before the noun (prenominal). Example: un bel ragazzo.'),
    ('position', 'before/after', 'Both prenominal and postnominal placement are acceptable for this sense (may be neutral or convey subtle meaning differences).'),
    ('phonology_position', 'after-noun', 'This surface form is used after the noun (postnominal) without phonology conditioning. Example: un ragazzo bello.'),
    ('phonology_position', 'before-most-consonants', 'Use this prenominal form before most consonants (not impure consonants). Example: un bel ragazzo.'),
    ('phonology_position', 'before-impure-consonant', 'Use this prenominal form before impure consonant onsets such as s+consonant, z, gn, ps, x. Example: uno bello zaino (form selection).'),
    ('phonology_position', 'before-vowel-or-h', 'Use this elided prenominal form before vowels or h. Example: un bell''uomo.'),
    ('preposition_type', 'simple', 'Simple preposition (single word: di, a, da, in…).'),
    ('preposition_type', 'complex', 'Multiword prepositional phrase (e.g., davanti a).'),
    ('preposition_type', 'contracted', 'Contracted preposition+article form (e.g., al, del, alla).'),
    ('pronoun_form', 'clitic', 'Clitic form that attaches to verbs (mi, ti, lo…).'),
    ('pronoun_form', 'combined', 'Combined clitic cluster form (glielo, te ne…).'),
    ('pronoun_form', 'elision', 'Elided form with apostrophe (m'', t'', l''…).'),
    ('pronoun_form', 'full', 'Full/non-clitic standalone form (io, lui, questo…).'),
    ('pronoun_type', 'clitic', 'Clitic pronoun functioning as object/reflexive attachment to verb.'),
    ('pronoun_type', 'demonstrative', 'Demonstrative pronoun (this/that one).'),
    ('pronoun_type', 'indefinite', 'Indefinite pronoun (someone/anything/none…).'),
    ('pronoun_type', 'personal', 'Personal pronoun (io, tu, lui/lei…).'),
    ('pronoun_type', 'relative', 'Relative pronoun introducing a relative clause (che, cui…).'),
    ('proper_noun_type', 'brand', 'Name of a brand/product line.'),
    ('proper_noun_type', 'organization', 'Name of an organization/institution/agency.'),
    ('proper_noun_type', 'person', 'Personal name (given name/surname/character).'),
    ('proper_noun_type', 'place', 'Place name (country/city/region/etc.).'),
    ('proper_noun_type', 'thing', 'Named thing/entity not covered by other categories (catch-all proper noun).'),
    ('proper_noun_type', 'partitive', 'Partitive-like named grouping label (legacy bucket; use only when defined in the dataset).'),
    ('reflexive', 'reflexive', 'Verb requires/refers to reflexive construction as a core lexical property (uses reflexive clitics).'),
    ('register', 'archaic', 'Archaic/very old usage; not modern standard.'),
    ('register', 'casual', 'Casual everyday speech.'),
    ('register', 'colloquial', 'Colloquial/spoken usage; informal.'),
    ('register', 'dialectal', 'Dialectal/local dialect usage.'),
    ('register', 'formal', 'Formal register (writing/speeches).'),
    ('register', 'informal', 'Informal register (less formal than neutral).'),
    ('register', 'literary', 'Literary style; often written/literature.'),
    ('register', 'mixed', 'Mixed register or multiple registers depending on context.'),
    ('register', 'neutral', 'Neutral standard usage.'),
    ('register', 'obsolete', 'Obsolete/no longer in use in modern language.'),
    ('register', 'poetic', 'Poetic style.'),
    ('register', 'rare', 'Rare usage even within standard language.'),
    ('register', 'regional', 'Regionally limited usage (not necessarily dialect).'),
    ('register', 'slang', 'Slang usage.'),
    ('register', 'vulgar', 'Vulgar/offensive usage.'),
    ('syntactic_function', 'demonstrative_reference', 'Points to a referent as “this/that (one)”. Examples: questo/quello used pronominally.'),
    ('syntactic_function', 'direct_object', 'Used as direct object. Example: mi/lo/la in “mi vede”, “lo vedo”.'),
    ('syntactic_function', 'indirect_object', 'Used as indirect object (to/for someone). Example: mi/gli/le in “gli parlo”, “le do”.'),
    ('syntactic_function', 'indefinite_reference', 'Refers to an unspecified entity. Examples: qualcuno (someone), qualcosa (something).'),
    ('syntactic_function', 'partitive', 'Expresses partitive reference “some/of it”. Example: ne in “ne voglio”.'),
    ('syntactic_function', 'prepositional_object', 'Used after a preposition. Example: me/te/lui in “con me”, “per te”, “da lui”.'),
    ('syntactic_function', 'relative_clause', 'Introduces/anchors a relative clause. Examples: che (that/which), cui (to whom/of which).'),
    ('syntactic_function', 'subject', 'Used as grammatical subject. Example: io in “io parlo”.'),
    ('syntactic_level', 'word_level', 'Typically connects single words or very small constituents. Example: e between two nouns (pane e acqua).'),
    ('syntactic_level', 'phrase_level', 'Typically connects phrases. Example: non solo… ma anche… connecting two noun phrases.'),
    ('syntactic_level', 'clause_level', 'Typically connects clauses/sentences. Example: se piove, resto a casa (if it rains, I stay home).'),
    ('tense', 'indicativo-presente', 'Indicative present tense (ongoing/habitual present).'),
    ('tense', 'indicativo-passato-prossimo', 'Indicative passato prossimo (completed past with present relevance).'),
    ('tense', 'indicativo-imperfetto', 'Indicative imperfetto (ongoing/habitual past; background).'),
    ('tense', 'indicativo-passato-remoto', 'Indicative passato remoto (remote/simple past; often literary/regional).'),
    ('tense', 'indicativo-trapassato-prossimo', 'Indicative trapassato prossimo (pluperfect).'),
    ('tense', 'indicativo-trapassato-remoto', 'Indicative trapassato remoto (literary pluperfect).'),
    ('tense', 'indicativo-futuro', 'Indicative future (will/shall).'),
    ('tense', 'indicativo-futuro-anteriore', 'Indicative future perfect.'),
    ('tense', 'congiuntivo-presente', 'Subjunctive present.'),
    ('tense', 'congiuntivo-imperfetto', 'Subjunctive imperfect.'),
    ('tense', 'congiuntivo-passato', 'Subjunctive past (compound).'),
    ('tense', 'congiuntivo-trapassato', 'Subjunctive pluperfect (compound).'),
    ('tense', 'condizionale-presente', 'Conditional present.'),
    ('tense', 'condizionale-passato', 'Conditional past (compound).'),
    ('tense', 'infinito', 'Infinitive present.'),
    ('tense', 'infinito-passato', 'Infinitive past (compound).'),
    ('tense', 'gerundio', 'Gerund present.'),
    ('tense', 'gerundio-passato', 'Gerund past (compound).'),
    ('tense', 'participio-presente', 'Present participle.'),
    ('tense', 'participio-passato', 'Past participle.'),
    ('tense', 'imperativo', 'Imperative (affirmative).'),
    ('tense', 'imperativo-negativo', 'Imperative negative.'),
    ('transitivity', 'transitive', 'Takes a direct object in this sense (requires/accepts object).'),
    ('transitivity', 'intransitive', 'Does not take a direct object in this sense.'),
    ('transitivity', 'ambitransitive', 'Same sense can be used both with and without a direct object.'),
    ('verb_form_type', 'simple', 'Simple (single-verb) form, not periphrastic/compound.'),
    ('verb_form_type', 'compound', 'Compound form using an auxiliary + participle (e.g., ho parlato).'),
    ('verb_form_type', 'progressive', 'Progressive periphrasis (stare + gerund).'),
    ('verb_type', 'defective-verb', 'Missing some standard conjugation forms (paradigm gaps).'),
    ('verb_type', 'direct-reflexive', 'Reflexive meaning is central; typically used with reflexive clitics.'),
    ('verb_type', 'impersonal-verb', 'Used primarily without a true subject or restricted to 3rd person constructions.'),
    ('verb_type', 'meteorological-verb', 'Weather verb (typical meteorological/impersonal usage).'),
    ('verb_type', 'modal-verb', 'Modal verb that combines with an infinitive to express ability/necessity/volition.'),
    ('verb_type', 'pronominal-variant', 'Pronominal verb variant with fixed clitic particles (e.g., andarsene).'),
    ('verb_type', 'reciprocal', 'Mutual action sense typically requiring plural participants (each other).'),
    ('word_restriction', 'invariable', 'Sense is used without agreement forms (adjective sense-level restriction). Do not teach/generate sense-level agreement forms for this sense.'),
    ('word_restriction', 'missing-first-second-person', 'No 1st/2nd person forms are used/attested for this lemma/sense.'),
    ('word_restriction', 'missing-imperative', 'No imperative forms are used/attested for this lemma/sense.'),
    ('word_restriction', 'plural-only', 'Only used in plural forms (pluralia tantum). Example: forbici (noun); some reciprocal/idiomatic verb senses.'),
    ('word_restriction', 'singular-only', 'Only used in singular forms. Example: mass/abstract nouns or fixed expressions that do not pluralize.'),
    ('word_restriction', 'third-person-only', 'Only used in 3rd person forms (impersonal usage). Example: impersonal verb senses.'),
    ('word_restriction', 'third-singular-only', 'Only used in 3rd person singular forms. Example: weather/impersonal senses.'),
    ('abbreviation_type', 'initialism', 'Pronounced letter-by-letter (e.g., USA).'),
    ('abbreviation_type', 'acronym', 'Pronounced as a word (e.g., NATO).'),
    ('affix_type', 'prefix', 'Affix attached before the base form.')
), resolved as (
  select
    mv.attribute,
    mv.value,
    mv.description,
    ma.id as attribute_id
  from matrix_values mv
  join public.meta_attributes ma on ma.name = mv.attribute
)
insert into public.meta_values (
  id,
  attribute_id,
  value,
  description,
  is_default,
  sort_order,
  is_active,
  created_at,
  stable_id,
  shorthand
)
select
  gen_random_uuid(),
  r.attribute_id,
  r.value,
  nullif(r.description, ''),
  false,
  null,
  true,
  now(),
  'metaval_matrix5_' || regexp_replace(r.attribute || '_' || r.value, '[^a-z0-9]+', '_', 'g'),
  null
from resolved r
where not exists (
  select 1
  from public.meta_values existing
  where existing.attribute_id = r.attribute_id
    and lower(existing.value) = lower(r.value)
);

with matrix_values(attribute, value, description) as (
  values
    ('adjective_type', 'qualitative', 'Describes an inherent quality and is typically gradable/degree-modifiable (e.g., bello, grande).'),
    ('adjective_type', 'fixed-comparative', 'Lexicalized comparative/superlative meaning not formed regularly from a base adjective (e.g., migliore, peggiore).'),
    ('adjective_type', 'relational', 'Expresses relation/category/material/origin and is typically not gradable (e.g., nazionale, medico, annuale).'),
    ('adverb_type', 'affirmation', 'Confirms/affirms a statement (e.g., sì, certamente).'),
    ('adverb_type', 'conjunctive', 'Connects clauses/ideas (discourse connector), often meaning therefore/however/instead (e.g., quindi, invece, ciononostante).'),
    ('adverb_type', 'doubt', 'Expresses uncertainty/hesitation (e.g., forse, magari).'),
    ('adverb_type', 'emphasis', 'Adds emphasis/intensification to a statement (e.g., proprio, davvero).'),
    ('adverb_type', 'evaluation', 'Expresses speaker evaluation/judgement (e.g., purtroppo, fortunatamente).'),
    ('adverb_type', 'frequency', 'Indicates how often something happens (e.g., sempre, spesso).'),
    ('adverb_type', 'interrogative', 'Used to ask questions (e.g., come, dove, quando, perché, quanto).'),
    ('adverb_type', 'manner', 'Describes how an action is performed (e.g., bene, lentamente).'),
    ('adverb_type', 'negation', 'Negates a statement (e.g., non, mica).'),
    ('adverb_type', 'place', 'Indicates location/direction (e.g., qui, là).'),
    ('adverb_type', 'quantity', 'Indicates degree/amount (e.g., molto, poco).'),
    ('adverb_type', 'time', 'Indicates time/sequence (e.g., oggi, domani).'),
    ('article_pattern', 'flexible-article', 'Article choice varies by context (definite/indefinite/partitive) and is not fixed to one pattern. Example: una casa / la casa / delle case.'),
    ('article_pattern', 'definite-required', 'Typically used with the definite article in normal usage. Example: l’Italia, il Mediterraneo.'),
    ('article_pattern', 'no-article', 'Typically used without an article (especially many personal names/certain proper names). Example: Marco arriva domani.'),
    ('article_pattern', 'definite-or-partitive', 'Commonly appears with either a definite article or a partitive depending on meaning (specific vs some/any amount). Example: il pane (the bread) vs del pane (some bread).'),
    ('article_pattern', 'optional-article', 'Article may be omitted in some standard contexts without changing the core meaning (often in set phrases/telegraphic styles). Example: a scuola vs alla scuola (context-dependent).'),
    ('article_pattern', 'fixed-no-article', 'Fixed/lexicalized construction where an article is normally not used. Example: in casa, a casa (fixed locative uses).'),
    ('auxiliary', 'avere', 'Compound tenses formed with avere (e.g., ho mangiato).'),
    ('auxiliary', 'essere', 'Compound tenses formed with essere (e.g., sono andato; many intransitives/reflexives/passives).'),
    ('case', 'nominative', 'Used as the subject form. Example: io (I) in “io vado”.'),
    ('case', 'accusative', 'Used as a direct object form. Example: mi / lo in “mi vede”, “lo vedo”.'),
    ('case', 'dative', 'Used as an indirect object form (to/for someone). Example: mi / gli in “mi parla”, “gli do”.'),
    ('case', 'ablative', 'Used in prepositional-object contexts in this model (after a preposition). Example: me in “con me”, te in “per te”.'),
    ('case_system', 'nominative_only', 'Only a subject-form distinction is modeled/needed (no separate object-case inventory for this lemma). Example: invariant relative “che”.'),
    ('case_system', 'accusative_dative', 'Has distinct direct vs indirect object forms (and often separate subject forms). Example: lo (DO) vs gli (IO).'),
    ('case_system', 'full_case', 'Has a full set of distinct case roles in the model (subject, direct object, indirect object, and prepositional-object forms). Example: io/me/mi patterns across contexts.'),
    ('cefr_level', 'A1', 'Beginner (basic survival vocabulary)'),
    ('cefr_level', 'A2', 'Elementary (everyday routine topics)'),
    ('cefr_level', 'B1', 'Intermediate (familiar situations; experiences/plans)'),
    ('cefr_level', 'B2', 'Upper-intermediate (more nuanced/abstract topics)'),
    ('cefr_level', 'C1', 'Advanced (complex/academic/professional usage)'),
    ('cefr_level', 'C2', 'Proficient (near-native nuance/idioms)'),
    ('cefr_level', 'academic', 'Academic/scholarly vocabulary (non-CEFR tier)'),
    ('cefr_level', 'business', 'Business/professional vocabulary (non-CEFR tier)'),
    ('cefr_level', 'literary', 'Literary/poetic/older written usage (non-CEFR tier)'),
    ('cefr_level', 'native', 'Native-speaker vocabulary outside CEFR focus (non-CEFR tier)'),
    ('cefr_level', 'regional', 'Regional/dialectal usage (non-CEFR tier)'),
    ('cefr_level', 'specialized', 'Technical/domain-specific vocabulary (non-CEFR tier)'),
    ('cefr_tier', 'core', 'Foundational must-have vocabulary for the level (priority lists)'),
    ('cefr_tier', 'extended', 'Supplementary vocabulary for fuller understanding at the level (only applied if no core tag exists for lemma+POS)'),
    ('clitic_availability', 'core-clitic', 'Typically takes a clitic in standard constructions (core clitic usage is common/expected).'),
    ('clitic_availability', 'indirect-clitic', 'Typically combines with an indirect-object clitic in common constructions.'),
    ('clitic_availability', 'no-clitics', 'Does not form standard cliticized variants in normal usage.'),
    ('clitic_availability', 'optional-clitic', 'May take clitics in some constructions but not required or not typical.'),
    ('clitic_availability', 'reflexive-clitic', 'Occurs with reflexive clitic forms (mi/ti/si/ci/vi) as part of reflexive usage.'),
    ('clitic_availability', 'reciprocal-clitic', 'Occurs with reciprocal readings in plural contexts (ci/si) where participants act on each other.'),
    ('conjugation_type', 'are', 'Verb belongs to -are conjugation (infinitive ends in -are).'),
    ('conjugation_type', 'ere', 'Verb belongs to -ere conjugation (infinitive ends in -ere).'),
    ('conjugation_type', 'ire', 'Verb belongs to -ire conjugation without -isc- infix (e.g., dormire).'),
    ('conjugation_type', 'ire-isc', 'Verb belongs to -ire conjugation with -isc- infix in present forms (e.g., finire → finisco).'),
    ('conjunction_type', 'coordinating', 'Connects elements of equal status (word/phrase/clause). Examples: e (and), ma (but), o (or).'),
    ('conjunction_type', 'correlative', 'Paired conjunction pattern used together. Examples: o…o (either…or), né…né (neither…nor).'),
    ('conjunction_type', 'subordinating', 'Introduces a subordinate clause. Examples: se (if), perché (because), mentre (while).'),
    ('countable', 'countable', 'Can be counted and normally forms a plural (e.g., libro/libri).'),
    ('countable', 'uncountable', 'Typically mass/uncountable; not normally counted or pluralized in the same sense (e.g., musica).'),
    ('determiner_type', 'article', 'Functions as an article (definite/partitive-type determiner forms).'),
    ('determiner_type', 'demonstrative', 'Points to a specific referent (this/that).'),
    ('determiner_type', 'indefinite-article', 'Introduces a non-specific referent (a/an-type determiner).'),
    ('determiner_type', 'interrogative', 'Used to ask which/what/how many (which/what-type determiner).'),
    ('determiner_type', 'possessive', 'Marks possession/association (my/your/his…).'),
    ('determiner_type', 'quantifier', 'Expresses quantity/amount (some, many, each, any…).'),
    ('emotional_tone', 'doubt', 'Signals uncertainty/hesitation.'),
    ('emotional_tone', 'high-sensitivity', 'Potentially sensitive culturally/religiously; requires caution/usage awareness.'),
    ('emotional_tone', 'negative', 'Expresses negative reaction (pain, annoyance, refusal, etc.).'),
    ('emotional_tone', 'neutral', 'Neutral discourse marker or filler without strong emotion.'),
    ('emotional_tone', 'positive', 'Expresses positive reaction/approval.'),
    ('emotional_tone', 'surprise', 'Expresses surprise/shock/amazement.'),
    ('expression_variant', 'base', 'Canonical base spelling without special punctuation or modification.'),
    ('expression_variant', 'capitalized', 'Capitalized form used sentence-initially or as orthographic variant.'),
    ('expression_variant', 'exclamatory', 'Form with exclamation mark or exclamatory punctuation.'),
    ('expression_variant', 'lengthened', 'Lengthened spelling for emphasis (e.g., aaah).'),
    ('expression_variant', 'questioning', 'Form with question mark or interrogative punctuation.'),
    ('expression_variant', 'repeated', 'Repeated token for emphasis (e.g., no no no).'),
    ('expression_type', 'single-word', 'Entry surface contains no spaces. Example: grande, bello.'),
    ('expression_type', 'multiword-expression', 'Entry surface contains one or more spaces. Example: via cavo, de facto.'),
    ('form_irregular', 'irregular', 'Form is non-predictable from the lemma under default learner rules for this word type (irregular conjugation/plural/allomorph selection). Examples: sono (essere), uomini (uomo), bel (bello).'),
    ('form_pattern', 'form-2', 'Two-form agreement pattern (typically common gender singular/plural: grande/grandi).'),
    ('form_pattern', 'form-4', 'Four-form agreement pattern (masc/fem × sing/plur: bello/bella/belli/belle).'),
    ('form_pattern', 'form-invariable', 'Invariable adjective with no gender/number inflection (e.g., blu).'),
    ('form_pattern', 'form-3', 'Three-form pattern (one form shared across genders in one number; used for certain adjective classes).'),
    ('frequency_rank', 'top100', 'corpus rank ≤ 100'),
    ('frequency_rank', 'top500', 'corpus rank ≤ 500'),
    ('frequency_rank', 'top1000', 'corpus rank ≤ 1000'),
    ('frequency_rank', 'top2500', 'corpus rank ≤ 2500'),
    ('frequency_rank', 'top5000', 'corpus rank ≤ 5000'),
    ('frequency_rank', 'top10000', 'corpus rank ≤ 10000'),
    ('frequency_tier', 'very-common', 'corpus rank 1–1000'),
    ('frequency_tier', 'common', 'corpus rank 1001–5000'),
    ('frequency_tier', 'uncommon', 'corpus rank 5001–15000'),
    ('frequency_tier', 'rare', 'corpus rank 15001–50000'),
    ('frequency_tier', 'very-rare', 'corpus rank > 50000'),
    ('gender', 'masculine', 'Grammatically masculine; takes masculine agreement (il, questo).'),
    ('gender', 'feminine', 'Grammatically feminine; takes feminine agreement (la, questa).'),
    ('gender', 'common-gender', 'Works with both genders/invariable by gender (e.g., some determiners/pronouns).'),
    ('gender_usage', 'female-only', 'This translation/synonym is used only for female referents in typical usage.'),
    ('gender_usage', 'male-only', 'This translation/synonym is used only for male referents in typical usage.'),
    ('gender_usage', 'mixed-gender', 'This translation/synonym can apply to mixed/unspecified gender referents (or follows Italian mixed-gender convention).'),
    ('government', 'governs_a', 'Typically takes the preposition “a” to introduce its complement (e.g., andare a Roma; abituato a)'),
    ('government', 'governs_di', 'Typically takes “di” (e.g., parlare di politica; contento di)'),
    ('government', 'governs_da', 'Typically takes “da” (e.g., dipendere da; lontano da)'),
    ('government', 'governs_in', 'Typically takes “in” (e.g., credere in; esperto in)'),
    ('government', 'governs_con', 'Typically takes “con” (e.g., d''accordo con; arrabbiato con)'),
    ('government', 'governs_su', 'Typically takes “su” (e.g., contare su; basato su)'),
    ('government', 'governs_per', 'Typically takes “per” (e.g., adatto per; famoso per)'),
    ('government', 'invariable', 'No single governing preposition is required/expected (or it varies freely by sense/construction)'),
    ('gradable', 'analytical-gradability', 'Comparison is normally expressed with più/meno rather than fixed irregular forms. Example: più facile (easier), meno importante (less important).'),
    ('gradable', 'full-gradability', 'The adjective is naturally gradable (can take degree modifiers and form comparatives/superlatives in standard ways). Example: bello → più bello; molto bello.'),
    ('gradable', 'non-gradable', 'Not normally compared because it’s relational/categorical or otherwise not degree-based. Example: nazionale (national), medico (medical) in their relational senses.'),
    ('interjection_type', 'cultural-phrase', 'Fixed cultural expression functioning as an interjection (multiword or idiomatic).'),
    ('interjection_type', 'exclamation', 'Exclamatory interjection expressing reaction (oh!, ah!, uff!).'),
    ('interjection_type', 'greeting', 'Greeting/farewell interjection used in social interaction (ciao, salve).'),
    ('interrogative_function', 'identity-person', 'Asks who (person identity).'),
    ('interrogative_function', 'identity-thing', 'Asks what/which thing (object identity).'),
    ('interrogative_function', 'indirect-object', 'Asks to/for whom (indirect object).'),
    ('interrogative_function', 'location', 'Asks where (place/direction).'),
    ('interrogative_function', 'manner', 'Asks how (manner).'),
    ('interrogative_function', 'quality', 'Asks what kind/which quality.'),
    ('interrogative_function', 'quantity', 'Asks how much/how many.'),
    ('interrogative_function', 'reason-cause', 'Asks why (reason/cause).'),
    ('interrogative_function', 'time', 'Asks when (time).'),
    ('logical_relationship', 'addition', 'Adds information. Examples: e (and), anche (also).'),
    ('logical_relationship', 'causal', 'Gives a reason/cause. Examples: perché (because), dato che (given that).'),
    ('logical_relationship', 'conditional', 'Sets a condition. Examples: se (if), a meno che (unless).'),
    ('logical_relationship', 'contrast', 'Contrasts or concedes. Examples: ma (but), però (however), sebbene (although).'),
    ('logical_relationship', 'disjunction', 'Presents alternatives/choices. Examples: o (or), oppure (or else).'),
    ('logical_relationship', 'temporal', 'Relates events in time. Examples: quando (when), mentre (while), dopo che (after).'),
    ('mood', 'indicativo', 'Indicative mood (statements of fact).'),
    ('mood', 'congiuntivo', 'Subjunctive mood (doubt, desire, emotion, non-factual contexts).'),
    ('mood', 'condizionale', 'Conditional mood (hypothetical/conditional situations).'),
    ('mood', 'imperativo', 'Imperative mood (commands/requests).'),
    ('mood', 'infinito', 'Infinitive (non-finite base form).'),
    ('mood', 'gerundio', 'Gerund (non-finite -ando/-endo; progressive/adverbial).'),
    ('mood', 'participio', 'Participle (participio presente/passato; non-finite).'),
    ('noun_type', 'common', 'Common noun used as a general category term (e.g., casa).'),
    ('noun_type', 'proper', 'Proper noun used as a name/title (e.g., Roma, Marco).'),
    ('number', 'singolare', 'Singular form (one entity; singular agreement). Examples: casa (noun lemma), dò (verb 1st person singular).'),
    ('number', 'plurale', 'Plural form (more than one; plural agreement). Examples: forbici (plural-only noun lemma), siamo (verb 1st person plural).'),
    ('particle_function', 'indefinite', 'Indefinite reference (“some/any/unspecified”) carried by the particle in context. Example: if tagged, it signals non-specific reference rather than a concrete place/quantity.'),
    ('particle_function', 'locative', 'Points to a location/there-related reference. Example: ci vado (I go there).'),
    ('particle_function', 'partitive', 'Expresses “some/of it/of them”. Example: ne voglio (I want some of it).'),
    ('particle_function', 'possessive', 'Marks possession/association in a pronominal construction (model label; rare). Example: (where applicable) constructions equivalent to “of mine/of yours”.'),
    ('person', 'prima-persona', 'First person (I/we).'),
    ('person', 'seconda-persona', 'Second person (you).'),
    ('person', 'terza-persona', 'Third person (he/she/it/they).'),
    ('plural_formation', 'plural-e', 'Plural formed by -a→-e or similar e-plural pattern (e.g., casa→case).'),
    ('plural_formation', 'plural-e-to-i', 'Plural formed by -e→-i pattern (e.g., occhiale→occhiali).'),
    ('plural_formation', 'plural-i', 'Plural formed by -o→-i or similar i-plural pattern (e.g., libro→libri).'),
    ('plural_formation', 'plural-invariable', 'Plural is identical to singular (invariable).'),
    ('plural_formation', 'plural-irregular', 'Plural is irregular and must be stored/learned as exception.'),
    ('position', 'after', 'Sense is typically used after the noun (postnominal). Example: un ragazzo bello.'),
    ('position', 'before', 'Sense is typically used before the noun (prenominal). Example: un bel ragazzo.'),
    ('position', 'before/after', 'Both prenominal and postnominal placement are acceptable for this sense (may be neutral or convey subtle meaning differences).'),
    ('phonology_position', 'after-noun', 'This surface form is used after the noun (postnominal) without phonology conditioning. Example: un ragazzo bello.'),
    ('phonology_position', 'before-most-consonants', 'Use this prenominal form before most consonants (not impure consonants). Example: un bel ragazzo.'),
    ('phonology_position', 'before-impure-consonant', 'Use this prenominal form before impure consonant onsets such as s+consonant, z, gn, ps, x. Example: uno bello zaino (form selection).'),
    ('phonology_position', 'before-vowel-or-h', 'Use this elided prenominal form before vowels or h. Example: un bell''uomo.'),
    ('preposition_type', 'simple', 'Simple preposition (single word: di, a, da, in…).'),
    ('preposition_type', 'complex', 'Multiword prepositional phrase (e.g., davanti a).'),
    ('preposition_type', 'contracted', 'Contracted preposition+article form (e.g., al, del, alla).'),
    ('pronoun_form', 'clitic', 'Clitic form that attaches to verbs (mi, ti, lo…).'),
    ('pronoun_form', 'combined', 'Combined clitic cluster form (glielo, te ne…).'),
    ('pronoun_form', 'elision', 'Elided form with apostrophe (m'', t'', l''…).'),
    ('pronoun_form', 'full', 'Full/non-clitic standalone form (io, lui, questo…).'),
    ('pronoun_type', 'clitic', 'Clitic pronoun functioning as object/reflexive attachment to verb.'),
    ('pronoun_type', 'demonstrative', 'Demonstrative pronoun (this/that one).'),
    ('pronoun_type', 'indefinite', 'Indefinite pronoun (someone/anything/none…).'),
    ('pronoun_type', 'personal', 'Personal pronoun (io, tu, lui/lei…).'),
    ('pronoun_type', 'relative', 'Relative pronoun introducing a relative clause (che, cui…).'),
    ('proper_noun_type', 'brand', 'Name of a brand/product line.'),
    ('proper_noun_type', 'organization', 'Name of an organization/institution/agency.'),
    ('proper_noun_type', 'person', 'Personal name (given name/surname/character).'),
    ('proper_noun_type', 'place', 'Place name (country/city/region/etc.).'),
    ('proper_noun_type', 'thing', 'Named thing/entity not covered by other categories (catch-all proper noun).'),
    ('proper_noun_type', 'partitive', 'Partitive-like named grouping label (legacy bucket; use only when defined in the dataset).'),
    ('reflexive', 'reflexive', 'Verb requires/refers to reflexive construction as a core lexical property (uses reflexive clitics).'),
    ('register', 'archaic', 'Archaic/very old usage; not modern standard.'),
    ('register', 'casual', 'Casual everyday speech.'),
    ('register', 'colloquial', 'Colloquial/spoken usage; informal.'),
    ('register', 'dialectal', 'Dialectal/local dialect usage.'),
    ('register', 'formal', 'Formal register (writing/speeches).'),
    ('register', 'informal', 'Informal register (less formal than neutral).'),
    ('register', 'literary', 'Literary style; often written/literature.'),
    ('register', 'mixed', 'Mixed register or multiple registers depending on context.'),
    ('register', 'neutral', 'Neutral standard usage.'),
    ('register', 'obsolete', 'Obsolete/no longer in use in modern language.'),
    ('register', 'poetic', 'Poetic style.'),
    ('register', 'rare', 'Rare usage even within standard language.'),
    ('register', 'regional', 'Regionally limited usage (not necessarily dialect).'),
    ('register', 'slang', 'Slang usage.'),
    ('register', 'vulgar', 'Vulgar/offensive usage.'),
    ('syntactic_function', 'demonstrative_reference', 'Points to a referent as “this/that (one)”. Examples: questo/quello used pronominally.'),
    ('syntactic_function', 'direct_object', 'Used as direct object. Example: mi/lo/la in “mi vede”, “lo vedo”.'),
    ('syntactic_function', 'indirect_object', 'Used as indirect object (to/for someone). Example: mi/gli/le in “gli parlo”, “le do”.'),
    ('syntactic_function', 'indefinite_reference', 'Refers to an unspecified entity. Examples: qualcuno (someone), qualcosa (something).'),
    ('syntactic_function', 'partitive', 'Expresses partitive reference “some/of it”. Example: ne in “ne voglio”.'),
    ('syntactic_function', 'prepositional_object', 'Used after a preposition. Example: me/te/lui in “con me”, “per te”, “da lui”.'),
    ('syntactic_function', 'relative_clause', 'Introduces/anchors a relative clause. Examples: che (that/which), cui (to whom/of which).'),
    ('syntactic_function', 'subject', 'Used as grammatical subject. Example: io in “io parlo”.'),
    ('syntactic_level', 'word_level', 'Typically connects single words or very small constituents. Example: e between two nouns (pane e acqua).'),
    ('syntactic_level', 'phrase_level', 'Typically connects phrases. Example: non solo… ma anche… connecting two noun phrases.'),
    ('syntactic_level', 'clause_level', 'Typically connects clauses/sentences. Example: se piove, resto a casa (if it rains, I stay home).'),
    ('tense', 'indicativo-presente', 'Indicative present tense (ongoing/habitual present).'),
    ('tense', 'indicativo-passato-prossimo', 'Indicative passato prossimo (completed past with present relevance).'),
    ('tense', 'indicativo-imperfetto', 'Indicative imperfetto (ongoing/habitual past; background).'),
    ('tense', 'indicativo-passato-remoto', 'Indicative passato remoto (remote/simple past; often literary/regional).'),
    ('tense', 'indicativo-trapassato-prossimo', 'Indicative trapassato prossimo (pluperfect).'),
    ('tense', 'indicativo-trapassato-remoto', 'Indicative trapassato remoto (literary pluperfect).'),
    ('tense', 'indicativo-futuro', 'Indicative future (will/shall).'),
    ('tense', 'indicativo-futuro-anteriore', 'Indicative future perfect.'),
    ('tense', 'congiuntivo-presente', 'Subjunctive present.'),
    ('tense', 'congiuntivo-imperfetto', 'Subjunctive imperfect.'),
    ('tense', 'congiuntivo-passato', 'Subjunctive past (compound).'),
    ('tense', 'congiuntivo-trapassato', 'Subjunctive pluperfect (compound).'),
    ('tense', 'condizionale-presente', 'Conditional present.'),
    ('tense', 'condizionale-passato', 'Conditional past (compound).'),
    ('tense', 'infinito', 'Infinitive present.'),
    ('tense', 'infinito-passato', 'Infinitive past (compound).'),
    ('tense', 'gerundio', 'Gerund present.'),
    ('tense', 'gerundio-passato', 'Gerund past (compound).'),
    ('tense', 'participio-presente', 'Present participle.'),
    ('tense', 'participio-passato', 'Past participle.'),
    ('tense', 'imperativo', 'Imperative (affirmative).'),
    ('tense', 'imperativo-negativo', 'Imperative negative.'),
    ('transitivity', 'transitive', 'Takes a direct object in this sense (requires/accepts object).'),
    ('transitivity', 'intransitive', 'Does not take a direct object in this sense.'),
    ('transitivity', 'ambitransitive', 'Same sense can be used both with and without a direct object.'),
    ('verb_form_type', 'simple', 'Simple (single-verb) form, not periphrastic/compound.'),
    ('verb_form_type', 'compound', 'Compound form using an auxiliary + participle (e.g., ho parlato).'),
    ('verb_form_type', 'progressive', 'Progressive periphrasis (stare + gerund).'),
    ('verb_type', 'defective-verb', 'Missing some standard conjugation forms (paradigm gaps).'),
    ('verb_type', 'direct-reflexive', 'Reflexive meaning is central; typically used with reflexive clitics.'),
    ('verb_type', 'impersonal-verb', 'Used primarily without a true subject or restricted to 3rd person constructions.'),
    ('verb_type', 'meteorological-verb', 'Weather verb (typical meteorological/impersonal usage).'),
    ('verb_type', 'modal-verb', 'Modal verb that combines with an infinitive to express ability/necessity/volition.'),
    ('verb_type', 'pronominal-variant', 'Pronominal verb variant with fixed clitic particles (e.g., andarsene).'),
    ('verb_type', 'reciprocal', 'Mutual action sense typically requiring plural participants (each other).'),
    ('word_restriction', 'invariable', 'Sense is used without agreement forms (adjective sense-level restriction). Do not teach/generate sense-level agreement forms for this sense.'),
    ('word_restriction', 'missing-first-second-person', 'No 1st/2nd person forms are used/attested for this lemma/sense.'),
    ('word_restriction', 'missing-imperative', 'No imperative forms are used/attested for this lemma/sense.'),
    ('word_restriction', 'plural-only', 'Only used in plural forms (pluralia tantum). Example: forbici (noun); some reciprocal/idiomatic verb senses.'),
    ('word_restriction', 'singular-only', 'Only used in singular forms. Example: mass/abstract nouns or fixed expressions that do not pluralize.'),
    ('word_restriction', 'third-person-only', 'Only used in 3rd person forms (impersonal usage). Example: impersonal verb senses.'),
    ('word_restriction', 'third-singular-only', 'Only used in 3rd person singular forms. Example: weather/impersonal senses.'),
    ('abbreviation_type', 'initialism', 'Pronounced letter-by-letter (e.g., USA).'),
    ('abbreviation_type', 'acronym', 'Pronounced as a word (e.g., NATO).'),
    ('affix_type', 'prefix', 'Affix attached before the base form.')
), resolved as (
  select
    mv.attribute,
    mv.value,
    mv.description,
    ma.id as attribute_id
  from matrix_values mv
  join public.meta_attributes ma on ma.name = mv.attribute
)
update public.meta_values existing
set
  value = r.value,
  description = case when r.description <> '' then r.description else existing.description end,
  is_active = true
from resolved r
where existing.attribute_id = r.attribute_id
  and lower(existing.value) = lower(r.value);

-- 5) Explicit value normalization for known drift
do $$
declare
  r record;
  v_attr_id uuid;
  v_old_id uuid;
  v_new_id uuid;
begin
  for r in
    select * from (
      values
        ('clitic_availability', 'no_clitics', 'no-clitics'),
        ('determiner_type', 'article-indefinite', 'indefinite-article'),
        ('determiner_type', 'indefinite-quantifier', 'quantifier'),
        ('transitivity', 'both', 'ambitransitive')
    ) as map(attribute_name, old_value, new_value)
  loop
    select id into v_attr_id
    from public.meta_attributes
    where name = r.attribute_name
    limit 1;

    if v_attr_id is null then
      continue;
    end if;

    select id into v_new_id
    from public.meta_values
    where attribute_id = v_attr_id
      and lower(value) = lower(r.new_value)
    order by is_active desc, created_at asc
    limit 1;

    if v_new_id is null then
      insert into public.meta_values (
        id, attribute_id, value, description, is_default, sort_order, is_active, created_at, stable_id, shorthand
      )
      values (
        gen_random_uuid(),
        v_attr_id,
        r.new_value,
        'Canonicalized from legacy value ' || r.old_value,
        false,
        null,
        true,
        now(),
        'metaval_norm_' || regexp_replace(r.attribute_name || '_' || r.new_value, '[^a-z0-9]+', '_', 'g'),
        null
      )
      returning id into v_new_id;
    else
      update public.meta_values set value = r.new_value, is_active = true where id = v_new_id;
    end if;

    for v_old_id in
      select id
      from public.meta_values
      where attribute_id = v_attr_id
        and lower(value) = lower(r.old_value)
        and id <> v_new_id
    loop
      update public.entity_meta_values emv
      set value_id = v_new_id,
          attribute_id = v_attr_id
      where emv.value_id = v_old_id
        and not exists (
          select 1
          from public.entity_meta_values dup
          where dup.entity_type = emv.entity_type
            and dup.entity_id = emv.entity_id
            and dup.value_id = v_new_id
        );

      delete from public.entity_meta_values where value_id = v_old_id;
      update public.meta_values set is_active = false where id = v_old_id;
    end loop;
  end loop;
end $$;

-- 6) register:technical migrates to optional_tag:technical_context
do $$
declare
  v_register_attr uuid;
  v_optional_attr uuid;
  v_register_technical uuid;
  v_optional_technical uuid;
begin
  select id into v_register_attr from public.meta_attributes where name = 'register' limit 1;
  select id into v_optional_attr from public.meta_attributes where name = 'optional_tag' limit 1;

  if v_register_attr is null or v_optional_attr is null then
    return;
  end if;

  select id into v_optional_technical
  from public.meta_values
  where attribute_id = v_optional_attr
    and lower(value) = 'technical_context'
  limit 1;

  if v_optional_technical is null then
    insert into public.meta_values (
      id, attribute_id, value, description, is_default, sort_order, is_active, created_at, stable_id, shorthand
    )
    values (
      gen_random_uuid(),
      v_optional_attr,
      'technical_context',
      'Operational technical-context tag moved from register:technical',
      false,
      null,
      true,
      now(),
      'metaval_optional_tag_technical_context',
      null
    )
    returning id into v_optional_technical;
  else
    update public.meta_values set is_active = true where id = v_optional_technical;
  end if;

  select id into v_register_technical
  from public.meta_values
  where attribute_id = v_register_attr
    and lower(value) = 'technical'
  limit 1;

  if v_register_technical is null then
    return;
  end if;

  update public.entity_meta_values emv
  set value_id = v_optional_technical,
      attribute_id = v_optional_attr
  where emv.value_id = v_register_technical
    and not exists (
      select 1
      from public.entity_meta_values dup
      where dup.entity_type = emv.entity_type
        and dup.entity_id = emv.entity_id
        and dup.value_id = v_optional_technical
    );

  delete from public.entity_meta_values where value_id = v_register_technical;
  update public.meta_values set is_active = false where id = v_register_technical;
end $$;

-- 7) Project matrix M/O/G into active word_type metaval rules
with matrix_rules(attribute, word_type, decision) as (
  values
    ('adjective_type', 'adjective', 'M'),
    ('adverb_type', 'adverb', 'M'),
    ('article_pattern', 'noun', 'O'),
    ('auxiliary', 'verb', 'M'),
    ('case', 'pronoun', 'O'),
    ('case_system', 'pronoun', 'M'),
    ('cefr_level', 'noun', 'G'),
    ('cefr_level', 'verb', 'G'),
    ('cefr_level', 'adjective', 'G'),
    ('cefr_level', 'adverb', 'G'),
    ('cefr_level', 'pronoun', 'G'),
    ('cefr_level', 'preposition', 'G'),
    ('cefr_level', 'conjunction', 'G'),
    ('cefr_level', 'determiner', 'G'),
    ('cefr_level', 'interjection', 'G'),
    ('cefr_level', 'phrase', 'G'),
    ('cefr_tier', 'noun', 'G'),
    ('cefr_tier', 'verb', 'G'),
    ('cefr_tier', 'adjective', 'G'),
    ('cefr_tier', 'adverb', 'G'),
    ('cefr_tier', 'pronoun', 'G'),
    ('cefr_tier', 'preposition', 'G'),
    ('cefr_tier', 'conjunction', 'G'),
    ('cefr_tier', 'determiner', 'G'),
    ('cefr_tier', 'interjection', 'G'),
    ('cefr_tier', 'phrase', 'G'),
    ('clitic_availability', 'adverb', 'O'),
    ('conjugation_type', 'verb', 'G'),
    ('conjunction_type', 'conjunction', 'M'),
    ('countable', 'noun', 'M'),
    ('determiner_type', 'determiner', 'M'),
    ('emotional_tone', 'interjection', 'O'),
    ('expression_variant', 'interjection', 'O'),
    ('expression_type', 'noun', 'M'),
    ('expression_type', 'verb', 'M'),
    ('expression_type', 'adjective', 'M'),
    ('expression_type', 'adverb', 'M'),
    ('expression_type', 'pronoun', 'M'),
    ('expression_type', 'preposition', 'M'),
    ('expression_type', 'conjunction', 'M'),
    ('expression_type', 'determiner', 'M'),
    ('expression_type', 'interjection', 'M'),
    ('expression_type', 'phrase', 'M'),
    ('form_irregular', 'noun', 'G'),
    ('form_irregular', 'verb', 'G'),
    ('form_irregular', 'adjective', 'G'),
    ('form_irregular', 'adverb', 'G'),
    ('form_pattern', 'adjective', 'M'),
    ('frequency_rank', 'noun', 'G'),
    ('frequency_rank', 'verb', 'G'),
    ('frequency_rank', 'adjective', 'G'),
    ('frequency_rank', 'adverb', 'G'),
    ('frequency_rank', 'pronoun', 'G'),
    ('frequency_rank', 'preposition', 'G'),
    ('frequency_rank', 'conjunction', 'G'),
    ('frequency_rank', 'determiner', 'G'),
    ('frequency_rank', 'interjection', 'G'),
    ('frequency_rank', 'phrase', 'G'),
    ('frequency_tier', 'noun', 'G'),
    ('frequency_tier', 'verb', 'G'),
    ('frequency_tier', 'adjective', 'G'),
    ('frequency_tier', 'adverb', 'G'),
    ('frequency_tier', 'pronoun', 'G'),
    ('frequency_tier', 'preposition', 'G'),
    ('frequency_tier', 'conjunction', 'G'),
    ('frequency_tier', 'determiner', 'G'),
    ('frequency_tier', 'interjection', 'G'),
    ('frequency_tier', 'phrase', 'G'),
    ('gender', 'noun', 'M'),
    ('gender', 'adjective', 'G'),
    ('gender', 'pronoun', 'O'),
    ('gender', 'preposition', 'O'),
    ('gender', 'determiner', 'O'),
    ('gender_usage', 'noun', 'O'),
    ('gender_usage', 'adjective', 'O'),
    ('government', 'verb', 'O'),
    ('government', 'adjective', 'O'),
    ('government', 'adverb', 'O'),
    ('gradable', 'adjective', 'M'),
    ('interjection_type', 'interjection', 'O'),
    ('interrogative_function', 'pronoun', 'O'),
    ('interrogative_function', 'determiner', 'O'),
    ('logical_relationship', 'conjunction', 'M'),
    ('mood', 'verb', 'G'),
    ('noun_type', 'noun', 'M'),
    ('number', 'noun', 'G'),
    ('number', 'verb', 'G'),
    ('number', 'adjective', 'G'),
    ('number', 'pronoun', 'G'),
    ('number', 'preposition', 'G'),
    ('number', 'determiner', 'G'),
    ('particle_function', 'pronoun', 'O'),
    ('person', 'verb', 'G'),
    ('plural_formation', 'noun', 'M'),
    ('position', 'adjective', 'O'),
    ('phonology_position', 'adjective', 'G'),
    ('preposition_type', 'preposition', 'M'),
    ('pronoun_form', 'pronoun', 'M'),
    ('pronoun_type', 'pronoun', 'M'),
    ('proper_noun_type', 'noun', 'O'),
    ('reflexive', 'verb', 'G'),
    ('register', 'noun', 'M'),
    ('register', 'verb', 'M'),
    ('register', 'adjective', 'M'),
    ('register', 'adverb', 'M'),
    ('register', 'pronoun', 'M'),
    ('register', 'preposition', 'M'),
    ('register', 'conjunction', 'M'),
    ('register', 'determiner', 'M'),
    ('register', 'interjection', 'M'),
    ('register', 'phrase', 'M'),
    ('syntactic_function', 'pronoun', 'M'),
    ('syntactic_level', 'conjunction', 'M'),
    ('tense', 'verb', 'G'),
    ('transitivity', 'verb', 'M'),
    ('verb_form_type', 'verb', 'G'),
    ('verb_type', 'verb', 'O'),
    ('word_restriction', 'noun', 'O'),
    ('word_restriction', 'verb', 'O'),
    ('word_restriction', 'adjective', 'O'),
    ('abbreviation_type', 'abbreviation', 'M'),
    ('affix_type', 'affix', 'M')
), matrix_attributes as (
  select distinct attribute from matrix_rules
)
update public.metaval_rules mr
set is_active = false
from public.meta_attributes ma
where mr.attribute_id = ma.id
  and mr.rule_type = 'word_type'
  and mr.is_active = true
  and ma.name in (select attribute from matrix_attributes);

with matrix_rules(attribute, word_type, decision) as (
  values
    ('adjective_type', 'adjective', 'M'),
    ('adverb_type', 'adverb', 'M'),
    ('article_pattern', 'noun', 'O'),
    ('auxiliary', 'verb', 'M'),
    ('case', 'pronoun', 'O'),
    ('case_system', 'pronoun', 'M'),
    ('cefr_level', 'noun', 'G'),
    ('cefr_level', 'verb', 'G'),
    ('cefr_level', 'adjective', 'G'),
    ('cefr_level', 'adverb', 'G'),
    ('cefr_level', 'pronoun', 'G'),
    ('cefr_level', 'preposition', 'G'),
    ('cefr_level', 'conjunction', 'G'),
    ('cefr_level', 'determiner', 'G'),
    ('cefr_level', 'interjection', 'G'),
    ('cefr_level', 'phrase', 'G'),
    ('cefr_tier', 'noun', 'G'),
    ('cefr_tier', 'verb', 'G'),
    ('cefr_tier', 'adjective', 'G'),
    ('cefr_tier', 'adverb', 'G'),
    ('cefr_tier', 'pronoun', 'G'),
    ('cefr_tier', 'preposition', 'G'),
    ('cefr_tier', 'conjunction', 'G'),
    ('cefr_tier', 'determiner', 'G'),
    ('cefr_tier', 'interjection', 'G'),
    ('cefr_tier', 'phrase', 'G'),
    ('clitic_availability', 'adverb', 'O'),
    ('conjugation_type', 'verb', 'G'),
    ('conjunction_type', 'conjunction', 'M'),
    ('countable', 'noun', 'M'),
    ('determiner_type', 'determiner', 'M'),
    ('emotional_tone', 'interjection', 'O'),
    ('expression_variant', 'interjection', 'O'),
    ('expression_type', 'noun', 'M'),
    ('expression_type', 'verb', 'M'),
    ('expression_type', 'adjective', 'M'),
    ('expression_type', 'adverb', 'M'),
    ('expression_type', 'pronoun', 'M'),
    ('expression_type', 'preposition', 'M'),
    ('expression_type', 'conjunction', 'M'),
    ('expression_type', 'determiner', 'M'),
    ('expression_type', 'interjection', 'M'),
    ('expression_type', 'phrase', 'M'),
    ('form_irregular', 'noun', 'G'),
    ('form_irregular', 'verb', 'G'),
    ('form_irregular', 'adjective', 'G'),
    ('form_irregular', 'adverb', 'G'),
    ('form_pattern', 'adjective', 'M'),
    ('frequency_rank', 'noun', 'G'),
    ('frequency_rank', 'verb', 'G'),
    ('frequency_rank', 'adjective', 'G'),
    ('frequency_rank', 'adverb', 'G'),
    ('frequency_rank', 'pronoun', 'G'),
    ('frequency_rank', 'preposition', 'G'),
    ('frequency_rank', 'conjunction', 'G'),
    ('frequency_rank', 'determiner', 'G'),
    ('frequency_rank', 'interjection', 'G'),
    ('frequency_rank', 'phrase', 'G'),
    ('frequency_tier', 'noun', 'G'),
    ('frequency_tier', 'verb', 'G'),
    ('frequency_tier', 'adjective', 'G'),
    ('frequency_tier', 'adverb', 'G'),
    ('frequency_tier', 'pronoun', 'G'),
    ('frequency_tier', 'preposition', 'G'),
    ('frequency_tier', 'conjunction', 'G'),
    ('frequency_tier', 'determiner', 'G'),
    ('frequency_tier', 'interjection', 'G'),
    ('frequency_tier', 'phrase', 'G'),
    ('gender', 'noun', 'M'),
    ('gender', 'adjective', 'G'),
    ('gender', 'pronoun', 'O'),
    ('gender', 'preposition', 'O'),
    ('gender', 'determiner', 'O'),
    ('gender_usage', 'noun', 'O'),
    ('gender_usage', 'adjective', 'O'),
    ('government', 'verb', 'O'),
    ('government', 'adjective', 'O'),
    ('government', 'adverb', 'O'),
    ('gradable', 'adjective', 'M'),
    ('interjection_type', 'interjection', 'O'),
    ('interrogative_function', 'pronoun', 'O'),
    ('interrogative_function', 'determiner', 'O'),
    ('logical_relationship', 'conjunction', 'M'),
    ('mood', 'verb', 'G'),
    ('noun_type', 'noun', 'M'),
    ('number', 'noun', 'G'),
    ('number', 'verb', 'G'),
    ('number', 'adjective', 'G'),
    ('number', 'pronoun', 'G'),
    ('number', 'preposition', 'G'),
    ('number', 'determiner', 'G'),
    ('particle_function', 'pronoun', 'O'),
    ('person', 'verb', 'G'),
    ('plural_formation', 'noun', 'M'),
    ('position', 'adjective', 'O'),
    ('phonology_position', 'adjective', 'G'),
    ('preposition_type', 'preposition', 'M'),
    ('pronoun_form', 'pronoun', 'M'),
    ('pronoun_type', 'pronoun', 'M'),
    ('proper_noun_type', 'noun', 'O'),
    ('reflexive', 'verb', 'G'),
    ('register', 'noun', 'M'),
    ('register', 'verb', 'M'),
    ('register', 'adjective', 'M'),
    ('register', 'adverb', 'M'),
    ('register', 'pronoun', 'M'),
    ('register', 'preposition', 'M'),
    ('register', 'conjunction', 'M'),
    ('register', 'determiner', 'M'),
    ('register', 'interjection', 'M'),
    ('register', 'phrase', 'M'),
    ('syntactic_function', 'pronoun', 'M'),
    ('syntactic_level', 'conjunction', 'M'),
    ('tense', 'verb', 'G'),
    ('transitivity', 'verb', 'M'),
    ('verb_form_type', 'verb', 'G'),
    ('verb_type', 'verb', 'O'),
    ('word_restriction', 'noun', 'O'),
    ('word_restriction', 'verb', 'O'),
    ('word_restriction', 'adjective', 'O'),
    ('abbreviation_type', 'abbreviation', 'M'),
    ('affix_type', 'affix', 'M')
)
insert into public.metaval_rules (
  id,
  rule_type,
  rule_config,
  attribute_id,
  is_active,
  priority,
  word_type,
  created_at,
  updated_at
)
select
  gen_random_uuid(),
  'word_type',
  jsonb_build_object(
    'is_mandatory', (mr.decision = 'M'),
    'generated', (mr.decision = 'G'),
    'matrix_version', '5'
  ),
  ma.id,
  true,
  50,
  mr.word_type,
  now(),
  now()
from matrix_rules mr
join public.meta_attributes ma on ma.name = mr.attribute;

-- 8) optional_tag rules are explicit exception rules, outside matrix M/O/G
update public.metaval_rules mr
set is_active = false
from public.meta_attributes ma
where mr.attribute_id = ma.id
  and mr.rule_type = 'word_type'
  and mr.is_active = true
  and ma.name = 'optional_tag';

insert into public.metaval_rules (
  id, rule_type, rule_config, attribute_id, is_active, priority, word_type, created_at, updated_at
)
select
  gen_random_uuid(),
  'word_type',
  jsonb_build_object('is_mandatory', false, 'generated', false, 'optional_namespace', true),
  ma.id,
  true,
  25,
  wt.word_type,
  now(),
  now()
from public.meta_attributes ma
cross join (
  values
    ('noun'), ('verb'), ('adjective'), ('adverb'), ('preposition'), ('pronoun'),
    ('determiner'), ('conjunction'), ('interjection'), ('phrase'), ('abbreviation'), ('affix'), ('symbol')
) as wt(word_type)
where ma.name = 'optional_tag';

-- 9) Ensure plan-critical values are present/active
with required_values(attribute, value, description) as (
  values
    ('government', 'governs_su', 'Governs preposition su for this sense/context.'),
    ('clitic_availability', 'reciprocal-clitic', 'Reciprocal clitic usage is available for this item.')
), resolved as (
  select rv.attribute, rv.value, rv.description, ma.id as attribute_id
  from required_values rv
  join public.meta_attributes ma on ma.name = rv.attribute
)
insert into public.meta_values (
  id, attribute_id, value, description, is_default, sort_order, is_active, created_at, stable_id, shorthand
)
select
  gen_random_uuid(),
  r.attribute_id,
  r.value,
  r.description,
  false,
  null,
  true,
  now(),
  'metaval_required_' || regexp_replace(r.attribute || '_' || r.value, '[^a-z0-9]+', '_', 'g'),
  null
from resolved r
where not exists (
  select 1
  from public.meta_values existing
  where existing.attribute_id = r.attribute_id
    and lower(existing.value) = lower(r.value)
);

with required_values(attribute, value) as (
  values
    ('government', 'governs_su'),
    ('clitic_availability', 'reciprocal-clitic')
), resolved as (
  select rv.attribute, rv.value, ma.id as attribute_id
  from required_values rv
  join public.meta_attributes ma on ma.name = rv.attribute
)
update public.meta_values existing
set is_active = true,
    value = r.value
from resolved r
where existing.attribute_id = r.attribute_id
  and lower(existing.value) = lower(r.value);
