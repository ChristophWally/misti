# 01092025 - Premium Audio Restoration Plan

## Executive Summary

Premium dictionary audio stopped rendering and playing despite known assets in storage. The issue is that audio metadata is not being loaded with dictionary/forms queries, preventing the UI from detecting premium audio and applying the golden rim styling or requesting signed URLs. This plan restores premium audio by reintroducing audio metadata to relevant queries, validating the audio component, and adding a build-and-test cycle to catch TypeScript errors before deployment. No database writes are planned; storage policy verification is included but requires explicit approval before any changes.

## Problem Statement

- Premium audio is present in Supabase Storage and linked via `word_audio_metadata`, but the dictionary does not display the golden rim or play premium audio.
- Users see only the generic pronunciation behavior (fallback TTS), suggesting premium detection is failing.

## Current Symptoms

- No golden rim on the dictionary audio button.
- Playback falls back to TTS even for words known to have premium audio.
- Conjugation modal likely exhibits the same behavior for form audio.

## Root Cause

- The dictionary query in `EnhancedDictionarySystem.loadWordsWithTranslations` does not select `word_audio_metadata`, so `checkPremiumAudio(word)` never receives audio metadata.
- The forms query in `ConjugationModal` does not include the `word_audio_metadata` relationship, yet the component expects `form.word_audio_metadata?.audio_filename`.
- Styling in `app/globals.css` supports the golden rim (`.premium-audio`) and the playback utility creates signed URLs correctly; both are blocked by missing metadata in queries.

## Affected Components

- `misti/lib/enhanced-dictionary-system.js` (dictionary data load)
- `misti/components/ConjugationModal.js` (forms data load)
- `misti/components/AudioButton.js` (rendering, playback trigger)
- `misti/lib/audio-utils.js` (signed URL + TTS fallback)
- `misti/app/globals.css` (golden rim styling already in place)

## Implementation Plan

### Phase 1: Verification & Safety (Read-only)
- Confirm example word(s) with known premium audio exist in `word_audio_metadata` (read-only).
- Verify environment vars for Supabase client are set (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
- No database modifications in this phase.

### Phase 2: Code Changes (Queries + Audio Component Review)

1) Add audio metadata to dictionary query
- File: `misti/lib/enhanced-dictionary-system.js`
- Change the select to include `word_audio_metadata` (specific columns for efficiency):

```js
// Before
.select(`
  *,
  word_translations(*)
`)

// After
.select(`
  *,
  word_translations(*),
  word_audio_metadata(audio_filename, azure_voice_name)
`)
```

2) Add audio metadata to conjugation forms query
- File: `misti/components/ConjugationModal.js`
- Extend the `word_forms` select to include the related audio metadata:

```js
// Before
.select(`
  *,
  form_translations (
    word_translation_id,
    translation,
    assignment_method
  )
`)

// After
.select(`
  *,
  form_translations (
    word_translation_id,
    translation,
    assignment_method
  ),
  word_audio_metadata(audio_filename, azure_voice_name)
`)
```

3) Audio Component Review (no behavioral change expected)
- File: `misti/components/AudioButton.js`
- Validate premium detection: keep strict checks for non-empty string `audioFilename`.
- Confirm golden rim styling is applied via conditional `premium-audio` class and CSS exists in `app/globals.css` (already present).
- Accessibility: ensure `title` and add `aria-label` mirroring `title` if missing.
- Error state: current `isError` UI is sufficient; maintain short auto-reset.
- Optional improvement (future): cache the last signed URL to reduce latency on rapid replays.

4) Optional cleanup (defer unless requested)
- In `misti/lib/audio-utils.js`, consider simplifying to the canonical `audio-files` bucket only. Keep current dual-bucket fallback until storage confirmations are complete.

### Phase 3: Build, Test, and Fix Cycle

- Install and build:
  - `npm ci`
  - `npm run build` (runs Next.js build and TypeScript checks)
- Address any TypeScript errors surfaced by build, scoping fixes to code touched by this change or directly impacted dependencies.
- Manual validation in dev:
  - Open Dictionary panel and search for a word with known premium audio.
  - Confirm the audio button shows a golden rim.
  - Play audio and verify a signed URL request appears in the network panel and playback uses premium audio (no TTS fallback).
  - Validate fallback to TTS still works for words without audio.
  - Open Conjugation modal for a verb with known form audio and validate playback + rim.

### Phase 4: Supabase Storage Policy Verification (Approval required)

- Objective: Ensure anonymous users can obtain signed URLs for files in `audio-files` bucket.
- If policies are missing, propose adding anon read for the bucket:

```sql
-- Requires explicit approval before execution
CREATE POLICY "Allow public read access"
ON storage.objects
FOR SELECT
TO anon
USING (bucket_id = 'audio-files');
```

- Alternatively, if you prefer not to grant anon read, confirm that signed URL creation works with current policies for anonymous clients. If it does not, adjust policies accordingly with explicit approval.

### Phase 5: Deployment via Vercel Preview

- Create branch: `fix/premium-audio-restore`.
- Push changes to trigger Vercel preview.
- Perform end-to-end validation on the preview URL.
- Present preview to stakeholders and obtain approval.
- Merge into main after explicit approval.

## Risks & Mitigations

- Storage policy too restrictive: signed URL creation fails.
  - Mitigation: Confirm/adjust storage policy (with approval) for `audio-files` bucket.
- Data shape differences: if relationships are named differently in DB.
  - Mitigation: Inspect returned payloads; adjust select paths accordingly.
- TypeScript build failures unrelated to this change.
  - Mitigation: Limit fixes to directly affected areas; surface unrelated issues separately.

## Success Criteria

1. Golden rim displays for words/forms with premium audio.
2. Premium audio plays using signed URLs; no TTS fallback for available assets.
3. Fallback TTS works for words/forms without audio.
4. No regressions in dictionary or conjugation features.
5. `npm run build` succeeds without TypeScript errors.
6. Vercel preview validated and approved.

## Rollback Plan

- Revert the select changes in `enhanced-dictionary-system.js` and `ConjugationModal.js`.
- No database changes to roll back.
- Redeploy via Vercel to restore previous behavior.

## Stakeholder Communication

- Development: Review implementation diffs and validate queries.
- Product: Confirm UI behavior (golden rim + playback) meets expectations.
- QA: Validate across a sample set of known-audio and no-audio words/forms.

## Surgical Execution Notes

- One change at a time; verify dictionary premium detection first, then conjugation forms.
- Commit format:
  - "Fix premium audio detection in dictionary (select metadata)"
  - "Enable form audio metadata in conjugation modal"
  - "AudioButton a11y and styling check"
  - "Build fixes (TypeScript)"

## Implementation (Completed)

### Code Changes

1) Dictionary query now returns audio metadata
- File: `misti/lib/enhanced-dictionary-system.js`
- Why: `WordCard` calls `checkPremiumAudio(word)` which relies on `word.word_audio_metadata`. Without selecting this relation, premium detection and the golden rim never activate.

```diff
--- a/misti/lib/enhanced-dictionary-system.js
+++ b/misti/lib/enhanced-dictionary-system.js
@@
-      let query = this.supabase
 -        .from('dictionary')
 -        .select(`
 -          *,
 -          word_translations(*)
 -        `)
 +      let query = this.supabase
 +        .from('dictionary')
 +        .select(`
 +          *,
 +          word_translations(*),
 +          word_audio_metadata(audio_filename, azure_voice_name)
 +        `)
         .order('italian', { ascending: true });
```

2) Conjugation forms query returns form-level audio metadata
- File: `misti/components/ConjugationModal.js`
- Why: The modal expects `form.word_audio_metadata?.audio_filename` for premium playback of forms. Adding the relation ensures AudioButton receives the filename and renders the golden rim.

```diff
--- a/misti/components/ConjugationModal.js
+++ b/misti/components/ConjugationModal.js
@@
-    const { data, error } = await supabase
 -      .from('word_forms')
 -      .select(`
 -        *,
 -        form_translations (
 -          word_translation_id,
 -          translation,
 -          assignment_method
 -        )
 -      `)
+    const { data, error } = await supabase
 +      .from('word_forms')
 +      .select(`
 +        *,
 +        form_translations (
 +          word_translation_id,
 +          translation,
 +          assignment_method
 +        ),
 +        word_audio_metadata (audio_filename, azure_voice_name)
 +      `)
       .eq('word_id', word.id)
       .eq('form_type', 'conjugation')
       .order('tags')
```

3) Audio button accessibility improvement
- File: `misti/components/AudioButton.js`
- Why: Mirrors the `title` via `aria-label` for better screen reader support. No behavior change.

```diff
--- a/misti/components/AudioButton.js
+++ b/misti/components/AudioButton.js
@@
   return (
     <button
       onClick={handlePlay}
       disabled={isPlaying}
 +      aria-label={buttonTitle}
       className={`
         ${sizeClasses[size]}
         text-white rounded-full
         flex items-center justify-center
         transition-all duration-200
```

### Rationale Recap
- The premium audio pipeline already worked end-to-end (signed URL + playback + golden rim) as long as `audioFilename` is present. The issue was upstream: queries no longer returned `word_audio_metadata`, so detection always failed. Restoring those relations re-enabled the feature.

### Build and Local Validation
- Commands executed:
  - `npm run build` → Next.js 14 build succeeded; only viewport metadata warnings in admin/test routes.
  - Verified dev server boot, then tested locally; confirmed premium audio behavior on known words and shut down all dev servers (freed ports 3000–3003).

### Storage/Policy Notes
- No database or storage policy changes were applied as part of this implementation.
- If signed URL generation ever fails for anonymous users, the proposed policy in Phase 4 remains the approved path (with explicit approval) for the `audio-files` bucket.

### Deferred (Optional) Cleanup
- Maintain dual-bucket fallback in `audio-utils.js` for now. We can simplify to the canonical `audio-files` bucket after a brief audit confirms no legacy objects exist in `word-audio`.
