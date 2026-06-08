'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box, Typography, TextField, Button, Chip,
  CircularProgress, Alert, Stack, IconButton, Tooltip,
} from '@mui/material';
import {
  ArrowBackOutlined, SaveOutlined, PublishOutlined, VisibilityOffOutlined,
  FileUploadOutlined, ClearOutlined, ImageOutlined,
} from '@mui/icons-material';
import api from '@/utils/api';

const EMPTY_FORM = {
  title: '',
  slug: '',
  summary: '',
  content: '',
  coverImage: '',
  tags: '',
  readTime: '',
};

function slugify(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function BlogEditorPage() {
  const { uuid } = useParams();
  const router = useRouter();
  const isNew = uuid === 'new';
  const fileInputRef = useRef(null);

  const [post, setPost] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [slugLocked, setSlugLocked] = useState(false);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [actionLoading, setActionLoading] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isNew) return;
    api.get(`/api/admin/blog/${uuid}`)
      .then(({ data }) => {
        setPost(data.post);
        const { title, slug, summary, content, coverImage, tags, readTime } = data.post;
        setForm({
          title: title || '',
          slug: slug || '',
          summary: summary || '',
          content: content || '',
          coverImage: coverImage || '',
          tags: (tags || []).join(', '),
          readTime: readTime ?? '',
        });
        setSlugLocked(true);
      })
      .catch(() => setError('Failed to load post.'))
      .finally(() => setLoading(false));
  }, [uuid, isNew]);

  const handleTitleChange = (e) => {
    const title = e.target.value;
    setForm((f) => ({
      ...f,
      title,
      ...(!slugLocked && { slug: slugify(title) }),
    }));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await api.post('/api/admin/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setForm((f) => ({ ...f, coverImage: data.url }));
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const buildPayload = () => ({
    title: form.title,
    slug: form.slug,
    summary: form.summary || null,
    content: form.content,
    coverImage: form.coverImage || null,
    tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
    readTime: form.readTime ? Number(form.readTime) : null,
  });

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      if (isNew) {
        const { data } = await api.post('/api/admin/blog', buildPayload());
        setSuccess('Created.');
        setTimeout(() => router.replace(`/admin/blog/${data.post.uuid}`), 600);
      } else {
        const { data } = await api.patch(`/api/admin/blog/${uuid}`, buildPayload());
        setPost(data.post);
        setSuccess('Saved.');
        setTimeout(() => setSuccess(''), 2500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    setActionLoading('publish');
    setError('');
    try {
      const { data } = await api.patch(`/api/admin/blog/${uuid}/publish`);
      setPost(data.post);
      setSuccess('Published.');
      setTimeout(() => setSuccess(''), 2500);
    } catch {
      setError('Publish failed.');
    } finally {
      setActionLoading('');
    }
  };

  const handleUnpublish = async () => {
    setActionLoading('unpublish');
    setError('');
    try {
      const { data } = await api.patch(`/api/admin/blog/${uuid}/unpublish`);
      setPost(data.post);
      setSuccess('Moved to draft.');
      setTimeout(() => setSuccess(''), 2500);
    } catch {
      setError('Unpublish failed.');
    } finally {
      setActionLoading('');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={10}>
        <CircularProgress size={32} thickness={2} sx={{ color: 'primary.main' }} />
      </Box>
    );
  }

  if (!isNew && !post && error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box maxWidth={860}>
      {/* Breadcrumb + header */}
      <Box mb={3.5}>
        <Box display="flex" alignItems="center" gap={1} mb={1.5}>
          <Button
            startIcon={<ArrowBackOutlined />}
            onClick={() => router.push('/admin/blog')}
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
            BLOG
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
            {isNew ? 'NEW POST' : uuid.slice(0, 8).toUpperCase()}
          </Typography>
        </Box>

        <Box display="flex" alignItems="center" gap={1.5}>
          <Typography
            variant="subtitle2"
            sx={{ color: 'primary.main', fontFamily: 'var(--font-jetbrains)', letterSpacing: '0.1em' }}
          >
            EDITORIAL
          </Typography>
          {!isNew && post && (
            <>
              <Box sx={{ height: '14px', width: '1px', background: 'rgba(255,255,255,0.12)' }} />
              <Chip
                label={post.status}
                size="small"
                color={post.status === 'published' ? 'success' : 'default'}
                sx={{ textTransform: 'capitalize', height: 20, fontSize: '11px' }}
              />
            </>
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
          <TextField
            label="Title"
            value={form.title}
            onChange={handleTitleChange}
            fullWidth
            size="small"
            slotProps={{ inputLabel: { shrink: true } }}
          />

          <TextField
            label="Slug"
            value={form.slug}
            onChange={(e) => {
              setSlugLocked(true);
              setForm((f) => ({ ...f, slug: e.target.value }));
            }}
            fullWidth
            size="small"
            helperText="Auto-generated from title. Edit to override."
            slotProps={{ inputLabel: { shrink: true } }}
          />

          <TextField
            label="Summary"
            value={form.summary}
            onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))}
            multiline
            minRows={2}
            maxRows={5}
            fullWidth
            size="small"
            slotProps={{ inputLabel: { shrink: true } }}
          />

          <TextField
            label="Content"
            value={form.content}
            onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
            multiline
            minRows={14}
            maxRows={40}
            fullWidth
            size="small"
            slotProps={{ inputLabel: { shrink: true } }}
          />

          {/* Cover image */}
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
              COVER IMAGE
            </Typography>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />

            {form.coverImage ? (
              <Box sx={{ position: 'relative' }}>
                <Box
                  component="img"
                  src={form.coverImage}
                  alt="Cover preview"
                  sx={{
                    width: '100%',
                    maxHeight: 220,
                    objectFit: 'cover',
                    borderRadius: '10px',
                    border: '1px solid rgba(255,255,255,0.08)',
                    display: 'block',
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    display: 'flex',
                    gap: 0.75,
                  }}
                >
                  <Tooltip title="Replace image">
                    <IconButton
                      size="small"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      sx={{
                        background: 'rgba(2,6,22,0.75)',
                        backdropFilter: 'blur(8px)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        '&:hover': { background: 'rgba(2,6,22,0.9)', borderColor: 'rgba(255,255,255,0.22)' },
                      }}
                    >
                      {uploading ? <CircularProgress size={14} /> : <FileUploadOutlined sx={{ fontSize: 15 }} />}
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Remove">
                    <IconButton
                      size="small"
                      onClick={() => setForm((f) => ({ ...f, coverImage: '' }))}
                      sx={{
                        background: 'rgba(2,6,22,0.75)',
                        backdropFilter: 'blur(8px)',
                        border: '1px solid rgba(255,77,106,0.3)',
                        color: '#FF7A8A',
                        '&:hover': { background: 'rgba(255,77,106,0.12)', borderColor: 'rgba(255,77,106,0.5)' },
                      }}
                    >
                      <ClearOutlined sx={{ fontSize: 15 }} />
                    </IconButton>
                  </Tooltip>
                </Box>
                <TextField
                  value={form.coverImage}
                  onChange={(e) => setForm((f) => ({ ...f, coverImage: e.target.value }))}
                  fullWidth
                  size="small"
                  placeholder="Image URL"
                  sx={{ mt: 1.5 }}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              </Box>
            ) : (
              <Box
                onClick={() => fileInputRef.current?.click()}
                sx={{
                  border: '1px dashed rgba(255,255,255,0.12)',
                  borderRadius: '10px',
                  p: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 1,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: 'rgba(13,200,255,0.35)',
                    background: 'rgba(13,200,255,0.04)',
                  },
                }}
              >
                {uploading ? (
                  <CircularProgress size={24} thickness={2} sx={{ color: 'primary.main' }} />
                ) : (
                  <ImageOutlined sx={{ fontSize: 28, color: 'rgba(255,255,255,0.2)' }} />
                )}
                <Typography sx={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.04em' }}>
                  {uploading ? 'Uploading...' : 'Click to upload cover image'}
                </Typography>
                <Typography sx={{ fontSize: '11px', color: 'rgba(255,255,255,0.18)' }}>
                  JPG, PNG, WebP · max 5 MB
                </Typography>
              </Box>
            )}
          </Box>

          <Box display="flex" gap={2}>
            <TextField
              label="Tags"
              value={form.tags}
              onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
              fullWidth
              size="small"
              helperText="Comma-separated: React, Next.js, Backend"
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              label="Read Time (min)"
              value={form.readTime}
              onChange={(e) => setForm((f) => ({ ...f, readTime: e.target.value }))}
              type="number"
              size="small"
              sx={{ width: 160, flexShrink: 0 }}
              slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: 1 } }}
            />
          </Box>
        </Stack>
      </Box>

      {/* Action bar */}
      <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center', pt: 1 }}>
        <Button
          variant="contained"
          startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveOutlined />}
          onClick={handleSave}
          disabled={saving}
        >
          {isNew ? 'Create Post' : 'Save'}
        </Button>

        {!isNew && post?.status === 'draft' && (
          <Button
            variant="contained"
            color="success"
            startIcon={actionLoading === 'publish' ? <CircularProgress size={16} color="inherit" /> : <PublishOutlined />}
            onClick={handlePublish}
            disabled={!!actionLoading}
          >
            Publish
          </Button>
        )}

        {!isNew && post?.status === 'published' && (
          <Button
            variant="outlined"
            startIcon={actionLoading === 'unpublish' ? <CircularProgress size={16} color="inherit" /> : <VisibilityOffOutlined />}
            onClick={handleUnpublish}
            disabled={!!actionLoading}
          >
            Unpublish
          </Button>
        )}
      </Box>
    </Box>
  );
}
