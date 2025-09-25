-- =============================================================================
-- ITALIAN INTERJECTIONS - DOCUMENT 9 PRODUCTION-READY IMPLEMENTATION
-- Linguistically Accurate Metadata and Data Implementation
--
-- ARCHITECTURAL UPDATE: Unified Form Type System (following verb pattern)
-- - Single form_type: 'expression' for ALL interjection variants
-- - Expression Variant attribute (metaattr052) captures specific form characteristics
-- - Follows established verb pattern: verbs use 'conjugation' + attributes, interjections use 'expression' + attributes
-- =============================================================================

-- =============================================================================
-- SECTION 1: META ATTRIBUTES CREATION
-- =============================================================================

-- Create Interjection Type attribute
INSERT INTO meta_attributes (id, stable_id, name, display_name, description, source_level, display_level)
VALUES (
  gen_random_uuid(),
  'metaattr050',
  'interjection_type',
  'Interjection Type',
  'Classifies interjections by linguistic category following Italian grammatical tradition',
  'word',
  'word'
);

-- Create Emotional Tone attribute
INSERT INTO meta_attributes (id, stable_id, name, display_name, description, source_level, display_level)
VALUES (
  gen_random_uuid(),
  'metaattr051',
  'emotional_tone',
  'Emotional Tone',
  'Indicates the emotional or pragmatic tone conveyed by the interjection',
  'word',
  'word'
);

-- Create Expression Variant attribute (following verb pattern)
INSERT INTO meta_attributes (id, stable_id, name, display_name, description, source_level, display_level)
VALUES (
  gen_random_uuid(),
  'metaattr052',
  'expression_variant',
  'Expression Variant',
  'Indicates the specific variant form of the interjection expression (base, exclamatory, lengthened, etc.)',
  'form',
  'form'
);

-- =============================================================================
-- SECTION 2: META VALUES CREATION
-- =============================================================================

-- Interjection Type Values (metaattr050)
INSERT INTO meta_values (id, attribute_id, stable_id, value, shorthand, description) VALUES
(gen_random_uuid(), (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr050'), 'metaattr050val001', 'primary', 'PRIM', 'Primary interjections (interiezioni proprie): pure vocal expressions like ah, oh, beh'),
(gen_random_uuid(), (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr050'), 'metaattr050val002', 'greeting', 'GREET', 'Lexicalized greeting interjections: social formulas like ciao, salve, buongiorno'),
(gen_random_uuid(), (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr050'), 'metaattr050val003', 'cultural-phrase', 'CULT', 'Cultural interjective phrases (locuzioni interiettive): mamma mia, perbacco');

-- Emotional Tone Values (metaattr051)
INSERT INTO meta_values (id, attribute_id, stable_id, value, shorthand, description) VALUES
(gen_random_uuid(), (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr051'), 'metaattr051val001', 'positive', 'POS', 'Conveys positive emotions or reactions: pleasant greetings, positive surprise'),
(gen_random_uuid(), (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr051'), 'metaattr051val002', 'negative', 'NEG', 'Conveys negative emotions: pain, frustration, displeasure'),
(gen_random_uuid(), (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr051'), 'metaattr051val003', 'neutral', 'NEUT', 'Processing markers or neutral expressions: thinking time, transitions'),
(gen_random_uuid(), (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr051'), 'metaattr051val004', 'surprise', 'SURP', 'Expresses surprise or wonder: unexpected reactions, amazement'),
(gen_random_uuid(), (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr051'), 'metaattr051val005', 'doubt', 'DOUBT', 'Indicates uncertainty or skepticism: questioning, hesitation'),
(gen_random_uuid(), (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr051'), 'metaattr051val006', 'high-sensitivity', 'SENS', 'Requires cultural sensitivity - religious, generational, or stereotyping concerns');

-- Expression Variant Values (metaattr052) - following verb pattern
INSERT INTO meta_values (id, attribute_id, stable_id, value, shorthand, description) VALUES
(gen_random_uuid(), (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr052'), 'metaattr052val001', 'base', 'BASE', 'Base form of the interjection (ah, ciao, mamma mia)'),
(gen_random_uuid(), (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr052'), 'metaattr052val002', 'exclamatory', 'EXCL', 'With exclamation point (ah!, Ciao!, mamma mia!)'),
(gen_random_uuid(), (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr052'), 'metaattr052val003', 'lengthened', 'LENG', 'Emotional lengthening (aaah, oooh, beeh)'),
(gen_random_uuid(), (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr052'), 'metaattr052val004', 'questioning', 'QUES', 'With question mark (eh?, mah?)'),
(gen_random_uuid(), (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr052'), 'metaattr052val005', 'capitalized', 'CAPS', 'Sentence-initial forms (Ciao, Salve)'),
(gen_random_uuid(), (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr052'), 'metaattr052val006', 'repeated', 'REPT', 'Emphatic repetition (no no no, ah ah)');

-- =============================================================================
-- SECTION 3: DICTIONARY ENTRIES - PRIMARY INTERJECTIONS
-- =============================================================================

-- Emotional Exclamations
INSERT INTO dictionary (italian, word_type, phonetic_pronunciation, ipa_pronunciation) VALUES
('ah', 'interjection', 'AH', '/a/'),
('oh', 'interjection', 'OH', '/o/'),
('eh', 'interjection', 'EH', '/e/'),
('uh', 'interjection', 'UH', '/u/'),
('ahi', 'interjection', 'AH-ee', '/ˈa.i/'),
('uff', 'interjection', 'UFF', '/uf/');

-- Hesitation and Processing Markers
INSERT INTO dictionary (italian, word_type, phonetic_pronunciation, ipa_pronunciation) VALUES
('beh', 'interjection', 'BEH', '/be/'),
('mah', 'interjection', 'MAH', '/ma/'),
('boh', 'interjection', 'BOH', '/bo/'),
('ecco', 'interjection', 'EK-ko', '/ˈek.ko/'),
('insomma', 'interjection', 'in-SOM-ma', '/in.ˈsom.ma/');

-- =============================================================================
-- SECTION 4: DICTIONARY ENTRIES - GREETING INTERJECTIONS
-- =============================================================================

-- Social Greeting Formulas
INSERT INTO dictionary (italian, word_type, phonetic_pronunciation, ipa_pronunciation) VALUES
('ciao', 'interjection', 'CHOW', '/ˈtʃa.o/'),
('salve', 'interjection', 'SAL-ve', '/ˈsal.ve/'),
('arrivederci', 'interjection', 'ah-ri-ve-DER-chi', '/ar.ri.veˈder.tʃi/');

-- Time-Specific Greetings
INSERT INTO dictionary (italian, word_type, phonetic_pronunciation, ipa_pronunciation) VALUES
('buongiorno', 'interjection', 'bwo-n JHOR-no', '/bwon ˈdʒor.no/'),
('buonasera', 'interjection', 'bwo-na SE-ra', '/bwo.na ˈse.ra/'),
('buonanotte', 'interjection', 'bwo-na NOT-te', '/bwo.na ˈnot.te/');

-- =============================================================================
-- SECTION 5: DICTIONARY ENTRIES - CULTURAL INTERJECTIVE PHRASES
-- =============================================================================

-- Italian Cultural Expressions
INSERT INTO dictionary (italian, word_type, phonetic_pronunciation, ipa_pronunciation) VALUES
('mamma mia', 'interjection', 'MAH-ma MEE-a', '/ˈmam.ma ˈmi.a/'),
('perbacco', 'interjection', 'per-BAK-ko', '/perˈbak.ko/'),
('madonna', 'interjection', 'ma-DON-na', '/maˈdon.na/'),
('accidenti', 'interjection', 'ah-chi-DEN-ti', '/at.tʃiˈden.ti/');

-- =============================================================================
-- SECTION 6: WORD FORMS - EMPHASIS AND VARIATION PATTERNS
-- =============================================================================

-- Primary Interjection Forms (unified expression form_type)
INSERT INTO word_forms (word_id, form_text, form_type, phonetic_pronunciation, ipa_pronunciation) VALUES
((SELECT id FROM dictionary WHERE italian = 'ah'), 'ah!', 'expression', 'AH', '/a/'),
((SELECT id FROM dictionary WHERE italian = 'ah'), 'aaah', 'expression', 'AAH-ah', '/ˈa.a.a/'),
((SELECT id FROM dictionary WHERE italian = 'oh'), 'oh!', 'expression', 'OH', '/o/'),
((SELECT id FROM dictionary WHERE italian = 'oh'), 'oooh', 'expression', 'OOH-oh', '/ˈo.o.o/'),
((SELECT id FROM dictionary WHERE italian = 'eh'), 'eh?', 'expression', 'EH', '/e/'),
((SELECT id FROM dictionary WHERE italian = 'uff'), 'uffa', 'expression', 'UF-fa', '/ˈuf.fa/');

-- Hesitation Marker Forms (unified expression form_type)
INSERT INTO word_forms (word_id, form_text, form_type, phonetic_pronunciation, ipa_pronunciation) VALUES
((SELECT id FROM dictionary WHERE italian = 'beh'), 'beeh', 'expression', 'BEH-eh', '/ˈbe.e/'),
((SELECT id FROM dictionary WHERE italian = 'mah'), 'maah', 'expression', 'MAH-ah', '/ˈma.a/'),
((SELECT id FROM dictionary WHERE italian = 'ecco'), 'ecco!', 'expression', 'EK-ko', '/ˈek.ko/');

-- Greeting Forms (unified expression form_type)
INSERT INTO word_forms (word_id, form_text, form_type, phonetic_pronunciation, ipa_pronunciation) VALUES
((SELECT id FROM dictionary WHERE italian = 'ciao'), 'Ciao', 'expression', 'CHOW', '/ˈtʃa.o/'),
((SELECT id FROM dictionary WHERE italian = 'ciao'), 'Ciao!', 'expression', 'CHOW', '/ˈtʃa.o/'),
((SELECT id FROM dictionary WHERE italian = 'salve'), 'Salve!', 'expression', 'SAL-ve', '/ˈsal.ve/'),
((SELECT id FROM dictionary WHERE italian = 'arrivederci'), 'Arrivederci!', 'expression', 'ah-ri-ve-DER-chi', '/ar.ri.veˈder.tʃi/');

-- Cultural Phrase Forms (unified expression form_type)
INSERT INTO word_forms (word_id, form_text, form_type, phonetic_pronunciation, ipa_pronunciation) VALUES
((SELECT id FROM dictionary WHERE italian = 'mamma mia'), 'mamma mia!', 'expression', 'MAH-ma MEE-a', '/ˈmam.ma ˈmi.a/'),
((SELECT id FROM dictionary WHERE italian = 'perbacco'), 'perbacco!', 'expression', 'per-BAK-ko', '/perˈbak.ko/'),
((SELECT id FROM dictionary WHERE italian = 'madonna'), 'madonna!', 'expression', 'ma-DON-na', '/maˈdon.na/'),
((SELECT id FROM dictionary WHERE italian = 'madonna'), 'madonna mia!', 'expression', 'ma-DON-na MEE-a', '/maˈdon.na ˈmi.a/'),
((SELECT id FROM dictionary WHERE italian = 'accidenti'), 'accidenti!', 'expression', 'ah-chi-DEN-ti', '/at.tʃiˈden.ti/');

-- =============================================================================
-- SECTION 7: INTERJECTION TYPE METADATA
-- =============================================================================

-- Primary Interjections (interiezioni proprie)
INSERT INTO entity_meta_values (entity_id, meta_attribute_id, meta_value_id) VALUES
((SELECT id FROM dictionary WHERE italian = 'ah'), (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr050'), (SELECT id FROM meta_values WHERE value = 'primary')),
((SELECT id FROM dictionary WHERE italian = 'oh'), (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr050'), (SELECT id FROM meta_values WHERE value = 'primary')),
((SELECT id FROM dictionary WHERE italian = 'eh'), (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr050'), (SELECT id FROM meta_values WHERE value = 'primary')),
((SELECT id FROM dictionary WHERE italian = 'uh'), (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr050'), (SELECT id FROM meta_values WHERE value = 'primary')),
((SELECT id FROM dictionary WHERE italian = 'ahi'), (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr050'), (SELECT id FROM meta_values WHERE value = 'primary')),
((SELECT id FROM dictionary WHERE italian = 'uff'), (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr050'), (SELECT id FROM meta_values WHERE value = 'primary')),
((SELECT id FROM dictionary WHERE italian = 'beh'), (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr050'), (SELECT id FROM meta_values WHERE value = 'primary')),
((SELECT id FROM dictionary WHERE italian = 'mah'), (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr050'), (SELECT id FROM meta_values WHERE value = 'primary')),
((SELECT id FROM dictionary WHERE italian = 'boh'), (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr050'), (SELECT id FROM meta_values WHERE value = 'primary')),
((SELECT id FROM dictionary WHERE italian = 'ecco'), (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr050'), (SELECT id FROM meta_values WHERE value = 'primary')),
((SELECT id FROM dictionary WHERE italian = 'insomma'), (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr050'), (SELECT id FROM meta_values WHERE value = 'primary'));

-- Greeting Interjections (lexicalized social formulas)
INSERT INTO entity_meta_values (entity_id, meta_attribute_id, meta_value_id) VALUES
((SELECT id FROM dictionary WHERE italian = 'ciao'), (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr050'), (SELECT id FROM meta_values WHERE value = 'greeting')),
((SELECT id FROM dictionary WHERE italian = 'salve'), (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr050'), (SELECT id FROM meta_values WHERE value = 'greeting')),
((SELECT id FROM dictionary WHERE italian = 'arrivederci'), (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr050'), (SELECT id FROM meta_values WHERE value = 'greeting')),
((SELECT id FROM dictionary WHERE italian = 'buongiorno'), (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr050'), (SELECT id FROM meta_values WHERE value = 'greeting')),
((SELECT id FROM dictionary WHERE italian = 'buonasera'), (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr050'), (SELECT id FROM meta_values WHERE value = 'greeting')),
((SELECT id FROM dictionary WHERE italian = 'buonanotte'), (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr050'), (SELECT id FROM meta_values WHERE value = 'greeting'));

-- Cultural Interjective Phrases (locuzioni interiettive)
INSERT INTO entity_meta_values (entity_id, meta_attribute_id, meta_value_id) VALUES
((SELECT id FROM dictionary WHERE italian = 'mamma mia'), (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr050'), (SELECT id FROM meta_values WHERE value = 'cultural-phrase')),
((SELECT id FROM dictionary WHERE italian = 'perbacco'), (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr050'), (SELECT id FROM meta_values WHERE value = 'cultural-phrase')),
((SELECT id FROM dictionary WHERE italian = 'madonna'), (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr050'), (SELECT id FROM meta_values WHERE value = 'cultural-phrase')),
((SELECT id FROM dictionary WHERE italian = 'accidenti'), (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr050'), (SELECT id FROM meta_values WHERE value = 'cultural-phrase'));

-- =============================================================================
-- SECTION 8: EMOTIONAL TONE METADATA
-- =============================================================================

-- Positive Tone
INSERT INTO entity_meta_values (entity_id, meta_attribute_id, meta_value_id) VALUES
((SELECT id FROM dictionary WHERE italian = 'ciao'), (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr051'), (SELECT id FROM meta_values WHERE value = 'positive')),
((SELECT id FROM dictionary WHERE italian = 'buongiorno'), (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr051'), (SELECT id FROM meta_values WHERE value = 'positive')),
((SELECT id FROM dictionary WHERE italian = 'buonasera'), (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr051'), (SELECT id FROM meta_values WHERE value = 'positive'));

-- Negative Tone
INSERT INTO entity_meta_values (entity_id, meta_attribute_id, meta_value_id) VALUES
((SELECT id FROM dictionary WHERE italian = 'ahi'), (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr051'), (SELECT id FROM meta_values WHERE value = 'negative')),
((SELECT id FROM dictionary WHERE italian = 'uff'), (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr051'), (SELECT id FROM meta_values WHERE value = 'negative')),
((SELECT id FROM dictionary WHERE italian = 'accidenti'), (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr051'), (SELECT id FROM meta_values WHERE value = 'negative'));

-- Neutral Tone
INSERT INTO entity_meta_values (entity_id, meta_attribute_id, meta_value_id) VALUES
((SELECT id FROM dictionary WHERE italian = 'ah'), (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr051'), (SELECT id FROM meta_values WHERE value = 'neutral')),
((SELECT id FROM dictionary WHERE italian = 'salve'), (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr051'), (SELECT id FROM meta_values WHERE value = 'neutral')),
((SELECT id FROM dictionary WHERE italian = 'arrivederci'), (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr051'), (SELECT id FROM meta_values WHERE value = 'neutral')),
((SELECT id FROM dictionary WHERE italian = 'buonanotte'), (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr051'), (SELECT id FROM meta_values WHERE value = 'neutral')),
((SELECT id FROM dictionary WHERE italian = 'beh'), (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr051'), (SELECT id FROM meta_values WHERE value = 'neutral')),
((SELECT id FROM dictionary WHERE italian = 'ecco'), (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr051'), (SELECT id FROM meta_values WHERE value = 'neutral')),
((SELECT id FROM dictionary WHERE italian = 'insomma'), (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr051'), (SELECT id FROM meta_values WHERE value = 'neutral'));

-- Surprise Tone
INSERT INTO entity_meta_values (entity_id, meta_attribute_id, meta_value_id) VALUES
((SELECT id FROM dictionary WHERE italian = 'oh'), (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr051'), (SELECT id FROM meta_values WHERE value = 'surprise')),
((SELECT id FROM dictionary WHERE italian = 'mamma mia'), (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr051'), (SELECT id FROM meta_values WHERE value = 'surprise')),
((SELECT id FROM dictionary WHERE italian = 'perbacco'), (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr051'), (SELECT id FROM meta_values WHERE value = 'surprise'));

-- High-Sensitivity Tone (Cultural expressions requiring special awareness)
INSERT INTO entity_meta_values (entity_id, meta_attribute_id, meta_value_id) VALUES
((SELECT id FROM dictionary WHERE italian = 'madonna'), (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr051'), (SELECT id FROM meta_values WHERE value = 'high-sensitivity'));

-- Doubt Tone
INSERT INTO entity_meta_values (entity_id, meta_attribute_id, meta_value_id) VALUES
((SELECT id FROM dictionary WHERE italian = 'eh'), (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr051'), (SELECT id FROM meta_values WHERE value = 'doubt')),
((SELECT id FROM dictionary WHERE italian = 'uh'), (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr051'), (SELECT id FROM meta_values WHERE value = 'doubt')),
((SELECT id FROM dictionary WHERE italian = 'mah'), (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr051'), (SELECT id FROM meta_values WHERE value = 'doubt')),
((SELECT id FROM dictionary WHERE italian = 'boh'), (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr051'), (SELECT id FROM meta_values WHERE value = 'doubt'));

-- =============================================================================
-- SECTION 9: UNIVERSAL INTERJECTION METADATA
-- =============================================================================

-- Gender: All interjections are common-gender (invariable)
INSERT INTO entity_meta_values (entity_id, meta_attribute_id, meta_value_id)
SELECT d.id,
       (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr011'),
       (SELECT id FROM meta_values WHERE value = 'common-gender')
FROM dictionary d
WHERE d.word_type = 'interjection';

-- Number: All interjections are singular (invariable)
INSERT INTO entity_meta_values (entity_id, meta_attribute_id, meta_value_id)
SELECT d.id,
       (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr012'),
       (SELECT id FROM meta_values WHERE value = 'singular')
FROM dictionary d
WHERE d.word_type = 'interjection';

-- =============================================================================
-- SECTION 10: REGISTER CLASSIFICATION
-- =============================================================================

-- Informal Register (use with family, friends, peers)
INSERT INTO entity_meta_values (entity_id, meta_attribute_id, meta_value_id) VALUES
((SELECT id FROM dictionary WHERE italian = 'ciao'), (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr018'), (SELECT id FROM meta_values WHERE value = 'informal')),
((SELECT id FROM dictionary WHERE italian = 'mamma mia'), (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr018'), (SELECT id FROM meta_values WHERE value = 'informal')),
((SELECT id FROM dictionary WHERE italian = 'madonna'), (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr018'), (SELECT id FROM meta_values WHERE value = 'informal')),
((SELECT id FROM dictionary WHERE italian = 'accidenti'), (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr018'), (SELECT id FROM meta_values WHERE value = 'informal'));

-- Formal Register (use with authority figures, professional contexts)
INSERT INTO entity_meta_values (entity_id, meta_attribute_id, meta_value_id) VALUES
((SELECT id FROM dictionary WHERE italian = 'salve'), (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr018'), (SELECT id FROM meta_values WHERE value = 'formal')),
((SELECT id FROM dictionary WHERE italian = 'arrivederci'), (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr018'), (SELECT id FROM meta_values WHERE value = 'formal')),
((SELECT id FROM dictionary WHERE italian = 'perbacco'), (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr018'), (SELECT id FROM meta_values WHERE value = 'formal'));

-- Neutral Register (appropriate in most contexts)
INSERT INTO entity_meta_values (entity_id, meta_attribute_id, meta_value_id) VALUES
((SELECT id FROM dictionary WHERE italian = 'buongiorno'), (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr018'), (SELECT id FROM meta_values WHERE value = 'neutral')),
((SELECT id FROM dictionary WHERE italian = 'buonasera'), (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr018'), (SELECT id FROM meta_values WHERE value = 'neutral')),
((SELECT id FROM dictionary WHERE italian = 'buonanotte'), (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr018'), (SELECT id FROM meta_values WHERE value = 'neutral'));

-- =============================================================================
-- SECTION 11: CEFR LEVEL CLASSIFICATION
-- =============================================================================

-- A1 Level (Essential beginner interjections)
INSERT INTO entity_meta_values (entity_id, meta_attribute_id, meta_value_id) VALUES
((SELECT id FROM dictionary WHERE italian = 'ah'), (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr003'), (SELECT id FROM meta_values WHERE value = 'A1')),
((SELECT id FROM dictionary WHERE italian = 'oh'), (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr003'), (SELECT id FROM meta_values WHERE value = 'A1')),
((SELECT id FROM dictionary WHERE italian = 'ciao'), (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr003'), (SELECT id FROM meta_values WHERE value = 'A1')),
((SELECT id FROM dictionary WHERE italian = 'buongiorno'), (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr003'), (SELECT id FROM meta_values WHERE value = 'A1')),
((SELECT id FROM dictionary WHERE italian = 'buonasera'), (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr003'), (SELECT id FROM meta_values WHERE value = 'A1'));

-- A2 Level (Expanded emotional expression)
INSERT INTO entity_meta_values (entity_id, meta_attribute_id, meta_value_id) VALUES
((SELECT id FROM dictionary WHERE italian = 'eh'), (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr003'), (SELECT id FROM meta_values WHERE value = 'A2')),
((SELECT id FROM dictionary WHERE italian = 'uh'), (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr003'), (SELECT id FROM meta_values WHERE value = 'A2')),
((SELECT id FROM dictionary WHERE italian = 'ahi'), (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr003'), (SELECT id FROM meta_values WHERE value = 'A2')),
((SELECT id FROM dictionary WHERE italian = 'uff'), (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr003'), (SELECT id FROM meta_values WHERE value = 'A2')),
((SELECT id FROM dictionary WHERE italian = 'beh'), (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr003'), (SELECT id FROM meta_values WHERE value = 'A2')),
((SELECT id FROM dictionary WHERE italian = 'mah'), (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr003'), (SELECT id FROM meta_values WHERE value = 'A2')),
((SELECT id FROM dictionary WHERE italian = 'ecco'), (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr003'), (SELECT id FROM meta_values WHERE value = 'A2')),
((SELECT id FROM dictionary WHERE italian = 'salve'), (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr003'), (SELECT id FROM meta_values WHERE value = 'A2')),
((SELECT id FROM dictionary WHERE italian = 'arrivederci'), (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr003'), (SELECT id FROM meta_values WHERE value = 'A2')),
((SELECT id FROM dictionary WHERE italian = 'buonanotte'), (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr003'), (SELECT id FROM meta_values WHERE value = 'A2'));

-- B1 Level (Cultural integration and discourse management)
INSERT INTO entity_meta_values (entity_id, meta_attribute_id, meta_value_id) VALUES
((SELECT id FROM dictionary WHERE italian = 'boh'), (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr003'), (SELECT id FROM meta_values WHERE value = 'B1')),
((SELECT id FROM dictionary WHERE italian = 'insomma'), (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr003'), (SELECT id FROM meta_values WHERE value = 'B1')),
((SELECT id FROM dictionary WHERE italian = 'mamma mia'), (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr003'), (SELECT id FROM meta_values WHERE value = 'B1')),
((SELECT id FROM dictionary WHERE italian = 'madonna'), (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr003'), (SELECT id FROM meta_values WHERE value = 'B1')),
((SELECT id FROM dictionary WHERE italian = 'accidenti'), (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr003'), (SELECT id FROM meta_values WHERE value = 'B1'));

-- B2 Level (Advanced cultural competence)
INSERT INTO entity_meta_values (entity_id, meta_attribute_id, meta_value_id) VALUES
((SELECT id FROM dictionary WHERE italian = 'perbacco'), (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr003'), (SELECT id FROM meta_values WHERE value = 'B2'));

-- =============================================================================
-- SECTION 12: FREQUENCY TIER CLASSIFICATION
-- =============================================================================

-- Top 100 (Essential everyday interjections)
INSERT INTO entity_meta_values (entity_id, meta_attribute_id, meta_value_id) VALUES
((SELECT id FROM dictionary WHERE italian = 'ciao'), (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr007'), (SELECT id FROM meta_values WHERE value = 'top100'));

-- Top 500 (Common emotional expressions and greetings)
INSERT INTO entity_meta_values (entity_id, meta_attribute_id, meta_value_id) VALUES
((SELECT id FROM dictionary WHERE italian = 'ah'), (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr007'), (SELECT id FROM meta_values WHERE value = 'top500')),
((SELECT id FROM dictionary WHERE italian = 'oh'), (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr007'), (SELECT id FROM meta_values WHERE value = 'top500')),
((SELECT id FROM dictionary WHERE italian = 'buongiorno'), (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr007'), (SELECT id FROM meta_values WHERE value = 'top500')),
((SELECT id FROM dictionary WHERE italian = 'buonasera'), (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr007'), (SELECT id FROM meta_values WHERE value = 'top500')),
((SELECT id FROM dictionary WHERE italian = 'ecco'), (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr007'), (SELECT id FROM meta_values WHERE value = 'top500'));

-- Top 1000 (Extended vocabulary)
INSERT INTO entity_meta_values (entity_id, meta_attribute_id, meta_value_id) VALUES
((SELECT id FROM dictionary WHERE italian = 'eh'), (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr007'), (SELECT id FROM meta_values WHERE value = 'top1000')),
((SELECT id FROM dictionary WHERE italian = 'uh'), (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr007'), (SELECT id FROM meta_values WHERE value = 'top1000')),
((SELECT id FROM dictionary WHERE italian = 'ahi'), (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr007'), (SELECT id FROM meta_values WHERE value = 'top1000')),
((SELECT id FROM dictionary WHERE italian = 'uff'), (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr007'), (SELECT id FROM meta_values WHERE value = 'top1000')),
((SELECT id FROM dictionary WHERE italian = 'beh'), (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr007'), (SELECT id FROM meta_values WHERE value = 'top1000')),
((SELECT id FROM dictionary WHERE italian = 'mah'), (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr007'), (SELECT id FROM meta_values WHERE value = 'top1000')),
((SELECT id FROM dictionary WHERE italian = 'boh'), (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr007'), (SELECT id FROM meta_values WHERE value = 'top1000')),
((SELECT id FROM dictionary WHERE italian = 'salve'), (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr007'), (SELECT id FROM meta_values WHERE value = 'top1000')),
((SELECT id FROM dictionary WHERE italian = 'arrivederci'), (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr007'), (SELECT id FROM meta_values WHERE value = 'top1000')),
((SELECT id FROM dictionary WHERE italian = 'buonanotte'), (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr007'), (SELECT id FROM meta_values WHERE value = 'top1000')),
((SELECT id FROM dictionary WHERE italian = 'insomma'), (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr007'), (SELECT id FROM meta_values WHERE value = 'top1000')),
((SELECT id FROM dictionary WHERE italian = 'mamma mia'), (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr007'), (SELECT id FROM meta_values WHERE value = 'top1000')),
((SELECT id FROM dictionary WHERE italian = 'madonna'), (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr007'), (SELECT id FROM meta_values WHERE value = 'top1000')),
((SELECT id FROM dictionary WHERE italian = 'accidenti'), (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr007'), (SELECT id FROM meta_values WHERE value = 'top1000'));

-- Top 5000 (Advanced/cultural expressions)
INSERT INTO entity_meta_values (entity_id, meta_attribute_id, meta_value_id) VALUES
((SELECT id FROM dictionary WHERE italian = 'perbacco'), (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr007'), (SELECT id FROM meta_values WHERE value = 'top5000'));

-- =============================================================================
-- SECTION 12.1: EXPRESSION VARIANT METADATA (FORM-LEVEL ATTRIBUTES)
-- =============================================================================

-- Base forms (dictionary entries default to base variant)
INSERT INTO entity_meta_values (form_id, meta_attribute_id, meta_value_id)
SELECT d.id,
       (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr052'),
       (SELECT id FROM meta_values WHERE value = 'base')
FROM dictionary d
WHERE d.word_type = 'interjection';

-- Exclamatory forms
INSERT INTO entity_meta_values (form_id, meta_attribute_id, meta_value_id) VALUES
((SELECT id FROM word_forms WHERE form_text = 'ah!'), (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr052'), (SELECT id FROM meta_values WHERE value = 'exclamatory')),
((SELECT id FROM word_forms WHERE form_text = 'oh!'), (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr052'), (SELECT id FROM meta_values WHERE value = 'exclamatory')),
((SELECT id FROM word_forms WHERE form_text = 'ecco!'), (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr052'), (SELECT id FROM meta_values WHERE value = 'exclamatory')),
((SELECT id FROM word_forms WHERE form_text = 'Ciao!'), (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr052'), (SELECT id FROM meta_values WHERE value = 'exclamatory')),
((SELECT id FROM word_forms WHERE form_text = 'Salve!'), (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr052'), (SELECT id FROM meta_values WHERE value = 'exclamatory')),
((SELECT id FROM word_forms WHERE form_text = 'Arrivederci!'), (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr052'), (SELECT id FROM meta_values WHERE value = 'exclamatory')),
((SELECT id FROM word_forms WHERE form_text = 'mamma mia!'), (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr052'), (SELECT id FROM meta_values WHERE value = 'exclamatory')),
((SELECT id FROM word_forms WHERE form_text = 'perbacco!'), (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr052'), (SELECT id FROM meta_values WHERE value = 'exclamatory')),
((SELECT id FROM word_forms WHERE form_text = 'madonna!'), (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr052'), (SELECT id FROM meta_values WHERE value = 'exclamatory')),
((SELECT id FROM word_forms WHERE form_text = 'madonna mia!'), (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr052'), (SELECT id FROM meta_values WHERE value = 'exclamatory')),
((SELECT id FROM word_forms WHERE form_text = 'accidenti!'), (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr052'), (SELECT id FROM meta_values WHERE value = 'exclamatory'));

-- Lengthened forms
INSERT INTO entity_meta_values (form_id, meta_attribute_id, meta_value_id) VALUES
((SELECT id FROM word_forms WHERE form_text = 'aaah'), (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr052'), (SELECT id FROM meta_values WHERE value = 'lengthened')),
((SELECT id FROM word_forms WHERE form_text = 'oooh'), (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr052'), (SELECT id FROM meta_values WHERE value = 'lengthened')),
((SELECT id FROM word_forms WHERE form_text = 'uffa'), (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr052'), (SELECT id FROM meta_values WHERE value = 'lengthened')),
((SELECT id FROM word_forms WHERE form_text = 'beeh'), (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr052'), (SELECT id FROM meta_values WHERE value = 'lengthened')),
((SELECT id FROM word_forms WHERE form_text = 'maah'), (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr052'), (SELECT id FROM meta_values WHERE value = 'lengthened'));

-- Questioning forms
INSERT INTO entity_meta_values (form_id, meta_attribute_id, meta_value_id) VALUES
((SELECT id FROM word_forms WHERE form_text = 'eh?'), (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr052'), (SELECT id FROM meta_values WHERE value = 'questioning'));

-- Capitalized forms
INSERT INTO entity_meta_values (form_id, meta_attribute_id, meta_value_id) VALUES
((SELECT id FROM word_forms WHERE form_text = 'Ciao'), (SELECT id FROM meta_attributes WHERE stable_id = 'metaattr052'), (SELECT id FROM meta_values WHERE value = 'capitalized'));

-- =============================================================================
-- SECTION 13: WORD TRANSLATIONS
-- =============================================================================

-- Primary Interjections Translations
INSERT INTO word_translations (word_id, translation_text, usage_notes) VALUES
((SELECT id FROM dictionary WHERE italian = 'ah'), 'ah!', 'Realization or understanding: "Ah, ora capisco!" (Ah, now I understand!)'),
((SELECT id FROM dictionary WHERE italian = 'ah'), 'oh!', 'Mild surprise or acknowledgment'),
((SELECT id FROM dictionary WHERE italian = 'oh'), 'oh!', 'Surprise, wonder: "Oh, che bello!" (Oh, how beautiful!)'),
((SELECT id FROM dictionary WHERE italian = 'eh'), 'eh?', 'Questioning, seeking confirmation: "Eh? Cosa hai detto?" (Eh? What did you say?)'),
((SELECT id FROM dictionary WHERE italian = 'uh'), 'uh', 'Hesitation, mild disagreement: "Uh, non sono sicuro" (Uh, I''m not sure)'),
((SELECT id FROM dictionary WHERE italian = 'ahi'), 'ouch!', 'Pain, discomfort: "Ahi! Mi sono fatto male!" (Ouch! I hurt myself!)'),
((SELECT id FROM dictionary WHERE italian = 'ahi'), 'ow!', 'Alternative pain expression, more immediate'),
((SELECT id FROM dictionary WHERE italian = 'uff'), 'ugh!', 'Frustration, exasperation: "Uff, che caldo!" (Ugh, it''s so hot!)');

-- Hesitation Markers Translations
INSERT INTO word_translations (word_id, translation_text, usage_notes) VALUES
((SELECT id FROM dictionary WHERE italian = 'beh'), 'well...', 'Hedging, uncertainty: "Beh, non lo so..." (Well, I don''t know...)'),
((SELECT id FROM dictionary WHERE italian = 'mah'), 'well...', 'Doubt, skepticism: "Mah, non mi convince" (Well, I''m not convinced)'),
((SELECT id FROM dictionary WHERE italian = 'boh'), 'I don''t know', 'Ignorance, dismissal: "Boh, chi lo sa?" (Who knows?) - often with shoulder shrug'),
((SELECT id FROM dictionary WHERE italian = 'ecco'), 'there!', 'Transition, conclusion: "Ecco, è finito!" (There, it''s finished!)'),
((SELECT id FROM dictionary WHERE italian = 'ecco'), 'that''s it!', 'Completion or realization marker'),
((SELECT id FROM dictionary WHERE italian = 'insomma'), 'in short', 'Summarizing: "Insomma, è andata bene" (In short, it went well)'),
((SELECT id FROM dictionary WHERE italian = 'insomma'), 'basically', 'Alternative summarizing translation');

-- Greeting Interjections Translations
INSERT INTO word_translations (word_id, translation_text, usage_notes) VALUES
((SELECT id FROM dictionary WHERE italian = 'ciao'), 'hi', 'INFORMAL: Use with friends, family, peers. NOT with authority figures'),
((SELECT id FROM dictionary WHERE italian = 'ciao'), 'bye', 'Informal farewell usage'),
((SELECT id FROM dictionary WHERE italian = 'ciao'), 'ciao', 'Often borrowed directly into English, especially "ciao for now"'),
((SELECT id FROM dictionary WHERE italian = 'salve'), 'hello', 'FORMAL/NEUTRAL: Safe greeting for any social context'),
((SELECT id FROM dictionary WHERE italian = 'arrivederci'), 'goodbye', 'FORMAL: Polite farewell, shows respect'),
((SELECT id FROM dictionary WHERE italian = 'arrivederci'), 'see you later', 'Literal meaning: "until we see each other again"'),
((SELECT id FROM dictionary WHERE italian = 'buongiorno'), 'good morning', 'Morning greeting, appropriate until lunch'),
((SELECT id FROM dictionary WHERE italian = 'buongiorno'), 'good day', 'Can be used throughout the day in formal contexts'),
((SELECT id FROM dictionary WHERE italian = 'buonasera'), 'good evening', 'Evening greeting, typically after 6 PM'),
((SELECT id FROM dictionary WHERE italian = 'buonanotte'), 'good night', 'Night greeting, typically when leaving or before sleep');

-- Cultural Interjective Phrases Translations
INSERT INTO word_translations (word_id, translation_text, usage_notes) VALUES
((SELECT id FROM dictionary WHERE italian = 'madonna'), 'oh my God!', 'HIGH CULTURAL SENSITIVITY: Contains religious reference that may offend devout Catholics. Avoid in formal/professional contexts and with elderly/religious individuals. More acceptable in Northern Italy than Southern Italy. Alternative: use "mamma mia" for similar surprise function.'),
((SELECT id FROM dictionary WHERE italian = 'madonna'), 'good God!', 'HIGH CULTURAL SENSITIVITY: Strong surprise expression with religious reference. Usage restrictions apply - see primary translation for complete sensitivity guidelines.'),
((SELECT id FROM dictionary WHERE italian = 'mamma mia'), 'oh my!', 'MODERATE SENSITIVITY: Quintessentially Italian expression but avoid overuse to prevent stereotyping. Authentic usage encouraged but use naturally, not performatively. Acceptable across all regions and age groups.'),
((SELECT id FROM dictionary WHERE italian = 'mamma mia'), 'good grief!', 'MODERATE SENSITIVITY: Alternative translation showing exasperation. Emphasize natural integration and discourage caricature when teaching.'),
((SELECT id FROM dictionary WHERE italian = 'perbacco'), 'good heavens!', 'GENERATIONAL SENSITIVITY: Old-fashioned expression mainly used by older speakers (65+). May sound theatrical to young Italians. Best reserved for formal literary contexts or historical comprehension.'),
((SELECT id FROM dictionary WHERE italian = 'accidenti'), 'darn!', 'MILD PROFANITY: Informal oath inappropriate for professional contexts. Equivalent to English "darn" - not offensive but strictly informal register. Acceptable among peers but avoid with authority figures.'),
((SELECT id FROM dictionary WHERE italian = 'accidenti'), 'damn!', 'MILD PROFANITY: Stronger translation for emphasis. Register limitations apply - see primary translation for usage guidelines.');

-- =============================================================================
-- SECTION 14: IMPLEMENTATION VERIFICATION QUERIES
-- =============================================================================

-- Verify all interjections have required metadata
SELECT
    d.italian,
    COUNT(CASE WHEN ma.stable_id = 'metaattr050' THEN 1 END) as interjection_type_count,
    COUNT(CASE WHEN ma.stable_id = 'metaattr051' THEN 1 END) as emotional_tone_count,
    COUNT(CASE WHEN ma.stable_id = 'metaattr003' THEN 1 END) as cefr_count,
    COUNT(CASE WHEN ma.stable_id = 'metaattr007' THEN 1 END) as frequency_count,
    COUNT(CASE WHEN ma.stable_id = 'metaattr018' THEN 1 END) as register_count
FROM dictionary d
LEFT JOIN entity_meta_values emv ON d.id = emv.entity_id
LEFT JOIN meta_attributes ma ON emv.meta_attribute_id = ma.id
WHERE d.word_type = 'interjection'
GROUP BY d.id, d.italian
ORDER BY d.italian;

-- Verify interjection type distribution
SELECT
    mv.value as interjection_type,
    COUNT(*) as count,
    STRING_AGG(d.italian, ', ') as words
FROM dictionary d
JOIN entity_meta_values emv ON d.id = emv.entity_id
JOIN meta_attributes ma ON emv.meta_attribute_id = ma.id AND ma.stable_id = 'metaattr050'
JOIN meta_values mv ON emv.meta_value_id = mv.id
WHERE d.word_type = 'interjection'
GROUP BY mv.value
ORDER BY count DESC;

-- =============================================================================
-- IMPLEMENTATION COMPLETE
-- =============================================================================
-- This script provides complete, production-ready implementation of
-- linguistically accurate Italian interjections following traditional
-- grammatical classification with modern metadata architecture.
-- =============================================================================