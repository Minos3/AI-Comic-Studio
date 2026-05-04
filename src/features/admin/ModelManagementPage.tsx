import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, Tag, Space, Popconfirm, message, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { api } from '../../lib/api';

const { TextArea } = Input;
const { Text, Paragraph } = Typography;

interface AIModel {
  id: number;
  name: string;
  type: 'image' | 'video' | 'text';
  provider: string;
  apiUrl: string;
  enabled: boolean;
  isDefault: boolean;
  configJson: string | null;
  hasApiKey: boolean;
  createdAt: string;
}

const PROVIDER_OPTIONS = [
  { label: '--- 图片生成 ---', options: [
    { value: 'nanobanana', label: 'Nanobanana Pro' },
    { value: 'jimeng', label: '即梦' },
    { value: 'gemini-image', label: 'Nanobanana2 / Gemini Image' },
    { value: 'gpt-image', label: 'GPT Image 2' },
    { value: 'grok-image', label: 'Grok Image (图片编辑)' },
  ]},
  { label: '--- 视频生成 ---', options: [
    { value: 'seedance', label: 'Seedance 2.0' },
    { value: 'sora', label: 'Sora 2' },
    { value: 'grok-video', label: 'Grok Video' },
  ]},
];

const ModelManagementPage: React.FC = () => {
  const [models, setModels] = useState<AIModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form] = Form.useForm();

  const loadModels = async () => {
    setLoading(true);
    try {
      const res = await api.get('/models');
      if (res.data.success) setModels(res.data.data);
    } catch { message.error('加载模型列表失败'); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadModels(); }, []);

  const handleCreate = () => {
    setEditingId(null);
    form.resetFields();
    form.setFieldsValue({ type: 'image', apiUrl: 'https://aigc.x-see.cn' });
    setModalOpen(true);
  };

  const handleEdit = (m: AIModel) => {
    setEditingId(m.id);
    form.setFieldsValue({
      name: m.name,
      type: m.type,
      provider: m.provider,
      apiUrl: m.apiUrl || '',
      configJson: m.configJson || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload: Record<string, unknown> = {
        name: values.name,
        type: values.type,
        provider: values.provider,
        apiUrl: values.apiUrl,
      };
      if (values.apiKey) payload.apiKey = values.apiKey;
      if (values.configJson) payload.configJson = values.configJson;

      if (editingId) {
        await api.patch(`/admin/models/${editingId}`, payload);
        message.success('模型已更新');
      } else {
        await api.post('/admin/models', payload);
        message.success('模型已创建');
      }
      setModalOpen(false);
      loadModels();
    } catch (err: any) {
      if (err.response) message.error(err.response.data?.error?.message || '操作失败');
    }
  };

  const handleToggleEnabled = async (model: AIModel) => {
    await api.patch(`/admin/models/${model.id}`, { enabled: !model.enabled });
    message.success(`模型已${!model.enabled ? '启用' : '禁用'}`);
    loadModels();
  };

  const handleSetDefault = async (model: AIModel) => {
    await api.patch(`/admin/models/${model.id}/default`);
    message.success(`${model.name} 已设为默认 ${model.type === 'image' ? '图片' : '视频'} 模型`);
    loadModels();
  };

  const handleDelete = async (id: number) => {
    await api.delete(`/admin/models/${id}`);
    message.success('模型已删除');
    loadModels();
  };

  const typeTag = (type: string) => {
    const map: Record<string, { color: string; text: string }> = {
      image: { color: 'pink', text: '图片' },
      video: { color: 'blue', text: '视频' },
      text: { color: 'green', text: '文本' },
    };
    const t = map[type] || { color: 'default', text: type };
    return <Tag color={t.color}>{t.text}</Tag>;
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 50 },
    { title: '名称', dataIndex: 'name', ellipsis: true },
    { title: '类型', dataIndex: 'type', width: 70, render: (v: string) => typeTag(v) },
    {
      title: '供应商', dataIndex: 'provider', width: 120,
      render: (v: string) => <Text code>{v}</Text>,
    },
    {
      title: 'API 地址', dataIndex: 'apiUrl', ellipsis: true, width: 200,
      render: (v: string) => v || '-',
    },
    {
      title: '密钥', width: 70,
      render: (_: unknown, r: AIModel) => (
        <Tag color={r.hasApiKey ? 'green' : 'red'}>{r.hasApiKey ? '已配置' : '未配置'}</Tag>
      ),
    },
    {
      title: '状态', width: 70,
      render: (_: unknown, r: AIModel) => (
        <Tag color={r.enabled ? 'green' : 'default'}>{r.enabled ? '启用' : '禁用'}</Tag>
      ),
    },
    {
      title: '默认', width: 80,
      render: (_: unknown, r: AIModel) =>
        r.isDefault ? <Tag color="gold">默认</Tag> : <Button size="small" type="link" onClick={() => handleSetDefault(r)}>设为默认</Button>,
    },
    {
      title: '操作', width: 200,
      render: (_: unknown, record: AIModel) => (
        <Space>
          <Button size="small" onClick={() => handleEdit(record)}>编辑</Button>
          <Button size="small" onClick={() => handleToggleEnabled(record)}>
            {record.enabled ? '禁用' : '启用'}
          </Button>
          <Popconfirm title="确定删除该模型？" onConfirm={() => handleDelete(record.id)}>
            <Button size="small" danger>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="bg-white rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">AI 模型管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>添加模型</Button>
      </div>
      <Table columns={columns} dataSource={models} rowKey="id" loading={loading} size="middle" />

      <div style={{ marginTop: 16, background: '#fafafa', borderRadius: 8, padding: 16 }}>
        <h4 style={{ marginBottom: 8, fontWeight: 600 }}>配置说明</h4>
        <Paragraph style={{ fontSize: 12, marginBottom: 0 }}>
          <Text strong>API 地址</Text>：所有第三方 API 的统一入口，默认 <Text code>https://aigc.x-see.cn</Text><br />
          <Text strong>API Key</Text>：创建/编辑时填入，保存后安全存储（界面仅显示是否已配置）<br />
          <Text strong>额外配置 (JSON)</Text>：可覆盖默认参数，如 <Text code>{'{"model":"gpt-image-2","size":"1024x1024"}'}</Text><br />
          <Text strong>设为默认</Text>：同类型的默认模型会出现在前台 AI 生成面板的默认选项中
        </Paragraph>
      </div>

      <Modal
        title={editingId ? '编辑模型' : '添加模型'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        width={560}
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="name" label="名称" rules={[{ required: true }]}>
            <Input placeholder="例如：Nanobanana2" />
          </Form.Item>
          <Form.Item name="provider" label="供应商" rules={[{ required: true }]}>
            <Select options={PROVIDER_OPTIONS} placeholder="选择供应商" />
          </Form.Item>
          <Form.Item name="type" label="类型" rules={[{ required: true }]}>
            <Select options={[
              { value: 'image', label: '图片 (image)' },
              { value: 'video', label: '视频 (video)' },
              { value: 'text', label: '文本 (text)' },
            ]} />
          </Form.Item>
          <Form.Item name="apiUrl" label="API 地址">
            <Input placeholder="https://aigc.x-see.cn" />
          </Form.Item>
          <Form.Item name="apiKey" label={editingId ? 'API Key (留空不修改)' : 'API Key'}>
            <Input.Password placeholder="sk-..." />
          </Form.Item>
          <Form.Item name="configJson" label="额外配置 (JSON)">
            <TextArea rows={3} placeholder='{"model": "gpt-image-2", "size": "1024x1024"}' />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ModelManagementPage;
