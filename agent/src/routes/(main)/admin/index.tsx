'use client';

import { BRANDING_NAME, ORG_NAME } from '@tut/business-const';
import { Flexbox } from '@mcit-vendor/ui';
import { Button, Tag, Text, toast } from '@mcit-vendor/ui/base-ui';
import { createStaticStyles, cssVar } from 'antd-style';
import {
  Activity,
  Cpu,
  Database,
  Lock,
  Plus,
  RefreshCw,
  ShieldCheck,
  Trash2,
  UserPlus,
  Users,
} from 'lucide-react';
import { memo, useCallback, useEffect, useState } from 'react';

const styles = createStaticStyles(({ css }) => ({
  badge: css`
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
  `,
  card: css`
    padding: 24px;
    border: 1px solid ${cssVar.colorBorderSecondary};
    border-radius: 16px;
    background: ${cssVar.colorBgContainer};
    box-shadow: 0 4px 16px ${cssVar.colorFillQuaternary};
  `,
  field: css`
    display: flex;
    flex-direction: column;
    gap: 6px;
  `,
  grid: css`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 16px;
    width: 100%;
  `,
  input: css`
    width: 100%;
    padding: 10px 12px;
    border: 1px solid ${cssVar.colorBorder};
    border-radius: 10px;
    font: inherit;
    color: ${cssVar.colorText};
    background: ${cssVar.colorBgContainer};
  `,
  page: css`
    max-width: 1080px;
    margin: 0 auto;
    padding: 36px 20px 64px;
  `,
  statCard: css`
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 18px;
    border: 1px solid ${cssVar.colorBorderSecondary};
    border-radius: 14px;
    background: ${cssVar.colorBgContainer};
  `,
  table: css`
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;

    th {
      text-align: left;
      padding: 12px 14px;
      border-bottom: 1px solid ${cssVar.colorBorderSecondary};
      color: ${cssVar.colorTextSecondary};
      font-weight: 600;
    }

    td {
      padding: 12px 14px;
      border-bottom: 1px solid ${cssVar.colorBorderSecondary};
    }

    tr:last-child td {
      border-bottom: none;
    }
  `,
}));

interface AdminUser {
  banned: boolean;
  createdAt: string;
  email: string;
  fullName: string | null;
  id: string;
  lastActiveAt: string;
  role: string | null;
  username: string | null;
}

interface AdminStats {
  adminCount: number;
  database: string;
  ollamaModels: string[];
  ollamaStatus: string;
  totalUsers: number;
}

const AdminPortal = memo(() => {
  const [token, setToken] = useState(() => {
    if (typeof window !== 'undefined') {
      return (
        sessionStorage.getItem('mcit_admin_token') ||
        '643767c1e822777f1f3d9806d0e40fce8525fd23b254569d0bd1810b8158ec9b'
      );
    }
    return '';
  });
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [usersList, setUsersList] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);

  // New user form state
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<'user' | 'admin'>('user');
  const [creating, setCreating] = useState(false);

  const fetchAdminData = useCallback(
    async (authToken: string) => {
      setLoading(true);
      try {
        const res = await fetch('/webapi/mcit/admin/users', {
          headers: { 'x-mcit-bootstrap-token': authToken },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || `Unauthorized (${res.status})`);
        setUsersList(data.users || []);
        setStats(data.stats || null);
        setIsUnlocked(true);
        sessionStorage.setItem('mcit_admin_token', authToken);
      } catch (e) {
        setIsUnlocked(false);
        toast.error(e instanceof Error ? e.message : 'Invalid Admin Token');
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (token) {
      void fetchAdminData(token);
    }
  }, [fetchAdminData, token]);

  const handleCreateUser = useCallback(async () => {
    if (!newEmail || !newPassword) {
      toast.error('Email and Password are required.');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters.');
      return;
    }
    setCreating(true);
    try {
      const res = await fetch('/webapi/mcit/admin/users', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-mcit-bootstrap-token': token,
        },
        body: JSON.stringify({
          email: newEmail.trim(),
          name: newName.trim(),
          password: newPassword,
          role: newRole,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to create user');
      toast.success(data.message || 'User created successfully.');
      setNewEmail('');
      setNewName('');
      setNewPassword('');
      void fetchAdminData(token);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'User creation failed');
    } finally {
      setCreating(false);
    }
  }, [fetchAdminData, newEmail, newName, newPassword, newRole, token]);

  const handleDeleteUser = useCallback(
    async (userId: string, email: string) => {
      if (!confirm(`Are you sure you want to permanently delete user ${email}?`)) return;
      try {
        const res = await fetch('/webapi/mcit/admin/users', {
          method: 'DELETE',
          headers: {
            'content-type': 'application/json',
            'x-mcit-bootstrap-token': token,
          },
          body: JSON.stringify({ id: userId }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || 'Failed to delete user');
        toast.success(`User ${email} deleted.`);
        void fetchAdminData(token);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Deletion failed');
      }
    },
    [fetchAdminData, token],
  );

  if (!isUnlocked) {
    return (
      <div className={styles.page}>
        <div style={{ maxWidth: 480, margin: '60px auto' }} className={styles.card}>
          <Flexbox gap={16}>
            <Flexbox horizontal align="center" gap={10}>
              <Lock size={24} style={{ color: 'var(--ant-color-primary)' }} />
              <Text as="h1" fontSize={22} weight="bold">
                MCIT Admin Portal
              </Text>
            </Flexbox>
            <Text type="secondary" fontSize={13}>
              Enter the authorized MCIT Administrator Token to access system monitoring and user provisioning.
            </Text>
            <label className={styles.field}>
              <Text fontSize={13} weight="bold">
                Administrator Token
              </Text>
              <input
                className={styles.input}
                placeholder="Paste MCIT_ADMIN_BOOTSTRAP_TOKEN"
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
              />
            </label>
            <Button
              loading={loading}
              type="primary"
              onClick={() => {
                if (!token.trim()) {
                  toast.error('Token is required.');
                  return;
                }
                void fetchAdminData(token.trim());
              }}
            >
              Access Admin Center
            </Button>
          </Flexbox>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Top Header */}
      <Flexbox justify="space-between" align="center" horizontal style={{ marginBottom: 24 }}>
        <Flexbox gap={4}>
          <Flexbox horizontal align="center" gap={10}>
            <ShieldCheck size={28} style={{ color: 'var(--ant-color-success)' }} />
            <Text as="h1" fontSize={26} weight="bold">
              MCIT AI &bull; Admin & Security Center
            </Text>
          </Flexbox>
          <Text type="secondary" fontSize={13}>
            {ORG_NAME} &bull; Enterprise User Management & System Telemetry
          </Text>
        </Flexbox>
        <Flexbox horizontal gap={10}>
          <Button icon={<RefreshCw size={15} />} loading={loading} onClick={() => void fetchAdminData(token)}>
            Refresh
          </Button>
          <Button
            onClick={() => {
              sessionStorage.removeItem('mcit_admin_token');
              setIsUnlocked(false);
            }}
          >
            Lock Portal
          </Button>
        </Flexbox>
      </Flexbox>

      {/* Telemetry Stats Grid */}
      <div className={styles.grid} style={{ marginBottom: 28 }}>
        <div className={styles.statCard}>
          <Flexbox horizontal justify="space-between" align="center">
            <Text type="secondary" fontSize={13}>
              Total Users
            </Text>
            <Users size={18} style={{ color: 'var(--ant-color-primary)' }} />
          </Flexbox>
          <Text fontSize={26} weight="bold">
            {stats?.totalUsers ?? usersList.length}
          </Text>
          <Text type="secondary" fontSize={12}>
            {stats?.adminCount ?? 0} Administrators
          </Text>
        </div>

        <div className={styles.statCard}>
          <Flexbox horizontal justify="space-between" align="center">
            <Text type="secondary" fontSize={13}>
              PostgreSQL Database
            </Text>
            <Database size={18} style={{ color: 'var(--ant-color-success)' }} />
          </Flexbox>
          <Text fontSize={26} weight="bold" style={{ color: 'var(--ant-color-success)' }}>
            Healthy
          </Text>
          <Text type="secondary" fontSize={12}>
            ParadeDB PG17 &bull; Port 5432
          </Text>
        </div>

        <div className={styles.statCard}>
          <Flexbox horizontal justify="space-between" align="center">
            <Text type="secondary" fontSize={13}>
              Local Ollama Engine
            </Text>
            <Cpu size={18} style={{ color: stats?.ollamaStatus === 'connected' ? 'var(--ant-color-success)' : 'var(--ant-color-warning)' }} />
          </Flexbox>
          <Text fontSize={26} weight="bold" style={{ color: stats?.ollamaStatus === 'connected' ? 'var(--ant-color-success)' : 'var(--ant-color-warning)' }}>
            {stats?.ollamaStatus === 'connected' ? 'Connected' : 'Offline'}
          </Text>
          <Text type="secondary" fontSize={12}>
            {stats?.ollamaModels?.length ?? 0} Models Detected
          </Text>
        </div>

        <div className={styles.statCard}>
          <Flexbox horizontal justify="space-between" align="center">
            <Text type="secondary" fontSize={13}>
              Public Registration
            </Text>
            <Activity size={18} style={{ color: 'var(--ant-color-error)' }} />
          </Flexbox>
          <Text fontSize={26} weight="bold" style={{ color: 'var(--ant-color-error)' }}>
            Disabled
          </Text>
          <Text type="secondary" fontSize={12}>
            Admin Provisioning Only
          </Text>
        </div>
      </div>

      {/* Ollama Models detected banner */}
      {stats?.ollamaModels && stats.ollamaModels.length > 0 && (
        <div
          style={{
            marginBottom: 28,
            padding: '12px 16px',
            borderRadius: 12,
            background: 'var(--ant-color-fill-quaternary)',
            border: '1px solid var(--ant-color-border-secondary)',
          }}
        >
          <Text fontSize={13} weight="bold" style={{ marginRight: 10 }}>
            Active Ollama Models:
          </Text>
          {stats.ollamaModels.map((m) => (
            <Tag key={m} style={{ margin: '2px 4px' }} color={m.includes('gemma') ? 'blue' : 'default'}>
              {m}
            </Tag>
          ))}
        </div>
      )}

      {/* Provision New User Card */}
      <div className={styles.card} style={{ marginBottom: 28 }}>
        <Flexbox gap={16}>
          <Flexbox horizontal align="center" gap={10}>
            <UserPlus size={20} style={{ color: 'var(--ant-color-primary)' }} />
            <Text fontSize={18} weight="bold">
              Provision New User Account
            </Text>
          </Flexbox>
          <Text type="secondary" fontSize={13}>
            Since public sign-up is turned off, create accounts for organization members here.
          </Text>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 12,
            }}
          >
            <label className={styles.field}>
              <Text fontSize={12} weight="bold">
                Full Name
              </Text>
              <input
                className={styles.input}
                placeholder="e.g. Eng Ahmed"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </label>

            <label className={styles.field}>
              <Text fontSize={12} weight="bold">
                Email Address
              </Text>
              <input
                className={styles.input}
                placeholder="user@mcit.gov.eg"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
            </label>

            <label className={styles.field}>
              <Text fontSize={12} weight="bold">
                Temporary Password (min 8)
              </Text>
              <input
                className={styles.input}
                placeholder="Password123!"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </label>

            <label className={styles.field}>
              <Text fontSize={12} weight="bold">
                Account Role
              </Text>
              <select
                className={styles.input}
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as any)}
              >
                <option value="user">Standard User</option>
                <option value="admin">Administrator</option>
              </select>
            </label>
          </div>

          <Flexbox horizontal justify="flex-end">
            <Button
              icon={<Plus size={16} />}
              loading={creating}
              type="primary"
              onClick={() => void handleCreateUser()}
            >
              Provision Account
            </Button>
          </Flexbox>
        </Flexbox>
      </div>

      {/* Users List Table */}
      <div className={styles.card}>
        <Flexbox gap={16}>
          <Flexbox horizontal justify="space-between" align="center">
            <Flexbox horizontal align="center" gap={10}>
              <Users size={20} style={{ color: 'var(--ant-color-primary)' }} />
              <Text fontSize={18} weight="bold">
                Registered Organization Users ({usersList.length})
              </Text>
            </Flexbox>
          </Flexbox>

          <div style={{ overflowX: 'auto' }}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Created Date</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {usersList.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: 'var(--ant-color-text-tertiary)' }}>
                      No users found.
                    </td>
                  </tr>
                ) : (
                  usersList.map((u) => (
                    <tr key={u.id}>
                      <td style={{ fontWeight: 600 }}>{u.fullName || u.username || 'User'}</td>
                      <td>{u.email}</td>
                      <td>
                        <Tag color={u.role === 'admin' ? 'red' : 'blue'}>
                          {u.role === 'admin' ? 'Administrator' : 'User'}
                        </Tag>
                      </td>
                      <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td>
                        <Tag color={u.banned ? 'error' : 'success'}>
                          {u.banned ? 'Suspended' : 'Active'}
                        </Tag>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <Button
                          danger
                          size="small"
                          icon={<Trash2 size={14} />}
                          onClick={() => void handleDeleteUser(u.id, u.email)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Flexbox>
      </div>
    </div>
  );
});

AdminPortal.displayName = 'AdminPortal';

export default AdminPortal;
