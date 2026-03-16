alter table public.word_relationships
  add column if not exists target_form_id uuid;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'word_relationships_target_form_id_fkey'
      and conrelid = 'public.word_relationships'::regclass
  ) then
    alter table public.word_relationships
      add constraint word_relationships_target_form_id_fkey
      foreign key (target_form_id) references public.word_forms(id) on delete cascade;
  end if;
end $$;

alter table public.word_relationships
  drop constraint if exists unique_relationship;

create unique index if not exists idx_word_relationships_unique_v2
  on public.word_relationships (
    source_word_id,
    target_word_id,
    coalesce(target_form_id, '00000000-0000-0000-0000-000000000000'::uuid),
    relationship_type,
    coalesce(contracted_form_id, '00000000-0000-0000-0000-000000000000'::uuid)
  );
