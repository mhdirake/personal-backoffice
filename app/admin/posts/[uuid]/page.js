'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box, Typography, TextField, Button, Chip, Divider,
  CircularProgress, Alert, Stack, Dialog, DialogTitle,
  DialogContent, DialogActions, Grid,
} from '@mui/material';
import {
  ArrowBackOutlined, CheckCircleOutline,
  CancelOutlined, ScheduleOutlined, SaveOutlined,
  OpenInNewOutlined,
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

  useEffect(() => {
    api.get(`/api/admin/posts/${uuid}`)
      .then(({ data }) => {
        setPost(data.post);
        const { headline, tldr, whyItMatters, impactAnalysis, recommendedAction, category } = data.post;
        setForm({ headline, tldr, whyItMatters, impactAnalysis, recommendedAction, category });
      })
      .catch(() => setError('Failed to load post.'))
      .finally(() => setLoading(false));
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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={10}>
        <CircularProgress />
      </Box>
    );
  }

  if (!post && error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box maxWidth={860}>
      <Box display="flex" alignItems="center" gap={1.5} mb={3}>
        <Button
          startIcon={<ArrowBackOutlined />}
          onClick={() => router.push('/admin/posts')}
          size="small"
          sx={{ color: 'text.secondary' }}
        >
          Posts
        </Button>
        <Divider orientation="vertical" flexItem />
        <Chip
          label={post.status}
          size="small"
          color={
            post.status === 'approved' ? 'success' :
            post.status === 'rejected' ? 'error' :
            post.status === 'scheduled' ? 'info' : 'default'
          }
          sx={{ textTransform: 'capitalize' }}
        />
        <Chip
          label={post.category?.replace(/_/g, ' ')}
          size="small"
          variant="outlined"
          sx={{ textTransform: 'capitalize', fontSize: 11 }}
        />
        <Chip
          label={`Score: ${post.relevanceScore?.toFixed(2)}`}
          size="small"
          variant="outlined"
          color={post.relevanceScore >= 0.7 ? 'success' : 'warning'}
        />
        {post.sourceUrl && (
          <Button
            href={post.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            size="small"
            endIcon={<OpenInNewOutlined fontSize="inherit" />}
            sx={{ ml: 'auto', color: 'text.secondary', fontSize: 12 }}
          >
            Source
          </Button>
        )}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Stack spacing={2.5}>
        {/* Category selector */}
        <Box>
          <Typography variant="caption" color="text.secondary" mb={1} display="block">
            Category
          </Typography>
          <Box display="flex" gap={1} flexWrap="wrap">
            {CATEGORY_OPTIONS.map((cat) => (
              <Chip
                key={cat}
                label={cat.replace(/_/g, ' ')}
                onClick={() => setForm((f) => ({ ...f, category: cat }))}
                variant={form.category === cat ? 'filled' : 'outlined'}
                color={form.category === cat ? 'primary' : 'default'}
                size="small"
                sx={{ cursor: 'pointer', textTransform: 'capitalize', fontSize: 11 }}
              />
            ))}
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
            slotProps={{
              inputLabel: { shrink: true },
            }}
          />
        ))}
      </Stack>

      {/* Action bar */}
      <Box
        mt={3}
        pt={3}
        borderTop="1px solid"
        sx={{ borderColor: 'divider' }}
        display="flex"
        gap={1.5}
        flexWrap="wrap"
        alignItems="center"
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
        <DialogActions>
          <Button onClick={() => setScheduleOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSchedule}
            disabled={!scheduledAt || actionLoading === 'schedule'}
          >
            {actionLoading === 'schedule' ? <CircularProgress size={16} /> : 'Schedule'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
