'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box, Typography, Tabs, Tab, Table, TableHead, TableRow,
  TableCell, TableBody, Chip, IconButton, Tooltip,
  CircularProgress, Alert, TableContainer, Paper, Button,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
} from '@mui/material';
import { EditOutlined, DeleteOutlined, PublishOutlined, VisibilityOffOutlined, AddOutlined } from '@mui/icons-material';
import api from '@/utils/api';

const STATUS_TABS = ['all', 'draft', 'published'];

export default function BlogPage() {
  const router = useRouter();
  const [tab, setTab] = useState(0);
  const [posts, setPosts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [activeTag, setActiveTag] = useState('');
  const [allTags, setAllTags] = useState([]);

  const status = STATUS_TABS[tab];

  useEffect(() => {
    api.get('/api/admin/blog-tags').then(({ data }) => setAllTags(data.tags || [])).catch(() => {});
  }, []);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { limit: 50 };
      if (status !== 'all') params.status = status;
      if (activeTag) params.tag = activeTag;
      const { data } = await api.get('/api/admin/blog', { params });
      setPosts(data.posts);
      setTotal(data.total);
    } catch {
      setError('Failed to load blog posts.');
    } finally {
      setLoading(false);
    }
  }, [status, activeTag]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const handlePublish = async (uuid) => {
    setActionLoading(uuid + '_publish');
    try { await api.patch(`/api/admin/blog/${uuid}/publish`); fetchPosts(); }
    finally { setActionLoading(null); }
  };

  const handleUnpublish = async (uuid) => {
    setActionLoading(uuid + '_unpublish');
    try { await api.patch(`/api/admin/blog/${uuid}/unpublish`); fetchPosts(); }
    finally { setActionLoading(null); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/api/admin/blog/${deleteTarget}`);
      setPosts((prev) => prev.filter((p) => p.uuid !== deleteTarget));
      setTotal((t) => t - 1);
    } catch {
      setError('Delete failed.');
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <Box>
      <Box mb={3.5} display="flex" alignItems="flex-end" justifyContent="space-between">
        <Box>
          <Typography
            variant="subtitle2"
            sx={{ color: 'primary.main', mb: 0.5, fontFamily: 'var(--font-jetbrains)', letterSpacing: '0.1em' }}
          >
            EDITORIAL
          </Typography>
          <Typography variant="h4" fontWeight={700} sx={{ color: 'text.primary', letterSpacing: '-0.01em' }}>
            Blog
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddOutlined />}
          onClick={() => router.push('/admin/blog/new')}
          size="small"
        >
          New Post
        </Button>
      </Box>

      <Box
        sx={{
          background: 'rgba(255,255,255,0.03)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '12px',
          mb: 2.5,
          px: 1,
        }}
      >
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          {STATUS_TABS.map((s) => (
            <Tab key={s} label={s} sx={{ textTransform: 'capitalize' }} />
          ))}
        </Tabs>
      </Box>

      {allTags.length > 0 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 2.5 }}>
          <Chip
            label="All"
            size="small"
            onClick={() => setActiveTag('')}
            variant={activeTag === '' ? 'filled' : 'outlined'}
            color={activeTag === '' ? 'primary' : 'default'}
            sx={{ fontWeight: 600, fontSize: '11px' }}
          />
          {allTags.map((tag) => (
            <Chip
              key={tag}
              label={`#${tag}`}
              size="small"
              onClick={() => setActiveTag(activeTag === tag ? '' : tag)}
              variant={activeTag === tag ? 'filled' : 'outlined'}
              color={activeTag === tag ? 'primary' : 'default'}
              sx={{ fontSize: '11px' }}
            />
          ))}
        </Box>
      )}

      {error && <Alert severity="error" sx={{ mb: 2.5 }}>{error}</Alert>}

      {loading ? (
        <Box display="flex" justifyContent="center" mt={8}>
          <CircularProgress size={32} thickness={2} sx={{ color: 'primary.main' }} />
        </Box>
      ) : posts.length === 0 ? (
        <Box mt={8} textAlign="center">
          <Typography sx={{ color: 'rgba(255,255,255,0.2)', fontSize: '13px', letterSpacing: '0.06em' }}>
            NO {status === 'all' ? '' : status.toUpperCase() + ' '}POSTS YET
          </Typography>
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Title / Slug</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Tags</TableCell>
                <TableCell>Read Time</TableCell>
                <TableCell>Date</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {posts.map((post) => (
                <TableRow
                  key={post.uuid} hover sx={{ cursor: 'pointer' }}
                  onClick={() => router.push(`/admin/blog/${post.uuid}`)}
                >
                  <TableCell sx={{ maxWidth: 320 }}>
                    <Typography variant="body2" fontWeight={600} noWrap>{post.title}</Typography>
                    <Typography
                      variant="caption"
                      noWrap display="block"
                      sx={{ color: 'primary.main', fontFamily: 'var(--font-jetbrains)', opacity: 0.6 }}
                    >
                      /{post.slug}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={post.status}
                      color={post.status === 'published' ? 'success' : 'default'}
                      size="small" variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Box display="flex" gap={0.5} flexWrap="wrap">
                      {(post.tags || []).slice(0, 3).map((tag) => (
                        <Chip key={tag} label={tag} size="small" variant="outlined"
                          sx={{ fontSize: '10px', height: 18, borderColor: 'rgba(255,255,255,0.12)' }} />
                      ))}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: 'var(--font-jetbrains)' }}>
                      {post.readTime ? `${post.readTime} min` : '—'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: 'var(--font-jetbrains)' }}>
                      {new Date(post.publishedAt || post.createdAt).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => router.push(`/admin/blog/${post.uuid}`)}>
                        <EditOutlined fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {post.status === 'draft' ? (
                      <Tooltip title="Publish">
                        <IconButton size="small" color="success"
                          disabled={actionLoading === post.uuid + '_publish'}
                          onClick={() => handlePublish(post.uuid)}>
                          {actionLoading === post.uuid + '_publish'
                            ? <CircularProgress size={14} />
                            : <PublishOutlined fontSize="small" />}
                        </IconButton>
                      </Tooltip>
                    ) : (
                      <Tooltip title="Unpublish">
                        <IconButton size="small"
                          disabled={actionLoading === post.uuid + '_unpublish'}
                          onClick={() => handleUnpublish(post.uuid)}>
                          {actionLoading === post.uuid + '_unpublish'
                            ? <CircularProgress size={14} />
                            : <VisibilityOffOutlined fontSize="small" />}
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="Delete">
                      <IconButton size="small" color="error" onClick={() => setDeleteTarget(post.uuid)}>
                        <DeleteOutlined fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete blog post?</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontSize: '13px' }}>This action cannot be undone.</DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 2.5, pb: 2 }}>
          <Button onClick={() => setDeleteTarget(null)} size="small">Cancel</Button>
          <Button variant="contained" color="error" size="small" onClick={handleDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
