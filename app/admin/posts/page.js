'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box, Typography, Tabs, Tab, Table, TableHead, TableRow,
  TableCell, TableBody, Chip, IconButton, Tooltip,
  CircularProgress, Alert, TableContainer, Paper,
} from '@mui/material';
import {
  CheckCircleOutline, CancelOutlined, EditOutlined,
  ScheduleOutlined,
} from '@mui/icons-material';
import api from '@/utils/api';

const STATUS_TABS = ['pending', 'approved', 'scheduled', 'rejected'];

const CATEGORY_COLORS = {
  news_intelligence: 'info',
  architecture_insights: 'secondary',
  performance_signals: 'success',
  ecosystem_signals: 'warning',
};

function ScoreChip({ score }) {
  const color = score >= 0.7 ? 'success' : score >= 0.5 ? 'warning' : 'default';
  return (
    <Chip
      label={score?.toFixed(2)}
      color={color}
      size="small"
      variant="outlined"
    />
  );
}

export default function PostsPage() {
  const router = useRouter();
  const [tab, setTab] = useState(0);
  const [posts, setPosts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  const status = STATUS_TABS[tab];

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/api/admin/posts', { params: { status, limit: 50 } });
      setPosts(data.posts);
      setTotal(data.total);
    } catch {
      setError('Failed to load posts.');
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleApprove = async (uuid) => {
    setActionLoading(uuid + '_approve');
    try {
      await api.patch(`/api/admin/posts/${uuid}/approve`);
      fetchPosts();
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (uuid) => {
    setActionLoading(uuid + '_reject');
    try {
      await api.patch(`/api/admin/posts/${uuid}/reject`);
      fetchPosts();
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <Box>
      <Box mb={3} display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography variant="h5" fontWeight={700}>Posts</Typography>
          <Typography variant="body2" color="text.secondary">{total} total in this status</Typography>
        </Box>
      </Box>

      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
      >
        {STATUS_TABS.map((s) => (
          <Tab key={s} label={s} sx={{ textTransform: 'capitalize', fontSize: 13 }} />
        ))}
      </Tabs>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box display="flex" justifyContent="center" mt={6}>
          <CircularProgress />
        </Box>
      ) : posts.length === 0 ? (
        <Box mt={6} textAlign="center">
          <Typography color="text.secondary">No {status} posts.</Typography>
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ bgcolor: 'background.paper' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Headline</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Score</TableCell>
                <TableCell>Source</TableCell>
                <TableCell>Date</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {posts.map((post) => (
                <TableRow
                  key={post.uuid}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => router.push(`/admin/posts/${post.uuid}`)}
                >
                  <TableCell sx={{ maxWidth: 340 }}>
                    <Typography variant="body2" noWrap>
                      {post.headline || '—'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={post.category?.replace(/_/g, ' ')}
                      color={CATEGORY_COLORS[post.category] || 'default'}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: 11 }}
                    />
                  </TableCell>
                  <TableCell>
                    <ScoreChip score={post.relevanceScore} />
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" color="text.secondary">
                      {post.rawItem?.source?.name || '—'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        onClick={() => router.push(`/admin/posts/${post.uuid}`)}
                      >
                        <EditOutlined fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {status === 'pending' && (
                      <>
                        <Tooltip title="Approve">
                          <IconButton
                            size="small"
                            color="success"
                            disabled={actionLoading === post.uuid + '_approve'}
                            onClick={() => handleApprove(post.uuid)}
                          >
                            {actionLoading === post.uuid + '_approve'
                              ? <CircularProgress size={16} />
                              : <CheckCircleOutline fontSize="small" />}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Reject">
                          <IconButton
                            size="small"
                            color="error"
                            disabled={actionLoading === post.uuid + '_reject'}
                            onClick={() => handleReject(post.uuid)}
                          >
                            {actionLoading === post.uuid + '_reject'
                              ? <CircularProgress size={16} />
                              : <CancelOutlined fontSize="small" />}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Schedule">
                          <IconButton
                            size="small"
                            onClick={() => router.push(`/admin/posts/${post.uuid}`)}
                          >
                            <ScheduleOutlined fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
