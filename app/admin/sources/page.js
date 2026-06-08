'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Table, TableHead, TableRow, TableCell,
  TableBody, TableContainer, Paper, Chip, IconButton,
  Tooltip, TextField, Button, Select, MenuItem,
  FormControl, InputLabel, Switch, CircularProgress,
  Alert, Dialog, DialogTitle, DialogContent,
  DialogContentText, DialogActions,
} from '@mui/material';
import { DeleteOutlined, AddOutlined } from '@mui/icons-material';
import api from '@/utils/api';

const SOURCE_TYPES = ['github_release', 'rss', 'npm'];

const TYPE_COLORS = {
  github_release: 'default',
  rss: 'info',
  npm: 'warning',
};

const PLACEHOLDERS = {
  github_release: 'e.g. vercel/next.js',
  rss: 'e.g. https://nextjs.org/feed',
  npm: 'e.g. next',
};

export default function SourcesPage() {
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [form, setForm] = useState({ type: 'github_release', name: '', identifier: '' });
  const [formError, setFormError] = useState('');
  const [adding, setAdding] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchSources = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/api/admin/sources');
      setSources(data.sources);
    } catch {
      setError('Failed to load sources.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSources(); }, [fetchSources]);

  const handleToggle = async (uuid) => {
    setActionLoading(uuid);
    try {
      await api.patch(`/api/admin/sources/${uuid}/toggle`);
      setSources((prev) => prev.map((s) => s.uuid === uuid ? { ...s, active: !s.active } : s));
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setActionLoading(deleteTarget);
    try {
      await api.delete(`/api/admin/sources/${deleteTarget}`);
      setSources((prev) => prev.filter((s) => s.uuid !== deleteTarget));
    } catch {
      setError('Delete failed.');
    } finally {
      setActionLoading(null);
      setDeleteTarget(null);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!form.name.trim() || !form.identifier.trim()) {
      setFormError('Name and identifier are required.');
      return;
    }
    setAdding(true);
    try {
      const { data } = await api.post('/api/admin/sources', form);
      setSources((prev) => [...prev, data.source]);
      setForm({ type: 'github_release', name: '', identifier: '' });
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to add source.');
    } finally {
      setAdding(false);
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box mb={3.5}>
        <Typography
          variant="subtitle2"
          sx={{ color: 'primary.main', mb: 0.5, fontFamily: 'var(--font-jetbrains)', letterSpacing: '0.1em' }}
        >
          INGESTION
        </Typography>
        <Typography variant="h4" fontWeight={700} sx={{ color: 'text.primary', letterSpacing: '-0.01em' }}>
          Sources
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2.5 }}>{error}</Alert>}

      {/* Add form */}
      <Box
        component="form"
        onSubmit={handleAdd}
        sx={{
          display: 'flex',
          gap: 1.5,
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          mb: 3,
          p: 2.5,
          background: 'rgba(255,255,255,0.03)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Type</InputLabel>
          <Select
            value={form.type}
            label="Type"
            onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
          >
            {SOURCE_TYPES.map((t) => (
              <MenuItem key={t} value={t}>{t.replace(/_/g, ' ')}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="Name"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          size="small"
          sx={{ minWidth: 180 }}
          placeholder="e.g. Next.js Releases"
        />

        <TextField
          label="Identifier"
          value={form.identifier}
          onChange={(e) => setForm((f) => ({ ...f, identifier: e.target.value }))}
          size="small"
          sx={{ flex: 1, minWidth: 220 }}
          placeholder={PLACEHOLDERS[form.type]}
          error={!!formError}
          helperText={formError}
        />

        <Button
          type="submit"
          variant="contained"
          startIcon={adding ? <CircularProgress size={14} color="inherit" /> : <AddOutlined />}
          disabled={adding}
          size="small"
          sx={{ mt: 0.25 }}
        >
          Add Source
        </Button>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={8}>
          <CircularProgress size={32} thickness={2} sx={{ color: 'primary.main' }} />
        </Box>
      ) : sources.length === 0 ? (
        <Box mt={8} textAlign="center">
          <Typography sx={{ color: 'rgba(255,255,255,0.2)', fontSize: '13px', letterSpacing: '0.06em' }}>
            NO SOURCES CONFIGURED
          </Typography>
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Identifier</TableCell>
                <TableCell>Last Fetched</TableCell>
                <TableCell align="center">Active</TableCell>
                <TableCell align="right">Delete</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sources.map((source) => (
                <TableRow key={source.uuid}>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>{source.name}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={source.type.replace(/_/g, ' ')}
                      color={TYPE_COLORS[source.type] || 'default'}
                      size="small" variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: 'var(--font-jetbrains)' }}>
                      {source.identifier}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: 'var(--font-jetbrains)' }}>
                      {source.lastFetchedAt ? new Date(source.lastFetchedAt).toLocaleString() : 'Never'}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    {actionLoading === source.uuid ? (
                      <CircularProgress size={16} />
                    ) : (
                      <Switch
                        checked={source.active}
                        onChange={() => handleToggle(source.uuid)}
                        size="small"
                        color="success"
                      />
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Delete">
                      <IconButton size="small" color="error" onClick={() => setDeleteTarget(source.uuid)}>
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
        <DialogTitle>Remove source?</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontSize: '13px' }}>
            Raw items already fetched will not be deleted.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 2.5, pb: 2 }}>
          <Button onClick={() => setDeleteTarget(null)} size="small">Cancel</Button>
          <Button variant="contained" color="error" size="small" onClick={handleDelete}>Remove</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
