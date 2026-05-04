import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Tag, Space, Popconfirm, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { api } from '../../lib/api';

interface Template {
  id: number;
  name: string;
  description: string;
  breakdownPrompt: string;
  imagePrompt: string;
  videoPrompt: string;
  createdAt: string;
}

const { TextArea } = Input;

const TemplateManagementPage: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form] = Form.useForm();

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const res = await api.get('/templates');
      if (res.data.success) setTemplates(res.data.data);
    } catch { message.error('加载模板列表失败'); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadTemplates(); }, []);

  const handleCreate = () => {
    setEditingId(null);
    form.resetFields();
    setModalOpen(true);
  };

  const handleEdit = (t: Template) => {
    setEditingId(t.id);
    form.setFieldsValue(t);
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingId) {
        await api.patch(`/templates/${editingId}`, values);
        message.success('模板已更新');
      } else {
        await api.post('/templates', values);
        message.success('模板已创建');
      }
      setModalOpen(false);
      loadTemplates();
    } catch (err: any) {
      if (err.response) message.error(err.response.data?.error?.message || '操作失败');
    }
  };

  const handleDelete = async (id: number) => {
    await api.delete(`/templates/${id}`);
    message.success('模板已删除');
    loadTemplates();
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 60 },
    { title: '名称', dataIndex: 'name', ellipsis: true },
    {
      title: '描述', dataIndex: 'description', ellipsis: true,
      render: (v: string) => v || '-',
    },
    {
      title: '分镜提示词', dataIndex: 'breakdownPrompt', width: 100,
      render: (v: string) => <Tag color={v ? 'blue' : 'default'}>{v ? '已配置' : '未配置'}</Tag>,
    },
    {
      title: '图片提示词', dataIndex: 'imagePrompt', width: 100,
      render: (v: string) => <Tag color={v ? 'purple' : 'default'}>{v ? '已配置' : '未配置'}</Tag>,
    },
    {
      title: '视频提示词', dataIndex: 'videoPrompt', width: 100,
      render: (v: string) => <Tag color={v ? 'green' : 'default'}>{v ? '已配置' : '未配置'}</Tag>,
    },
    {
      title: '操作', width: 160,
      render: (_: unknown, record: Template) => (
        <Space>
          <Button size="small" onClick={() => handleEdit(record)}>编辑</Button>
          <Popconfirm title="确定删除该模板？" onConfirm={() => handleDelete(record.id)}>
            <Button size="small" danger>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="bg-white rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">风格模板管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>新建模板</Button>
      </div>
      <Table columns={columns} dataSource={templates} rowKey="id" loading={loading} size="middle" />

      <Modal
        title={editingId ? '编辑模板' : '新建模板'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        width={640}
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="name" label="名称" rules={[{ required: true, message: '请输入模板名称' }]}>
            <Input placeholder="例如：都市现代风、古装仙侠风" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input placeholder="简短描述此模板的风格特点" />
          </Form.Item>
          <Form.Item name="breakdownPrompt" label="分镜拆解提示词"
            tooltip="AI 拆解剧本时使用的系统提示词">
            <TextArea rows={3} placeholder="你是一位专业的动漫分镜师..." />
          </Form.Item>
          <Form.Item name="imagePrompt" label="图片生成提示词"
            tooltip="生成图片时自动添加的前缀（风格、画质等）">
            <TextArea rows={2} placeholder="anime style, high quality, detailed" />
          </Form.Item>
          <Form.Item name="videoPrompt" label="视频生成提示词"
            tooltip="生成视频时自动添加的前缀（运镜、风格等）">
            <TextArea rows={2} placeholder="cinematic camera movement, smooth animation" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TemplateManagementPage;
