import React, { useState, useEffect } from 'react';
import { Button, Modal, Form, Input, Select, Tag, Popconfirm, message, Tabs, Badge, Tooltip, Empty } from 'antd';
import {
  PlusOutlined, PictureOutlined, VideoCameraOutlined, FileTextOutlined,
  ApiOutlined, KeyOutlined, StarOutlined, StarFilled, DeleteOutlined, EditOutlined,
} from '@ant-design/icons';
import { api } from '../../lib/api';

const { TextArea } = Input;

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
  { label: '图片生成', options: [
    { value: 'nanobanana', label: 'Nanobanana Pro' },
    { value: 'jimeng', label: '即梦 4.0' },
    { value: 'gemini-image', label: 'Nanobanana2 / Gemini Image' },
    { value: 'gpt-image', label: 'GPT Image 2' },
    { value: 'grok-image', label: 'Grok Image' },
  ]},
  { label: '视频生成', options: [
    { value: 'seedance', label: 'Seedance 2.0' },
    { value: 'sora', label: 'Sora 2' },
    { value: 'grok-video', label: 'Grok Video' },
  ]},
  { label: '文本分析', options: [
    { value: 'gemini-text', label: 'Gemini 2.0 Flash' },
    { value: 'openai', label: 'OpenAI (GPT-4o)' },
    { value: 'deepseek', label: 'DeepSeek V3' },
  ]},
];

const TYPE_CONFIG: Record<string, { icon: React.ReactNode; color: string; bg: string; label: string }> = {
  image: { icon: <PictureOutlined />, color: '#ec4899', bg: '#fdf2f8', label: '图片' },
  video: { icon: <VideoCameraOutlined />, color: '#3b82f6', bg: '#eff6ff', label: '视频' },
  text: { icon: <FileTextOutlined />, color: '#10b981', bg: '#ecfdf5', label: '文本' },
};

const ModelManagementPage: React.FC = () => {
  const [models, setModels] = useState<AIModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [form] = Form.useForm();

  const loadModels = async () => {
    setLoading(true);
    try {
      const res = await api.get('/models');
      if (res.data.success) setModels(res.data.data);
    } catch { message.error('加载失败'); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadModels(); }, []);

  const filtered = activeTab === 'all' ? models : models.filter((m) => m.type === activeTab);

  const handleCreate = (type?: string) => {
    setEditingId(null);
    form.resetFields();
    form.setFieldsValue({ type: type || 'image', apiUrl: 'https://aigc.x-see.cn' });
    setModalOpen(true);
  };

  const handleEdit = (m: AIModel) => {
    setEditingId(m.id);
    form.setFieldsValue({ name: m.name, type: m.type, provider: m.provider, apiUrl: m.apiUrl || '', configJson: m.configJson || '' });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload: Record<string, unknown> = { name: values.name, type: values.type, provider: values.provider, apiUrl: values.apiUrl };
      if (values.apiKey) payload.apiKey = values.apiKey;
      if (values.configJson) payload.configJson = values.configJson;
      if (editingId) await api.patch(`/admin/models/${editingId}`, payload);
      else await api.post('/admin/models', payload);
      message.success(editingId ? '已更新' : '已创建');
      setModalOpen(false);
      loadModels();
    } catch (err: any) {
      if (err.response) message.error(err.response.data?.error?.message || '操作失败');
    }
  };

  const handleToggleEnabled = async (m: AIModel) => {
    await api.patch(`/admin/models/${m.id}`, { enabled: !m.enabled });
    loadModels();
  };

  const handleSetDefault = async (m: AIModel) => {
    await api.patch(`/admin/models/${m.id}/default`);
    loadModels();
  };

  const handleDelete = async (id: number) => {
    await api.delete(`/admin/models/${id}`);
    loadModels();
  };

  const tabItems = [
    { key: 'all', label: `全部 (${models.length})` },
    { key: 'image', label: <span><PictureOutlined /> 图片 ({models.filter(m => m.type === 'image').length})</span> },
    { key: 'video', label: <span><VideoCameraOutlined /> 视频 ({models.filter(m => m.type === 'video').length})</span> },
    { key: 'text', label: <span><FileTextOutlined /> 文本 ({models.filter(m => m.type === 'text').length})</span> },
  ];

  return (
    <div style={{ maxWidth: 1100 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>AI 模型管理</h2>
          <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: 13 }}>配置第三方 AI 模型的 API 地址和密钥，按类型分类管理</p>
        </div>
        <Button type="primary" icon={<PlusOutlined />} size="large" onClick={() => handleCreate()}>添加模型</Button>
      </div>

      {/* Tabs */}
      <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems}
        tabBarExtraContent={
          <div style={{ display: 'flex', gap: 8 }}>
            <Button size="small" onClick={() => handleCreate('image')} icon={<PictureOutlined />}>图片</Button>
            <Button size="small" onClick={() => handleCreate('video')} icon={<VideoCameraOutlined />}>视频</Button>
            <Button size="small" onClick={() => handleCreate('text')} icon={<FileTextOutlined />}>文本</Button>
          </div>
        }
      />

      {/* Card Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8' }}>加载中...</div>
      ) : filtered.length === 0 ? (
        <Empty description={`暂无${activeTab === 'all' ? '' : TYPE_CONFIG[activeTab]?.label || ''}模型`} style={{ padding: 40 }}>
          <Button type="primary" onClick={() => handleCreate(activeTab !== 'all' ? activeTab : undefined)}>添加模型</Button>
        </Empty>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
          {filtered.map((m) => {
            const cfg = TYPE_CONFIG[m.type] || TYPE_CONFIG.image;
            return (
              <div key={m.id}
                style={{
                  background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0',
                  overflow: 'hidden', transition: 'box-shadow 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.08)')}
                onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}
              >
                {/* Top accent bar */}
                <div style={{ height: 3, background: cfg.color }} />

                <div style={{ padding: '16px 20px' }}>
                  {/* Row 1: icon + name + badges */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 10, background: cfg.bg,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 20, color: cfg.color,
                    }}>
                      {cfg.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {m.name}
                      </div>
                      <div style={{ fontSize: 11, color: '#94a3b8' }}>{m.provider}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                      {m.isDefault && <Tag color="gold" style={{ margin: 0 }}>默认</Tag>}
                      <Tag color={m.enabled ? 'green' : 'default'} style={{ margin: 0 }}>{m.enabled ? '启用' : '禁用'}</Tag>
                    </div>
                  </div>

                  {/* Row 2: info tags */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                    <Tag color={cfg.color === '#ec4899' ? 'pink' : cfg.color === '#3b82f6' ? 'blue' : 'green'} style={{ margin: 0, fontSize: 11 }}>
                      {cfg.icon} {cfg.label}
                    </Tag>
                    <Tooltip title={m.apiUrl || '未设置'}>
                      <Tag icon={<ApiOutlined />} style={{ margin: 0, fontSize: 11, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {m.apiUrl ? new URL(m.apiUrl).hostname : '未配置'}
                      </Tag>
                    </Tooltip>
                    <Tag icon={<KeyOutlined />} color={m.hasApiKey ? 'green' : 'red'} style={{ margin: 0, fontSize: 11 }}>
                      {m.hasApiKey ? '密钥已配置' : '密钥未配置'}
                    </Tag>
                  </div>

                  {/* Row 3: actions */}
                  <div style={{ display: 'flex', gap: 8, paddingTop: 12, borderTop: '1px solid #f1f5f9' }}>
                    <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit(m)}>编辑</Button>
                    <Button size="small" onClick={() => handleToggleEnabled(m)}>
                      {m.enabled ? '禁用' : '启用'}
                    </Button>
                    {!m.isDefault && (
                      <Button size="small" icon={<StarOutlined />} onClick={() => handleSetDefault(m)}>设为默认</Button>
                    )}
                    {m.isDefault && (
                      <Tag color="gold" style={{ lineHeight: '22px' }}><StarFilled /> 默认</Tag>
                    )}
                    <div style={{ flex: 1 }} />
                    <Popconfirm title="确定删除？" onConfirm={() => handleDelete(m.id)}>
                      <Button size="small" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Help footer */}
      <div style={{ marginTop: 20, padding: 16, background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12, color: '#64748b', lineHeight: 1.8 }}>
        <strong style={{ color: '#334155' }}>配置说明</strong><br />
        <span style={{ color: '#6366f1' }}>API 地址</span>：所有第三方接口的统一入口，默认 <code style={{ background: '#e2e8f0', padding: '1px 4px', borderRadius: 3 }}>https://aigc.x-see.cn</code><br />
        <span style={{ color: '#6366f1' }}>API Key</span>：创建或编辑时填入，保存后安全加密存储，界面仅显示是否已配置<br />
        <span style={{ color: '#6366f1' }}>额外配置</span>：JSON 格式覆盖默认参数，如 <code style={{ background: '#e2e8f0', padding: '1px 4px', borderRadius: 3 }}>{'{"model":"gpt-image-2","size":"1024x1024"}'}</code><br />
        <span style={{ color: '#6366f1' }}>设为默认</span>：同类型中默认模型会出现在前台 AI 生成面板的默认选项中
      </div>

      {/* Edit Modal */}
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
            <Input placeholder="例如：GPT Image 2" />
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
          <Form.Item name="apiKey" label={editingId ? 'API Key (留空不修改)' : 'API Key'}
            tooltip="密钥加密存储，不会明文展示">
            <Input.Password placeholder="sk-..." />
          </Form.Item>
          <Form.Item name="configJson" label="额外配置 (JSON)"
            tooltip="可覆盖模型默认参数，如 model、size、aspectRatio 等">
            <TextArea rows={3} placeholder='{"model": "gpt-image-2", "size": "1024x1024"}' />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ModelManagementPage;
