---
status: dormant
author: stephen+claude
domain: media_pipeline
level: applies at L1+
updated: 2026-10-30
generated_by: claude/technical-documentation-specialist
generated_at: 2026-10-30T14:00Z
generated_from: conversation
---

# DOMAIN_MEDIA_PIPELINE  -  Video / Audio / Image Pipeline Addendum

## Level overrides

- `LEGAL.md` rights section activates at **L2** (not L3)  -  licensing issues compound faster than code debt
- C2PA provenance considered at L1 if AI-generated media shipped

## Deltas from base

### L1 additions

- Storage strategy (object storage provider, path convention)
- Format / codec choices (video, audio, image)
- Initial CDN selection

### L2 additions

- Rights / licensing register for every piece of source media
- Asset metadata schema (creator, source, licence, usage scope)
- C2PA manifest generation if AI-generated
- Transcoding pipeline and quality targets
- Adaptive bitrate (HLS / DASH) if streaming
- Captions / transcripts pipeline (accessibility)
- Thumbnail / preview generation

### L3 additions

- Content moderation if UGC
- Rights holder reporting (DMCA, etc.)
- Age restriction for mature content
- Watermarking / DRM if licensing demands

## Watchouts

- Training-data IP risk for AI-generated media (Getty, NYT lawsuits)
- Copyright scanning for UGC
- Bandwidth and storage costs escalate quickly  -  integrate with `COST_CONTROLS.md`
- Regional content restrictions (geo-blocking obligations)
