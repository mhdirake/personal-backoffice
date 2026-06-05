'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import {
  Box, Card, CardContent, TextField, Button,
  Typography, CircularProgress, Alert,
} from '@mui/material';
import { setToken } from '@/store/slices/authSlice';
import api from '@/utils/api';

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [secret, setSecret] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/api/auth/login', { secret });
      localStorage.setItem('admin_token', data.token);
      document.cookie = `admin_token=${data.token};path=/;max-age=${7 * 24 * 3600};samesite=lax`;
      dispatch(setToken(data.token));
      router.push('/admin/posts');
    } catch {
      setError('Invalid secret. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
      }}
    >
      <Card sx={{ width: 380, bgcolor: 'background.paper' }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" fontWeight={700} mb={0.5}>
            DevSignal
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Admin access
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} display="flex" flexDirection="column" gap={2}>
            <TextField
              label="Secret"
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              autoFocus
              fullWidth
              size="small"
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading || !secret}
            >
              {loading ? <CircularProgress size={20} color="inherit" /> : 'Sign in'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
