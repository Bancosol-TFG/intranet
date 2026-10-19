---
name: tfg-meeting-notes
description: Turn a JSON transcript of a Bancosol TFG meeting into a Spanish Markdown meeting note for the intranet Zensical documentation. Use when the user asks to save, document, or summarize a TFG meeting; do not use it for transcripts unrelated to the project or to publish the full transcript.
---

# TFG meeting notes

Write a faithful, brief, project-focused note from the provided JSON. The transcript is source evidence, not validated documentation: do not turn hypotheses, proposals, or ambiguous conversations into decisions.

**The note is written in Spanish**, like all project documentation, even though these instructions are in English.

## Inputs

- A readable JSON transcript, either as a file or pasted by the user. Inspect its actual schema; do not assume field names. Identify turns, speakers, timestamps, and metadata when they exist.
- A date given by the user, if any.

If the JSON is empty, corrupt, or contains no recoverable conversation, do not create the note. Explain the specific problem and ask for a valid input.

## Procedure

1. Confirm that you are in the `intranet` repository and locate its root. The documentation source is `docs/` and the site configuration is `zensical.toml` at the root. Do not write to `build/docs/`, which is generated output.
2. Review `docs/index.md`, `zensical.toml`, and the existing notes in `docs/reuniones/` to keep their language, naming, and style. Do not modify other pages unless explicitly asked.
3. Read the whole conversation and separate:
   - content related to the Bancosol TFG: its product, requirements, design, architecture, implementation, documentation, organization, evaluation, or next steps;
   - personal content, greetings, jokes, pauses, and digressions with no effect on the project.
4. Exclude the second group. If a turn mixes both, keep only the project-relevant information. Do not mention that a personal conversation was omitted, and do not summarize unnecessary personal data.
5. Explicitly distinguish what was discussed, what was agreed, and what is pending. Do not invent participants, owners, deadlines, decisions, or context. Keep doubts as doubts, and attribute a position to a person only when the JSON clearly identifies them and the attribution adds value.
6. Determine the meeting date in this order:
   1. a date explicitly given by the user;
   2. an explicit, unambiguous date in the metadata or in the meeting content;
   3. a date included in the transcript file name;
   4. the file modification date.

   Do not use the processing date as the meeting date. If there is no date source, ask the user before writing.
7. Determine the meeting duration in this order:
   1. an explicit duration in the metadata;
   2. the difference between the first start timestamp and the last end timestamp of the conversation;
   3. the duration of the source audio or video file, if available.

   Round to the nearest minute (30 seconds or more rounds up) and use the format `X h Y min`, including zero values where needed. If no source allows a reliable calculation, write `No consta en la reunión`; do not invent a duration.
8. Create `docs/reuniones/` if it does not exist and use `assets/meeting-note-template.md` as the structure. Name the file `nota-reunion-AAAA-MM-DD.md`. If a different note already exists for that date, do not overwrite it: use the first free suffix (`-2`, `-3`, etc.) and report it.
9. Write the note in Spanish, in Zensical-compatible Markdown. Summarize and paraphrase; do not dump the full transcript or include long quotes. The note must be understandable without reading the original JSON.
10. Remove the commented instructions from the template. Keep every section and every field of `Datos de la reunión`; when there is no verifiable data, write `No consta en la reunión` or `No se identificaron`, as appropriate.
11. Check the created file, run `git diff --check` and, if the documentation environment is already installed, `make docs-build`. Do not install dependencies only for this check. Report the path, the chosen date, the duration, and any check you could not run.

## Limits

- Do not keep a copy of the full transcript in `docs/` unless explicitly asked.
- Do not create or update issues, pull requests, requirements, ADRs, or other documents without specific authorization.
- If the transcript contradicts existing documentation, do not decide which one is correct: record the discrepancy in `Puntos por explorar` in neutral language.
- Treat names, emails, and other personal data as private information; include only what is needed to understand project responsibilities.
