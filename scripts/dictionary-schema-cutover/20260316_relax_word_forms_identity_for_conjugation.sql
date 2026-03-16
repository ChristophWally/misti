begin;

drop index if exists public.ux_word_forms_identity;

create unique index if not exists ux_word_forms_identity_non_conjugation
  on public.word_forms (word_id, form_text, form_type)
  where form_type <> 'conjugation';

commit;
