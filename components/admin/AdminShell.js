'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useDispatch } from 'react-redux';
import Link from 'next/link';
import {
  Box, Drawer, List, ListItem, ListItemButton,
  ListItemIcon, ListItemText, Typography, Divider,
  IconButton, Tooltip,
} from '@mui/material';
import {
  ArticleOutlined,
  RssFeedOutlined,
  LogoutOutlined,
} from '@mui/icons-material';
import { setToken, clearToken } from '@/store/slices/authSlice';

const SIDEBAR_WIDTH = 220;

const NAV_ITEMS = [
  { label: 'Posts', href: '/admin/posts', icon: <ArticleOutlined fontSize="small" /> },
  { label: 'Sources', href: '/admin/sources', icon: <RssFeedOutlined fontSize="small" /> },
];

export default function AdminShell({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      dispatch(setToken(token));
    } else {
      router.push('/admin/login');
    }
  }, [dispatch, router]);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    document.cookie = 'admin_token=;path=/;max-age=0';
    dispatch(clearToken());
    router.push('/admin/login');
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Drawer
        variant="permanent"
        sx={{
          width: SIDEBAR_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: SIDEBAR_WIDTH,
            boxSizing: 'border-box',
            bgcolor: 'background.paper',
            borderRight: '1px solid',
            borderColor: 'divider',
          },
        }}
      >
        <Box sx={{ px: 2, py: 2.5 }}>
          <Typography variant="subtitle1" fontWeight={700} color="primary.main">
            DevSignal
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Admin
          </Typography>
        </Box>

        <Divider />

        <List dense sx={{ mt: 1, flex: 1 }}>
          {NAV_ITEMS.map(({ label, href, icon }) => {
            const active = pathname.startsWith(href);
            return (
              <ListItem key={href} disablePadding>
                <ListItemButton
                  component={Link}
                  href={href}
                  selected={active}
                  sx={{
                    borderRadius: 1,
                    mx: 1,
                    '&.Mui-selected': {
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                      '& .MuiListItemIcon-root': { color: 'primary.contrastText' },
                      '&:hover': { bgcolor: 'primary.dark' },
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>{icon}</ListItemIcon>
                  <ListItemText primary={label} primaryTypographyProps={{ fontSize: 14 }} />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>

        <Box sx={{ p: 1.5 }}>
          <Tooltip title="Logout" placement="right">
            <IconButton onClick={handleLogout} size="small" sx={{ color: 'text.secondary' }}>
              <LogoutOutlined fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Drawer>

      <Box component="main" sx={{ flex: 1, p: 3, overflow: 'auto' }}>
        {children}
      </Box>
    </Box>
  );
}
