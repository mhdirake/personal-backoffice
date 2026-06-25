'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Table, TableHead, TableRow, TableCell, TableBody,
  Chip, IconButton, Tooltip, CircularProgress, Alert, Paper,
  TableContainer, Pagination, Stack, Select, MenuItem, FormControl,
  InputLabel, Button, Collapse, Dialog, DialogTitle, DialogContent,
  DialogContentText, DialogActions,
} from '@mui/material';
import {
  DeleteOutlined, ExpandMoreOutlined, ExpandLessOutlined,
  RefreshOutlined, DeleteSweepOutlined,
} from '@mui/icons-material';
import api from '@/utils/api';

const LEVEL_COLORS = { error: 'error', warn: 'warning', info: 'info' };
const PAGE_SIZE = 20;

const FEATURES = ['', 'http', 'fetch', 'ai', 'publish', 'blog-chat', 'uncaughtException', 'unhandledRejection', 'unknown'];

function StackRow({ stack }) {
  const [open, setOpen] = useState(false);
  if (!stack) return null;
  return (
    <Box mt={0.5}>
      <Box
        onClick={() => setOpen((v) => !v)}
        sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, cursor: 'pointer', color: 'rgba(255,255,255,0.35)', fontSize: '11px' }}
      >
        {open ? <ExpandLessOutlined sx={{ fontSize: 14 }} /> : <ExpandMoreOutlined sx={{ fontSize: 14 }} />}
        stack trace
      </Box>
      <Collapse in={open}>
        <Box
          sx={{
            mt: 0.75,
            p: 1.5,
            borderRadius: '6px',
            bgcolor: 'rgba(0,0,0,0.35)',
            fontFamily: 'monospace',
            fontSize: '11px',
            color: 'rgba(255,120,120,0.85)',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all',
            maxHeight: 240,
            overflow: 'auto',
          }}
        >
          {stack}
        </Box>
      </Collapse>
    </Box>
  );
}

function MetaRow({ meta }) {
  if (!meta) return null;
  let parsed;
  try { parsed = JSON.parse(meta); } catch { return null; }
  return (
    <Box mt={0.5} sx={{ fontFamily: 'monospace', fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>
      {Object.entries(parsed).map(([k, v]) => (
        <Box key={k} component="span" sx={{ mr: 1.5 }}>
          <Box component="span" sx={{ color: 'rgba(13,200,255,0.6)' }}>{k}:</Box> {String(v)}
        </Box>
      ))}
    </Box>
  );
}

export default function ErrorLogsPage() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [days, setDays] = useState(7);
  const [levelFilter, setLevelFilter] = useState('');
  const [featureFilter, setFeatureFilter] = useState('');
  const [clearDialog, setClearDialog] = useState(false);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { page, limit: PAGE_SIZE, days };
      if (levelFilter) params.level = levelFilter;
      if (featureFilter) params.feature = featureFilter;
      const { data } = await api.get('/api/admin/error-logs', { params });
      setLogs(data.logs);
      setTotal(data.total);
    } catch {
      setError('Failed to load error logs.');
    } finally {
      setLoading(false);
    }
  }, [page, days, levelFilter, featureFilter]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  async function handleDelete(uuid) {
    try {
      await api.delete(`/api/admin/error-logs/${uuid}`);
      fetchLogs();
    } catch {
      setError('Delete failed.');
    }
  }

  async function handleClearOld() {
    try {
      await api.delete('/api/admin/error-logs', { params: { days: 30 } });
      setClearDialog(false);
      fetchLogs();
    } catch {
      setError('Clear failed.');
    }
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Error Logs</Typography>
          <Typography sx={{ fontSize: '13px', color: 'text.secondary', mt: 0.25 }}>
            {total} entries
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          <FormControl size="small" sx={{ minWidth: 100 }}>
            <InputLabel>Days</InputLabel>
            <Select value={days} label="Days" onChange={(e) => { setDays(e.target.value); setPage(1); }}>
              {[1, 3, 7, 14, 30].map((d) => <MenuItem key={d} value={d}>{d}d</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 110 }}>
            <InputLabel>Level</InputLabel>
            <Select value={levelFilter} label="Level" onChange={(e) => { setLevelFilter(e.target.value); setPage(1); }}>
              <MenuItem value="">All</MenuItem>
              {['error', 'warn', 'info'].map((l) => <MenuItem key={l} value={l}>{l}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Feature</InputLabel>
            <Select value={featureFilter} label="Feature" onChange={(e) => { setFeatureFilter(e.target.value); setPage(1); }}>
              {FEATURES.map((f) => <MenuItem key={f} value={f}>{f || 'All'}</MenuItem>)}
            </Select>
          </FormControl>
          <Tooltip title="Refresh">
            <IconButton onClick={fetchLogs} size="small"><RefreshOutlined fontSize="small" /></IconButton>
          </Tooltip>
          <Tooltip title="Clear logs older than 30 days">
            <IconButton onClick={() => setClearDialog(true)} size="small" color="error">
              <DeleteSweepOutlined fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress size={32} />
        </Box>
      ) : logs.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
          <Typography>No errors found.</Typography>
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: '12px' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: 80 }}>Level</TableCell>
                <TableCell sx={{ width: 120 }}>Feature</TableCell>
                <TableCell>Message</TableCell>
                <TableCell sx={{ width: 160 }}>Time</TableCell>
                <TableCell sx={{ width: 50 }} />
              </TableRow>
            </TableHead>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.uuid} sx={{ verticalAlign: 'top' }}>
                  <TableCell>
                    <Chip
                      label={log.level}
                      color={LEVEL_COLORS[log.level] || 'default'}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip label={log.feature} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontSize: '13px', color: 'rgba(255,255,255,0.85)', wordBreak: 'break-word' }}>
                      {log.message}
                    </Typography>
                    <MetaRow meta={log.meta} />
                    <StackRow stack={log.stack} />
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontSize: '12px', color: 'text.secondary' }}>
                      {new Date(log.createdAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Delete">
                      <IconButton size="small" onClick={() => handleDelete(log.uuid)}>
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

      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination count={totalPages} page={page} onChange={(_, v) => setPage(v)} color="primary" />
        </Box>
      )}

      <Dialog open={clearDialog} onClose={() => setClearDialog(false)}>
        <DialogTitle>Clear old logs?</DialogTitle>
        <DialogContent>
          <DialogContentText>Delete all error logs older than 30 days. This cannot be undone.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClearDialog(false)}>Cancel</Button>
          <Button onClick={handleClearOld} color="error" variant="contained">Clear</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
