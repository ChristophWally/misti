alter table public.word_relationships
  drop constraint if exists valid_relationship_type;

alter table public.word_relationships
  add constraint valid_relationship_type
  check (
    relationship_type = any (
      array[
        'mente-derivation',
        'comparative',
        'superlative',
        'gender-variant',
        'suppletive-adverb',
        'morphological-variant',
        'semantic-association',
        'symbol',
        'related',
        'synonym',
        'antonym',
        'abbreviation',
        'contracts-with',
        'coordinate-term',
        'alternative-form-of',
        'alt-of',
        'hypernym',
        'hyponym',
        'contraction-of',
        'diminutive'
      ]
    )
  );
