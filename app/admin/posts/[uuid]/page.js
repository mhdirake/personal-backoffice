'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box, Typography, TextField, Button, Chip,
  CircularProgress, Alert, Stack, Dialog, DialogTitle,
  DialogContent, DialogActions,
} from '@mui/material';
import {
  ArrowBackOutlined, CheckCircleOutline,
  CancelOutlined, ScheduleOutlined, SaveOutlined,
  OpenInNewOutlined, AutoAwesomeOutlined,
  ContentCopyOutlined, LinkedIn,
} from '@mui/icons-material';
import api from '@/utils/api';

const CATEGORY_OPTIONS = [
  'news_intelligence',
  'architecture_insights',
  'performance_signals',
  'ecosystem_signals',
];

const FIELD_LABELS = {
  headline: 'Headline',
  tldr: 'TL;DR',
  whyItMatters: 'Why It Matters',
  impactAnalysis: 'Impact Analysis',
  recommendedAction: 'Recommended Action',
};

const CATEGORY_COLORS = {
  news_intelligence: '#0DC8FF',
  architecture_insights: '#9060FF',
  performance_signals: '#00E5AA',
  ecosystem_signals: '#FFB340',
};

const STATUS_COLORS = {
  pending: 'default',
  approved: 'success',
  rejected: 'error',
  scheduled: 'info',
};

export default function PostEditorPage() {
  const { uuid } = useParams();
  const router = useRouter();

  const [post, setPost] = useState(null);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduledAt, setScheduledAt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generatingLinkedin, setGeneratingLinkedin] = useState(false);
  const [translation, setTranslation] = useState(null);
  const [generatingTranslation, setGeneratingTranslation] = useState(false);
  const [savingTranslation, setSavingTranslation] = useState(false);

  useEffect(() => {
    api.get(`/api/admin/posts/${uuid}`)
      .then(({ data }) => {
        setPost(data.post);
        const {
          headline,
          tldr,
          whyItMatters,
          impactAnalysis,
          recommendedAction,
          category,
          linkedinDraft,
          coverImage,
        } = data.post;
        setForm({ headline, tldr, whyItMatters, impactAnalysis, recommendedAction, category, linkedinDraft, coverImage });
      })
      .catch(() => setError('Failed to load post.'))
      .finally(() => setLoading(false));

    api.get(`/api/admin/posts/${uuid}/translations/fa`)
      .then(({ data }) => setTranslation(data.translation))
      .catch(() => {});
  }, [uuid]);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const { data } = await api.patch(`/api/admin/posts/${uuid}`, form);
      setPost(data.post);
      setSuccess('Saved.');
      setTimeout(() => setSuccess(''), 2500);
    } catch {
      setError('Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleAction = async (action, extra = {}) => {
    setActionLoading(action);
    setError('');
    try {
      await api.patch(`/api/admin/posts/${uuid}/${action}`, extra);
      router.push('/admin/posts');
    } catch {
      setError(`Action "${action}" failed.`);
      setActionLoading('');
    }
  };

  const handleSchedule = async () => {
    if (!scheduledAt) return;
    await handleAction('schedule', { scheduledAt });
    setScheduleOpen(false);
  };

  const handleGenerateBlog = async () => {
    setGenerating(true);
    setError('');
    try {
      const { data } = await api.post(`/api/admin/posts/${uuid}/generate-blog`);
      router.push(`/admin/blog/${data.post.uuid}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Blog generation failed.');
      setGenerating(false);
    }
  };

  const handleGenerateLinkedin = async () => {
    setGeneratingLinkedin(true);
    setError('');
    setSuccess('');
    try {
      const { data } = await api.post(`/api/admin/posts/${uuid}/generate-linkedin`);
      setPost(data.post);
      setForm((f) => ({ ...f, linkedinDraft: data.linkedinDraft }));
      setSuccess(`LinkedIn draft generated (${data.charCount} chars).`);
      setTimeout(() => setSuccess(''), 2500);
    } catch (err) {
      setError(err.response?.data?.message || 'LinkedIn draft generation failed.');
    } finally {
      setGeneratingLinkedin(false);
    }
  };

  const handleGenerateTranslation = async () => {
    setGeneratingTranslation(true);
    setError('');
    try {
      const { data } = await api.post(`/api/admin/posts/${uuid}/translations/fa/generate`);
      setTranslation(data.translation);
      setSuccess('ترجمه فارسی ساخته شد.');
      setTimeout(() => setSuccess(''), 2500);
    } catch (err) {
      setError(err.response?.data?.message || 'Translation failed.');
    } finally {
      setGeneratingTranslation(false);
    }
  };

  const handleSaveTranslation = async () => {
    if (!translation) return;
    setSavingTranslation(true);
    setError('');
    try {
      const { data } = await api.patch(`/api/admin/posts/${uuid}/translations/fa`, translation);
      setTranslation(data.translation);
      setSuccess('ترجمه ذخیره شد.');
      setTimeout(() => setSuccess(''), 2500);
    } catch {
      setError('Save translation failed.');
    } finally {
      setSavingTranslation(false);
    }
  };

  const handleCopyLinkedin = async () => {
    if (!form.linkedinDraft) return;
    await navigator.clipboard.writeText(form.linkedinDraft);
    setSuccess('LinkedIn draft copied.');
    setTimeout(() => setSuccess(''), 2500);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={10}>
        <CircularProgress size={32} thickness={2} sx={{ color: 'primary.main' }} />
      </Box>
    );
  }

  if (!post && error) {
    return <Alert severity="error">{error}</Alert>;
  }

  const score = parseFloat(post.relevanceScore);

  return (
    <Box maxWidth={860}>
      {/* Page header */}
      <Box mb={3.5}>
        <Box display="flex" alignItems="center" gap={1} mb={1.5}>
          <Button
            startIcon={<ArrowBackOutlined />}
            onClick={() => router.push('/admin/posts')}
            size="small"
            sx={{
              color: 'rgba(255,255,255,0.4)',
              '&:hover': { color: 'text.primary' },
              minWidth: 0,
              px: 1,
              fontFamily: 'var(--font-jetbrains)',
              fontSize: '11px',
              letterSpacing: '0.04em',
            }}
          >
            POSTS
          </Button>
          <Typography sx={{ color: 'rgba(255,255,255,0.2)', fontSize: '12px' }}>/</Typography>
          <Typography
            sx={{
              fontSize: '11px',
              color: 'rgba(255,255,255,0.35)',
              fontFamily: 'var(--font-jetbrains)',
              letterSpacing: '0.04em',
            }}
          >
            {uuid.slice(0, 8).toUpperCase()}
          </Typography>
        </Box>

        <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap">
          <Typography
            variant="subtitle2"
            sx={{ color: 'primary.main', fontFamily: 'var(--font-jetbrains)', letterSpacing: '0.1em' }}
          >
            CONTENT PIPELINE
          </Typography>
          <Box
            sx={{
              height: '14px',
              width: '1px',
              background: 'rgba(255,255,255,0.12)',
            }}
          />
          <Chip
            label={post.status}
            size="small"
            color={STATUS_COLORS[post.status] || 'default'}
            sx={{ textTransform: 'capitalize', height: 20, fontSize: '11px' }}
          />
          {post.category && (
            <Chip
              label={post.category.replace(/_/g, ' ')}
              size="small"
              variant="outlined"
              sx={{
                textTransform: 'capitalize',
                fontSize: '11px',
                height: 20,
                borderColor: CATEGORY_COLORS[post.category] || 'rgba(255,255,255,0.15)',
                color: CATEGORY_COLORS[post.category] || 'text.secondary',
              }}
            />
          )}
          <Chip
            label={`Score ${isNaN(score) ? '—' : score.toFixed(2)}`}
            size="small"
            variant="outlined"
            color={score >= 0.7 ? 'success' : score >= 0.5 ? 'warning' : 'default'}
            sx={{ height: 20, fontSize: '11px', fontFamily: 'var(--font-jetbrains)' }}
          />
          {post.sourceUrl && (
            <Button
              href={post.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              size="small"
              endIcon={<OpenInNewOutlined sx={{ fontSize: '12px !important' }} />}
              sx={{
                ml: 'auto',
                color: 'rgba(255,255,255,0.35)',
                fontSize: '11px',
                fontFamily: 'var(--font-jetbrains)',
                letterSpacing: '0.04em',
                '&:hover': { color: 'primary.main' },
              }}
            >
              SOURCE
            </Button>
          )}
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2.5 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2.5 }}>{success}</Alert>}

      {/* Editor glass card */}
      <Box
        sx={{
          background: 'rgba(255,255,255,0.025)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '14px',
          p: 3,
          mb: 2,
        }}
      >
        <Stack spacing={2.5}>
          {/* Cover image */}
          <Box>
            {form.coverImage ? (
              <Box
                component="img"
                src={form.coverImage}
                alt="Cover"
                sx={{
                  width: '100%',
                  maxHeight: 220,
                  objectFit: 'cover',
                  borderRadius: '8px',
                  mb: 1.25,
                  display: 'block',
                  border: '1px solid rgba(255,255,255,0.07)',
                }}
              />
            ) : (
              <Box
                sx={{
                  width: '100%',
                  height: 80,
                  borderRadius: '8px',
                  mb: 1.25,
                  border: '1px dashed rgba(255,255,255,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.2)', fontFamily: 'var(--font-jetbrains)', letterSpacing: '0.06em' }}>
                  NO COVER IMAGE
                </Typography>
              </Box>
            )}
            <TextField
              label="Cover Image URL"
              value={form.coverImage || ''}
              onChange={(e) => setForm((f) => ({ ...f, coverImage: e.target.value || null }))}
              fullWidth
              size="small"
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Box>

          {/* Category selector */}
          <Box>
            <Typography
              variant="caption"
              sx={{
                color: 'rgba(255,255,255,0.35)',
                fontFamily: 'var(--font-jetbrains)',
                fontSize: '10px',
                letterSpacing: '0.08em',
                display: 'block',
                mb: 1.25,
              }}
            >
              CATEGORY
            </Typography>
            <Box display="flex" gap={1} flexWrap="wrap">
              {CATEGORY_OPTIONS.map((cat) => {
                const active = form.category === cat;
                return (
                  <Chip
                    key={cat}
                    label={cat.replace(/_/g, ' ')}
                    onClick={() => setForm((f) => ({ ...f, category: cat }))}
                    size="small"
                    sx={{
                      cursor: 'pointer',
                      textTransform: 'capitalize',
                      fontSize: '11px',
                      transition: 'all 0.18s ease',
                      ...(active ? {
                        background: `${CATEGORY_COLORS[cat]}18`,
                        border: `1px solid ${CATEGORY_COLORS[cat]}55`,
                        color: CATEGORY_COLORS[cat],
                      } : {
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        color: 'rgba(255,255,255,0.4)',
                        '&:hover': {
                          background: 'rgba(255,255,255,0.07)',
                          borderColor: 'rgba(255,255,255,0.14)',
                          color: 'rgba(255,255,255,0.7)',
                        },
                      }),
                    }}
                  />
                );
              })}
            </Box>
          </Box>

          {/* Editable fields */}
          {Object.entries(FIELD_LABELS).map(([field, label]) => (
            <TextField
              key={field}
              label={label}
              value={form[field] || ''}
              onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
              multiline={field !== 'headline'}
              minRows={field === 'headline' ? 1 : 3}
              maxRows={12}
              fullWidth
              size="small"
              slotProps={{ inputLabel: { shrink: true } }}
            />
          ))}

          {/* Persian Translation */}
          <Box
            sx={{
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '10px',
              p: 2,
            }}
          >
            <Box display="flex" alignItems="center" justifyContent="space-between" gap={1.5} mb={2}>
              <Typography
                variant="caption"
                sx={{
                  color: 'rgba(255,255,255,0.35)',
                  fontFamily: 'var(--font-jetbrains)',
                  fontSize: '10px',
                  letterSpacing: '0.08em',
                }}
              >
                نسخه فارسی
              </Typography>
              <Box display="flex" gap={1}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={generatingTranslation ? <CircularProgress size={14} color="inherit" /> : null}
                  onClick={handleGenerateTranslation}
                  disabled={generatingTranslation || savingTranslation}
                >
                  {generatingTranslation ? 'در حال ترجمه...' : translation ? 'ترجمه مجدد' : 'ترجمه'}
                </Button>
                {translation && (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={savingTranslation ? <CircularProgress size={14} color="inherit" /> : <SaveOutlined />}
                    onClick={handleSaveTranslation}
                    disabled={savingTranslation || generatingTranslation}
                  >
                    ذخیره
                  </Button>
                )}
              </Box>
            </Box>

            {translation ? (
              <Stack spacing={2} sx={{ direction: 'rtl' }}>
                {['headline', 'tldr', 'whyItMatters', 'impactAnalysis', 'recommendedAction'].map((field) => (
                  <TextField
                    key={field}
                    label={field}
                    value={translation[field] || ''}
                    onChange={(e) => setTranslation((t) => ({ ...t, [field]: e.target.value }))}
                    multiline={field !== 'headline'}
                    minRows={field === 'headline' ? 1 : 3}
                    maxRows={10}
                    fullWidth
                    size="small"
                    slotProps={{ input: { style: { fontFamily: "'Noto Sans Arabic', sans-serif", direction: 'rtl' } }, inputLabel: { shrink: true } }}
                  />
                ))}
              </Stack>
            ) : (
              <Typography sx={{ color: 'rgba(255,255,255,0.2)', fontSize: '12px', textAlign: 'center', py: 2 }}>
                ترجمه‌ای ساخته نشده
              </Typography>
            )}
          </Box>

          <Box>
            <Box display="flex" alignItems="center" justifyContent="space-between" gap={1.5} mb={1.25}>
              <Typography
                variant="caption"
                sx={{
                  color: 'rgba(255,255,255,0.35)',
                  fontFamily: 'var(--font-jetbrains)',
                  fontSize: '10px',
                  letterSpacing: '0.08em',
                }}
              >
                LINKEDIN DRAFT
              </Typography>
              <Box display="flex" gap={1} flexWrap="wrap" justifyContent="flex-end">
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={generatingLinkedin ? <CircularProgress size={14} color="inherit" /> : <LinkedIn />}
                  onClick={handleGenerateLinkedin}
                  disabled={generatingLinkedin || saving || !!actionLoading}
                >
                  {generatingLinkedin ? 'Generating...' : 'Generate'}
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<ContentCopyOutlined />}
                  onClick={handleCopyLinkedin}
                  disabled={!form.linkedinDraft}
                >
                  Copy
                </Button>
              </Box>
            </Box>
            <TextField
              label="LinkedIn post"
              value={form.linkedinDraft || ''}
              onChange={(e) => setForm((f) => ({ ...f, linkedinDraft: e.target.value }))}
              multiline
              minRows={8}
              maxRows={18}
              fullWidth
              size="small"
              helperText={`${(form.linkedinDraft || '').length} chars`}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Box>
        </Stack>
      </Box>

      {/* Action bar */}
      <Box
        sx={{
          display: 'flex',
          gap: 1.5,
          flexWrap: 'wrap',
          alignItems: 'center',
          pt: 2,
        }}
      >
        <Button
          variant="contained"
          startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveOutlined />}
          onClick={handleSave}
          disabled={saving}
        >
          Save
        </Button>

        {post.status === 'pending' && (
          <>
            <Button
              variant="contained"
              color="success"
              startIcon={actionLoading === 'approve' ? <CircularProgress size={16} color="inherit" /> : <CheckCircleOutline />}
              onClick={() => handleAction('approve')}
              disabled={!!actionLoading}
            >
              Approve
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={actionLoading === 'reject' ? <CircularProgress size={16} color="inherit" /> : <CancelOutlined />}
              onClick={() => handleAction('reject')}
              disabled={!!actionLoading}
            >
              Reject
            </Button>
            <Button
              variant="outlined"
              startIcon={<ScheduleOutlined />}
              onClick={() => setScheduleOpen(true)}
              disabled={!!actionLoading}
            >
              Schedule
            </Button>
          </>
        )}

        {post.status === 'approved' && (
          <Button
            variant="outlined"
            startIcon={<ScheduleOutlined />}
            onClick={() => setScheduleOpen(true)}
          >
            Schedule
          </Button>
        )}

        <Button
          variant="outlined"
          startIcon={generating ? <CircularProgress size={16} color="inherit" /> : <AutoAwesomeOutlined />}
          onClick={handleGenerateBlog}
          disabled={generating || saving || !!actionLoading}
          sx={{
            ml: 'auto',
            borderColor: 'rgba(112,64,255,0.4)',
            color: '#9060FF',
            '&:hover': {
              borderColor: 'rgba(112,64,255,0.7)',
              background: 'rgba(112,64,255,0.08)',
            },
          }}
        >
          {generating ? 'Generating…' : 'Generate Blog Post'}
        </Button>
      </Box>

      {/* Schedule dialog */}
      <Dialog open={scheduleOpen} onClose={() => setScheduleOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Schedule Post</DialogTitle>
        <DialogContent>
          <TextField
            label="Publish at"
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            fullWidth
            size="small"
            sx={{ mt: 1 }}
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 2.5, pb: 2 }}>
          <Button onClick={() => setScheduleOpen(false)} size="small">Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSchedule}
            disabled={!scheduledAt || actionLoading === 'schedule'}
            size="small"
          >
            {actionLoading === 'schedule' ? <CircularProgress size={16} /> : 'Schedule'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
