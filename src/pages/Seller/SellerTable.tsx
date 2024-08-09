import { Button, Table } from 'antd';
import { useEffect, useState } from 'react';
import { getSellersAPI } from '../../api/seller';
import DebtModal from './DebtModal';
import { DollarOutlined } from '@ant-design/icons';

const SellerTable = (refreshKey: any) => {
    const [pendingPaymentData, setPendingPaymentData] = useState([]);
    const [onTimePaymentData, setOnTimePaymentData] = useState([]);
    const [selectedSeller, setSelectedSeller] = useState()
    const [isModalVisible, setIsModalVisible] = useState(false)

    const getRandomInt = (min: number, max: number) => {
        return Math.floor(Math.random() * (max - min + 1) + min)
    }


    async function fetchSellers() {
        try {
            const response = await getSellersAPI();

            const sellersData = response.data || response;

            // Verifica si sellersData es un array
            if (!Array.isArray(sellersData)) {
                console.error('Los datos de vendedores no son un array:', sellersData);
                return;
            }

            // Aquí ajusta cómo mapeas los datos según la estructura de tu respuesta de la API
            const formattedData = sellersData.map((seller: any) => {
                const finish_date = new Date(seller.fecha_vigencia)
                return {
                    key: seller.id_vendedor.toString(),
                    nombre: `${seller.nombre} ${seller.apellido}`,
                    pago_total: `Bs. ${getRandomInt(0, 8)}`,
                    fecha_vigencia: finish_date.toLocaleDateString('es-ES'),
                    pago_mensual: `Bs. ${seller.alquiler + seller.exhibicion + seller.delivery}`,
                    comision_porcentual: `${seller.comision_porcentual}%`,
                    comision_fija: `Bs. ${seller.comision_fija}`,
                };
            })

            // Separar los datos según algún criterio (en este caso, si el pago es pendiente o al día)
            const pendingPayments: any = formattedData.filter((seller: any) => seller.pago_total !== 'Bs. 0');
            const onTimePayments: any = formattedData.filter((seller: any) => seller.pago_total === 'Bs. 0');

            setPendingPaymentData(pendingPayments);
            setOnTimePaymentData(onTimePayments);
        } catch (error) {
            console.error('Error al obtener los vendedores:', error);
        }
    }

    const showModal = (seller: any) => {
        setSelectedSeller(seller)
        setIsModalVisible(true)
    }

    const handleOk = (values: any) => {
        setIsModalVisible(false)
    }

    const handleCancel = () => {
        setIsModalVisible(false)
    }


    useEffect(() => {
        fetchSellers();
    }, [refreshKey]);

    const columns = [
        {
            key: 'seller_new_debt',
            render: (_: any, seller: any) => (
                <Button type='default' onClick={() => showModal(seller)} icon={<DollarOutlined />} />
            )
        },
        {
            title: 'Nombre',
            dataIndex: 'nombre',
            key: 'nombre',
        },
        {
            title: 'Pago Total',
            dataIndex: 'pago_total',
            key: 'pago_total',
        },
        {
            title: 'Fecha Vigencia',
            dataIndex: 'fecha_vigencia',
            key: 'fecha_vigencia',
        },
        {
            title: 'Pago Mensual',
            dataIndex: 'pago_mensual',
            key: 'pago_mensual',
        },
        {
            title: 'Comisión Porcentual',
            dataIndex: 'comision_porcentual',
            key: 'comision_porcentual',
        },
        {
            title: 'Comisión Fija',
            dataIndex: 'comision_fija',
            key: 'comision_fija',
        },
    ];

    return (
        <div>
            <Table
                columns={columns}
                dataSource={pendingPaymentData}
                title={() => <h2 className='text-2xl font-bold'>Pago pendiente</h2>}
                pagination={false}
            />
            <Table
                columns={columns}
                dataSource={onTimePaymentData}
                title={() => <h2 className='text-2xl font-bold'>Pago al día</h2>}
                pagination={false}
            />
            <DebtModal
                visible={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
                seller={selectedSeller} />
        </div>
    );
};

export default SellerTable;
