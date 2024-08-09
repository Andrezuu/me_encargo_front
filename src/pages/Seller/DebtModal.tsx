import { Modal, Form, Input } from 'antd';

const DebtModal = ({ visible, onOk, onCancel, seller }: any) => {
    const [form] = Form.useForm();

    const handleOk = () => {
        form.validateFields()
            .then(values => {
                onOk(values);
                form.resetFields();
            })
            .catch(info => {
                console.error('Validation failed:', info);
            });
    };

    return (
        <Modal
            title={`Agregar deuda a ${seller?.nombre}`}
            open={visible}
            onOk={handleOk}
            onCancel={() => {
                form.resetFields();
                onCancel();
            }}
        >
            <Form form={form} layout="vertical">
                <Form.Item
                    name="monto"
                    label="Monto"
                    rules={[{ required: true, message: 'Por favor ingrese el monto de la deuda' }]}
                >
                    <Input type="number" prefix="Bs." />
                </Form.Item>
                <Form.Item
                    name="descripcion"
                    label="Descripción"
                    rules={[{ required: true, message: 'Por favor ingrese una descripción de la deuda' }]}
                >
                    <Input.TextArea />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default DebtModal;
