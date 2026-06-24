'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box, Typography, Tabs, Tab, Table, TableHead, TableRow,
  TableCell, TableBody, Chip, IconButton, Tooltip,
  CircularProgress, Alert, TableContainer, Paper, Checkbox,
  Button, Pagination, Stack,
} from '@mui/material';
import {
  CheckCircleOutline, CancelOutlined, EditOutlined, ScheduleOutlined,
  LinkedIn, DeleteOutlined,
} from '@mui/icons-material';
import api from '@/utils/api';

const STATUS_TABS = ['pending', 'published', 'scheduled', 'rejected'];
const PAGE_SIZE = 20;

const CATEGORY_COLORS = {
  news_intelligence: 'info',
  architecture_insights: 'secondary',
  performance_signals: 'success',
  ecosystem_signals: 'warning',
};

function ScoreChip({ score }) {
  const n = parseFloat(score);
  const color = n >= 0.7 ? 'success' : n >= 0.5 ? 'warning' : 'default';
  return (
    <Chip label={isNaN(n) ? '—' : n.toFixed(2)} color={color} size="small" variant="outlined" />
  );
}

export default function PostsPage() {
  const router = useRouter();
  const [tab, setTab] = useState(0);
  const [posts, setPosts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [selected, setSelected] = useState([]);
  const [bulkLoading, setBulkLoading] = useState(false);

  const status = STATUS_TABS[tab];
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError('');
    setSelected([]);
    try {
      const { data } = await api.get('/api/admin/posts', { params: { status, page, limit: PAGE_SIZE } });
      setPosts(data.posts);
      setTotal(data.total);
    } catch {
      setError('Failed to load posts.');
    } finally {
      setLoading(false);
    }
  }, [status, page]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const handleTabChange = (_, v) => { setTab(v); setPage(1); };
  const handlePageChange = (_, p) => setPage(p);

  const toggleSelect = (uuid) =>
    setSelected((prev) => prev.includes(uuid) ? prev.filter((u) => u !== uuid) : [...prev, uuid]);

  const allSelected = posts.length > 0 && selected.length === posts.length;
  const toggleAll = () => setSelected(allSelected ? [] : posts.map((p) => p.uuid));

  const handleApprove = async (uuid) => {
    setActionLoading(uuid + '_approve');
    try { await api.patch(`/api/admin/posts/${uuid}/approve`); fetchPosts(); }
    finally { setActionLoading(null); }
  };

  const handleReject = async (uuid) => {
    setActionLoading(uuid + '_reject');
    try { await api.patch(`/api/admin/posts/${uuid}/reject`); fetchPosts(); }
    finally { setActionLoading(null); }
  };

  const handleDelete = async (uuid) => {
    if (!window.confirm('Delete this post?')) return;
    setActionLoading(uuid + '_delete');
    try { await api.delete(`/api/admin/posts/${uuid}`); fetchPosts(); }
    finally { setActionLoading(null); }
  };

  const handleBulkApprove = async () => {
    setBulkLoading(true);
    try { await api.post('/api/admin/posts/bulk/approve', { uuids: selected }); fetchPosts(); }
    finally { setBulkLoading(false); }
  };

  const handleBulkReject = async () => {
    setBulkLoading(true);
    try { await api.post('/api/admin/posts/bulk/reject', { uuids: selected }); fetchPosts(); }
    finally { setBulkLoading(false); }
  };

  return (
    <Box>
      {/* Page header */}
      <Box mb={3.5} display="flex" alignItems="flex-end" justifyContent="space-between">
        <Box>
          <Typography
            variant="subtitle2"
            sx={{ color: 'primary.main', mb: 0.5, fontFamily: 'var(--font-jetbrains)', letterSpacing: '0.1em' }}
          >
            CONTENT PIPELINE
          </Typography>
          <Typography variant="h4" fontWeight={700} sx={{ color: 'text.primary', letterSpacing: '-0.01em' }}>
            Posts
          </Typography>
        </Box>
        <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: 'var(--font-jetbrains)' }}>
          {total} total
        </Typography>
      </Box>

      {/* Tabs */}
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
        <Tabs value={tab} onChange={handleTabChange}>
          {STATUS_TABS.map((s) => (
            <Tab key={s} label={s} sx={{ textTransform: 'capitalize' }} />
          ))}
        </Tabs>
      </Box>

      {/* Bulk actions bar */}
      {selected.length > 0 && (
        <Box
          mb={2}
          px={2}
          py={1}
          display="flex"
          alignItems="center"
          gap={1.5}
          sx={{
            background: 'rgba(167,139,250,0.08)',
            border: '1px solid rgba(167,139,250,0.18)',
            borderRadius: '10px',
          }}
        >
          <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 600, flex: 1 }}>
            {selected.length} selected
          </Typography>
          {status === 'pending' && (
            <>
              <Button
                size="small" variant="outlined" color="success"
                disabled={bulkLoading}
                onClick={handleBulkApprove}
                startIcon={bulkLoading ? <CircularProgress size={12} /> : <CheckCircleOutline fontSize="small" />}
              >
                Approve all
              </Button>
              <Button
                size="small" variant="outlined" color="error"
                disabled={bulkLoading}
                onClick={handleBulkReject}
                startIcon={<CancelOutlined fontSize="small" />}
              >
                Reject all
              </Button>
            </>
          )}
          <Button size="small" onClick={() => setSelected([])}>Clear</Button>
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
            NO {status.toUpperCase()} POSTS
          </Typography>
        </Box>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      size="small"
                      indeterminate={selected.length > 0 && !allSelected}
                      checked={allSelected}
                      onChange={toggleAll}
                    />
                  </TableCell>
                  <TableCell>Headline</TableCell>
                  <TableCell>FA Summary</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Score</TableCell>
                  <TableCell>Source</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell></TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {posts.map((post) => (
                  <TableRow
                    key={post.uuid}
                    hover
                    selected={selected.includes(post.uuid)}
                    sx={{ cursor: 'pointer' }}
                    onClick={() => router.push(`/admin/posts/${post.uuid}`)}
                  >
                    <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        size="small"
                        checked={selected.includes(post.uuid)}
                        onChange={() => toggleSelect(post.uuid)}
                      />
                    </TableCell>
                    <TableCell sx={{ maxWidth: 280 }}>
                      <Typography variant="body2" noWrap sx={{ fontWeight: 500 }}>
                        {post.headline || '—'}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ maxWidth: 260 }}>
                      <Typography variant="body2" noWrap sx={{ fontWeight: 400, color: 'text.secondary', mb: 0.4 }}>
                        {post.tldr || '—'}
                      </Typography>
                      {post.translations?.[0] ? (
                        <Typography
                          variant="caption"
                          noWrap
                          sx={{ color: 'rgba(255,255,255,0.4)', display: 'block', direction: 'rtl', textAlign: 'right' }}
                        >
                          {post.translations[0].tldr}
                        </Typography>
                      ) : (
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.15)' }}>—</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={post.category?.replace(/_/g, ' ')}
                        color={CATEGORY_COLORS[post.category] || 'default'}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell><ScoreChip score={post.relevanceScore} /></TableCell>
                    <TableCell>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: 'var(--font-jetbrains)' }}>
                        {post.rawItem?.source?.name || '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {(() => {
                        const d = new Date(status === 'published' ? post.publishedAt || post.createdAt : post.createdAt);
                        const shamsi = d.toLocaleDateString('en-US-u-ca-persian', { year: 'numeric', month: '2-digit', day: '2-digit' });
                        const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
                        return (
                          <Box>
                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                              {shamsi}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-jetbrains)', display: 'block' }}>
                              {time}
                            </Typography>
                          </Box>
                        );
                      })()}
                    </TableCell>
                    <TableCell>
                      {post.linkedinDraft && (
                        <Tooltip title="LinkedIn draft ready">
                          <LinkedIn sx={{ fontSize: 16, color: '#0A66C2', verticalAlign: 'middle' }} />
                        </Tooltip>
                      )}
                    </TableCell>
                    <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => router.push(`/admin/posts/${post.uuid}`)}>
                          <EditOutlined fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {status === 'pending' && (
                        <>
                          <Tooltip title="Approve & Publish">
                            <IconButton
                              size="small" color="success"
                              disabled={actionLoading === post.uuid + '_approve'}
                              onClick={() => handleApprove(post.uuid)}
                            >
                              {actionLoading === post.uuid + '_approve'
                                ? <CircularProgress size={14} />
                                : <CheckCircleOutline fontSize="small" />}
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Reject">
                            <IconButton
                              size="small" color="error"
                              disabled={actionLoading === post.uuid + '_reject'}
                              onClick={() => handleReject(post.uuid)}
                            >
                              {actionLoading === post.uuid + '_reject'
                                ? <CircularProgress size={14} />
                                : <CancelOutlined fontSize="small" />}
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Schedule">
                            <IconButton size="small" onClick={() => router.push(`/admin/posts/${post.uuid}`)}>
                              <ScheduleOutlined fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                      <Tooltip title="Delete">
                        <IconButton
                          size="small" color="error"
                          disabled={actionLoading === post.uuid + '_delete'}
                          onClick={() => handleDelete(post.uuid)}
                        >
                          {actionLoading === post.uuid + '_delete'
                            ? <CircularProgress size={14} />
                            : <DeleteOutlined fontSize="small" />}
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {totalPages > 1 && (
            <Stack direction="row" justifyContent="center" mt={3}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
                size="small"
                showFirstButton
                showLastButton
              />
            </Stack>
          )}
        </>
      )}
    </Box>
  );
}
