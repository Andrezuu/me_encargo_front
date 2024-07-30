import { Modal, Form, Input, InputNumber, Button, Radio, Col, Row, DatePicker, TimePicker, Card, message } from 'antd';
import { UserOutlined, PhoneOutlined, CommentOutlined, HomeOutlined, PlusOutlined, MinusOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { registerShippingAPI } from '../../api/shipping';

function ShippingFormModal({ visible, onCancel, onSuccess, selectedProducts, totalAmount, handleSales }: any) {
    const [loading, setLoading] = useState(false);
    const [montoCobradoDelivery, setMontoCobradoDelivery] = useState<number>(0);
    const [costoRealizarDelivery, setCostoRealizarDelivery] = useState<number>(0);
    const [qrInput, setQrInput] = useState<number>(0);
    const [efectivoInput, setEfectivoInput] = useState<number>(0);
    const [adelantoClienteInput, setAdelantoClienteInput] = useState<number>(0);
    const [adelantoVisible, setAdelantoVisible] = useState(false);
    const [form] = Form.useForm();

    const handleFinish = async (shippingData: any) => {
        setLoading(true);

        const tipoPagoMap: any = {
            1: 'Transferencia o QR',
            2: 'Efectivo',
            3: 'Pagado al dueño'
        }

        const estadoPedidoMap: any = {
            1: 'En espera',
            2: 'Por entregar',
            3: 'Entregado'
        }

        const intTipoPago = parseInt(shippingData.tipo_de_pago)
        const intEstadoPedido = parseInt(shippingData.estado_pedido)

        const apiShippingData = {
            ...shippingData,
            "tipo_de_pago": tipoPagoMap[intTipoPago],
            "costo_delivery": parseInt(shippingData.costo_delivery),
            "cargo_delivery": parseInt(shippingData.cargo_delivery),
            "estado_pedido": estadoPedidoMap[intEstadoPedido],
            "id_trabajador": 1,
            //TODO: SUCURSAL PRADO POR DEFECTO, CAMBIAR CUANDO EXISTAN MAS SUCURSALES
            "id_sucursal": 3,
        }
        console.log(apiShippingData)
        const response = await registerShippingAPI(apiShippingData);
        console.log(response)
        if (response.status) {
            message.success('Entrega registrada con éxito');
            await handleSales(response.newShipping, selectedProducts)
            onSuccess();
        } else {
            message.error('Error al registrar el pedido');
        }
        setLoading(false);
    };

    const handleIncrement = (setter: React.Dispatch<React.SetStateAction<number>>, value: number) => {
        setter(prevValue => parseFloat((prevValue + value).toFixed(2)));
    };

    const handleDecrement = (setter: React.Dispatch<React.SetStateAction<number>>, value: number) => {
        setter(prevValue => parseFloat((prevValue - value).toFixed(2)));
    };

    useEffect(() => {
        form.setFieldsValue({
            montoTotal: totalAmount ? totalAmount.toFixed(2) : 0.00,
            saldoCobrar: ((totalAmount) >= 0 ? (totalAmount - qrInput - efectivoInput).toFixed(2) : 0.00),
        });
    }, [totalAmount, qrInput, efectivoInput, adelantoClienteInput]);


    return (
        <Modal
            title="Pagos Form"
            open={visible}
            onCancel={onCancel}
            footer={null}
            width={800}
        >
            <Form
                form={form}
                name="shippingForm"
                onFinish={handleFinish}
                layout="vertical"
            >
                <Card title="Información del Cliente" bordered={false}>
                    <Row gutter={16}>
                        <Col span={18}>
                            <Form.Item
                                name="cliente"
                                label="Nombre Cliente"
                                rules={[{ required: true, message: 'Este campo es obligatorio' }]}
                            >
                                <Input prefix={<UserOutlined />} />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={18}>
                            <Form.Item
                                name="telefono_cliente"
                                label="Celular"
                            >
                                <Input
                                    onKeyDown={(e) => {
                                        if (!/[0-9.]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Tab' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && e.key !== 'Delete' && e.key !== 'Enter') {
                                            e.preventDefault();
                                        }
                                    }}
                                    prefix={<PhoneOutlined />} />
                            </Form.Item>
                        </Col>
                    </Row>
                </Card>
                <Card title="Datos del Pedido" bordered={false} style={{ marginTop: 16 }}>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name='fecha_pedido'
                                label='Fecha de la Entrega'
                                rules={[{ required: true, message: 'Este campo es obligatorio' }]}
                            >
                                <DatePicker style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="hora_entrega_acordada"
                                label="Hora Entrega"
                            >
                                <TimePicker
                                    format='HH:mm'
                                    style={{ width: '100%' }}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item
                                name="lugar_entrega"
                                label="Lugar De Entrega"
                                rules={[{ required: true, message: 'Este campo es obligatorio' }]}
                            >
                                <Input prefix={<HomeOutlined />} />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item
                                name="observaciones"
                                label="Observaciones"
                            >
                                <Input prefix={<CommentOutlined />} />
                            </Form.Item>
                        </Col>
                    </Row>
                </Card>
                <Card title="Detalles del Pago" bordered={false} style={{ marginTop: 16 }}>
                    <Row gutter={16}>
                        <Col span={18}>
                            <Form.Item
                                name='tipo_de_pago'
                                label='Tipo de pago'
                                rules={[{ required: true, message: 'Este campo es obligatorio' }]}
                            >
                                <Radio.Group>
                                    <Radio.Button value='1'>Transferencia o QR</Radio.Button>
                                    <Radio.Button value='2'>Efectivo</Radio.Button>
                                    <Radio.Button value='3'>Pagado al dueño</Radio.Button>
                                </Radio.Group>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name='subtotal_qr'
                                label='Subtotal QR'
                            >
                                <InputNumber
                                    prefix='Bs.'
                                    onChange={((e: any) => setQrInput(e))}
                                    style={{ width: '100%' }}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name='subtotal_efectivo'
                                label='Subtotal Efectivo'
                            >
                                <InputNumber
                                    prefix='Bs'
                                    onChange={((e: any) => setEfectivoInput(e))}
                                    style={{ width: '100%' }}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={18}>
                            <Form.Item
                                name='estado_pedido'
                                label='Estado Pedido'
                                rules={[{ required: true, message: 'Este campo es obligatorio' }]}
                            >
                                <Radio.Group>
                                    <Radio.Button value='1'>En espera</Radio.Button>
                                    <Radio.Button value='2'>Por entregar</Radio.Button>
                                    <Radio.Button value='3'>Entregado</Radio.Button>
                                </Radio.Group>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={20}>
                            <Form.Item
                                name="costo_delivery"
                                label="Costo de realizar el Delivery"
                            >
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <InputNumber
                                        className="no-spin-buttons"
                                        prefix='Bs.'
                                        value={costoRealizarDelivery}
                                        onKeyDown={(e) => {
                                            if (!/[0-9.]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Tab' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && e.key !== 'Delete' && e.key !== 'Enter') {
                                                e.preventDefault();
                                            }
                                        }}
                                        min={0}
                                        precision={2}
                                        onChange={(value) => setCostoRealizarDelivery(value ?? 0)}
                                        style={{ flex: 1, marginRight: '8px', width: '80%' }}
                                    />
                                    <Button
                                        type="primary"
                                        icon={<PlusOutlined />}
                                        onClick={() => handleIncrement(setCostoRealizarDelivery, 0.01)}
                                        style={{ marginLeft: '8px' }}
                                    />
                                    <Button
                                        type="primary"
                                        icon={<MinusOutlined />}
                                        onClick={() => handleDecrement(setCostoRealizarDelivery, 0.01)}
                                        style={{ marginLeft: '8px' }}
                                    />
                                </div>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={20}>
                            <Form.Item
                                name="cargo_delivery"
                                label="Monto cobrado por el Delivery"
                            >
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <InputNumber
                                        className="no-spin-buttons"
                                        prefix='Bs.'
                                        value={montoCobradoDelivery}
                                        min={0}
                                        precision={2}
                                        onChange={(value) => setMontoCobradoDelivery(value ?? 0)}
                                        style={{ flex: 1, marginRight: '8px', width: '80%' }}
                                    />
                                    <Button
                                        type="primary"
                                        icon={<PlusOutlined />}
                                        onClick={() => handleIncrement(setMontoCobradoDelivery, 0.01)}
                                        style={{ marginLeft: '8px' }}
                                    />
                                    <Button
                                        type="primary"
                                        icon={<MinusOutlined />}
                                        onClick={() => handleDecrement(setMontoCobradoDelivery, 0.01)}
                                        style={{ marginLeft: '8px' }}
                                    />
                                </div>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={18}>
                            <Form.Item
                                name='show_adelanto'
                                label='¿Está ya pagado?'
                                rules={[{ required: true, message: 'Este campo es obligatorio' }]}
                            >
                                <Radio.Group
                                    onChange={(e) => setAdelantoVisible(e.target.value === '3')}
                                >
                                    <Radio.Button value='1'>Si</Radio.Button>
                                    <Radio.Button value='2'>No</Radio.Button>
                                    <Radio.Button value='3'>Pago Adelanto</Radio.Button>
                                </Radio.Group>
                            </Form.Item>
                        </Col>
                    </Row>
                    {adelantoVisible && (
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    name='adelanto_cliente'
                                    label='Adelanto Cliente'
                                >
                                    <InputNumber
                                        prefix='Bs.'
                                        onChange={((e: any) => setAdelantoClienteInput(e))}
                                        style={{ width: '100%' }}
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                    )}
                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item
                                name="montoTotal"
                                label="Monto Total"
                            >
                                <Input
                                    prefix='Bs.'
                                    value={totalAmount ?? 0}
                                    readOnly
                                    style={{ width: '100%' }}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item
                                name="saldoCobrar"
                                label="Saldo a Cobrar"
                            >
                                <Input
                                    prefix='Bs.'
                                    readOnly
                                    style={{ width: '100%' }}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                </Card>
                <Form.Item style={{ marginTop: 16 }}>
                    <Button type="primary" htmlType="submit" loading={loading}>
                        Guardar
                    </Button>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default ShippingFormModal;