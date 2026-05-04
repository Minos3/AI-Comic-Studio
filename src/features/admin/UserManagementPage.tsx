import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, Tag, Space, Popconfirm, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { api } from '../../lib/api';

interface User {
  id: number;
  username: string;
  role: string;
  status: string;
  createdAt: string;
}

const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm();

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/users');
      if (res.data.success) setUsers(res.data.data);
    } catch { message.error('加载用户列表失败'); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadUsers(); }, []);

  const handleCreate = () => {
    setEditingUser(null);
    form.resetFields();
    form.setFieldsValue({ role: 'user' });
    setModalOpen(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    form.setFieldsValue({ username: user.username, role: user.role });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingUser) {
        await api.patch(`/admin/users/${editingUser.id}`, values);
        message.success('用户已更新');
      } else {
        await api.post('/admin/users', values);
        message.success('用户已创建');
      }
      setModalOpen(false);
      loadUsers();
    } catch (err: any) {
      if (err.response) message.error(err.response.data?.error?.message || '操作失败');
    }
  };

  const toggleStatus = async (user: User) => {
    const newStatus = user.status === 'active' ? 'disabled' : 'active';
    await api.patch(`/admin/users/${user.id}`, { status: newStatus });
    message.success(`用户已${newStatus === 'active' ? '启用' : '禁用'}`);
    loadUsers();
  };

  const toggleRole = async (user: User) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    await api.patch(`/admin/users/${user.id}`, { role: newRole });
    message.success(`角色已切换为 ${newRole}`);
    loadUsers();
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 60 },
    { title: '用户名', dataIndex: 'username' },
    {
      title: '角色', dataIndex: 'role', width: 100,
      render: (role: string) => (
        <Tag color={role === 'admin' ? 'purple' : 'default'}>{role === 'admin' ? '管理员' : '用户'}</Tag>
      ),
    },
    {
      title: '状态', dataIndex: 'status', width: 100,
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>{status === 'active' ? '正常' : '已禁用'}</Tag>
      ),
    },
    {
      title: '创建时间', dataIndex: 'createdAt', width: 180,
      render: (v: string) => v?.replace('T', ' ').substring(0, 19),
    },
    {
      title: '操作', width: 260,
      render: (_: unknown, record: User) => (
        <Space>
          <Button size="small" onClick={() => handleEdit(record)}>编辑</Button>
          <Button size="small" onClick={() => toggleRole(record)}>
            {record.role === 'admin' ? '降为用户' : '升为管理'}
          </Button>
          <Popconfirm
            title={record.status === 'active' ? '确定禁用该用户？' : '确定启用该用户？'}
            onConfirm={() => toggleStatus(record)}
          >
            <Button size="small" danger={record.status === 'active'}>
              {record.status === 'active' ? '禁用' : '启用'}
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="bg-white rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">用户管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>创建用户</Button>
      </div>
      <Table columns={columns} dataSource={users} rowKey="id" loading={loading} size="middle" />

      <Modal
        title={editingUser ? '编辑用户' : '创建用户'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="username" label="用户名" rules={[{ required: true, message: '请输入用户名' }]}>
            <Input placeholder="用户名" disabled={!!editingUser} />
          </Form.Item>
          {!editingUser && (
            <Form.Item name="password" label="密码" rules={[{ required: true, message: '请输入密码' }]}>
              <Input.Password placeholder="初始密码" />
            </Form.Item>
          )}
          <Form.Item name="role" label="角色" rules={[{ required: true }]}>
            <Select options={[
              { value: 'user', label: '用户 (user)' },
              { value: 'admin', label: '管理员 (admin)' },
            ]} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManagementPage;
