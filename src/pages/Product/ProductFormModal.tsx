import { Select, Button, Form, Input, Modal, message } from "antd"
import { useEffect, useState } from "react"
import { addProductFeaturesAPI, addProductStockAPI, registerProductAPI } from "../../api/product"
import { getSellersAPI } from "../../api/seller"
import { getCategoriesAPI, registerCategoryAPI } from "../../api/category"
import { getFeaturesAPI } from "../../api/feature"
import FeatureInputs from "./FeatureInputs"

const ProductFormModal = ({ visible, onCancel, onSuccess }: any) => {
    const [loading, setLoading] = useState(false)
    const [sellers, setSellers] = useState([])
    const [categories, setCategories] = useState([])
    const [newCategory, setNewCategory] = useState('')
    const [newFeature, setNewFeature] = useState('')
    const [features, setFeatures] = useState<any[]>([])
    const [selectedFeatures, setSelectedFeatures] = useState([])
    const [featureValues, setFeatureValues] = useState({})
    const [combinations, setCombinations] = useState([])

    const branches = [{ id_sucursal: 3, nombre: 'Prado' }]

    const handleFinish = async (productData: any) => {
        setLoading(true);
        const realCombinations = combinations
            .filter((combination: any) => combination.price !== 0 || combination.stock !== 0)

        const productVariants = realCombinations.map((combination: any, index: number) => {
            const featureValues = selectedFeatures.map((featureId: any) => {
                const feature = features.find((f: any) => f.id_caracteristicas.toString() == featureId).feature
                return {
                    feature: feature,
                    value: combination[featureId.toString()]
                }
            })

            const joinedFeatureValues = featureValues.map(f => f.value).join(' ')

            return {
                "nombre_producto": `${productData.nombre_producto} ${joinedFeatureValues}`,
                "precio": combination.price,
                "imagen": '',
                "stock": combination.stock,
                "id_sucursal": productData.sucursal,
                "id_categoria": productData.id_categoria,
                "id_vendedor": productData.id_vendedor,
                "id_variant": index,
            }
        })

        const formattedProductData = {
            "group": productData.nombre_producto,
            "variants": productVariants
        }
        const res = await registerProductAPI(formattedProductData)

        if (res.products) {
            message.success('Producto registrado con variantes')

            const productFeaturesMap = new Map();

            realCombinations.forEach((combination: any) => {
                const featuresForProduct = selectedFeatures.map((featureId: any) => {
                    const feature = features.find((f: any) => f.id_caracteristicas.toString() == featureId);
                    return {
                        feature: feature?.feature,
                        value: combination[featureId.toString()]
                    };
                });
                const productId = res.products.find((p: any) => p.nombre_producto.includes(`${productData.nombre_producto} ${featuresForProduct.map(f => f.value).join(' ')}`)).id_producto;

                if (!productFeaturesMap.has(productId)) {
                    productFeaturesMap.set(productId, [])
                }

                productFeaturesMap.get(productId).push(...featuresForProduct)
            })

            await createProductStock(res.products, productVariants, productData.sucursal)
            await createProductFeatures(res.products, productFeaturesMap)
            onSuccess()
        } else {
            message.error('Error al crear los productos, inténtelo de nuevo')
        }
        setLoading(false);
    }

    const createProductFeatures = async (products: any, features: any) => {
        const promises = products.map((product: any) => {
            const id_producto = product.id_producto
            const productFeatures: any = features.get(id_producto)
            return addProductFeaturesAPI({
                productId: id_producto, features: productFeatures
            })
        });

        return await Promise.all(promises)
    }

    const createProductStock = async (products: any, stockProducts: any, shippingId: any) => {

        const productsWithStock: any = []
        stockProducts.forEach((stockProduct: any) => {
            const matchedProduct = products.find((prod: any) =>
                prod.nombre_producto == stockProduct.nombre_producto
            )
            if (matchedProduct) {
                const productToAdd = {
                    id_producto: matchedProduct.id_producto,
                    cantidad_por_sucursal: stockProduct.stock
                }
                productsWithStock.push(productToAdd)
            }
        })

        const data = { branch: shippingId, products: productsWithStock }
        return await addProductStockAPI(data)
    }

    const createCategory = async () => {
        if (!newCategory) return
        setLoading(true)
        const response = await registerCategoryAPI({ categoria: newCategory })
        setLoading(false)
        if (response.status) {
            message.success('Categoría creada con éxito')
            fetchCategories()
            setNewCategory('')
        } else {
            message.error('Error al crear categoría')
        }
    }

    const createFeature = () => {
        if (!newFeature) return;
        const newFeatureObj = { id_caracteristicas: Date.now(), feature: newFeature }; // Generar un id temporal
        setFeatures([...features, newFeatureObj]);
        setNewFeature('');
        message.success('Característica agregadatemporalmente');
    };



    const fetchSellers = async () => {
        try {
            const response = await getSellersAPI();
            setSellers(response);
        } catch (error) {
            message.error('Error al obtener los vendedores');
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await getCategoriesAPI();
            setCategories(response);
        } catch (error) {
            message.error('Error al obtener las categorías');
        }
    };

    const fetchFeatures = async () => {
        try {
            const res = await getFeaturesAPI();
            setFeatures(res);
        } catch (error) {
            message.error('Error al obtener las características');
        }
    };

    useEffect(() => {
        fetchSellers();
        fetchCategories();
        fetchFeatures();
    }, []);

    const uniqueFeatures = Array.from(new Set(features.map((feature: any) => feature.feature)));

    const filteredOptions = uniqueFeatures.map((label: any) => ({
        label: label,
        value: features.find((feature: any) => feature.feature === label).id_caracteristicas
    }));

    return (
        <Modal
            title="Agregar Producto"
            open={visible}
            onCancel={onCancel}
            footer={null}
            width={800}
        >
            <Form
                name="productForm"
                onFinish={handleFinish}
                layout="vertical"
            >
                <Form.Item
                    name="nombre_producto"
                    label="Nombre del Producto"
                    rules={[{ required: true, message: 'Por favor ingrese el nombre del producto' }]}
                >
                    <Input placeholder="Nombre del Producto" />
                </Form.Item>
                <Form.Item
                    name='sucursal'
                    label="Sucursal"
                    rules={[{ required: true, message: 'Por favor seleccione una sucursal' }]}
                >
                    <Select
                        placeholder='Selecciona una sucursal'
                        options={branches.map((branch: any) => ({
                            value: branch.id_sucursal,
                            label: branch.nombre
                        }))}
                        showSearch
                        filterOption={(input, option: any) =>
                            option.label.toLocaleLowerCase().includes(input.toLocaleLowerCase())}
                    />

                </Form.Item>
                <Form.Item
                    name="id_vendedor"
                    label="Marca"
                    rules={[{ required: true, message: 'Por favor seleccione una marca' }]}
                >
                    <Select
                        placeholder="Selecciona una marca"
                        options={sellers.map((seller: any) => ({
                            value: seller.id_vendedor,
                            label: seller.marca,
                        }))}
                        showSearch
                        filterOption={(input, option: any) =>
                            option.label.toLowerCase().includes(input.toLowerCase())
                        }
                    />
                </Form.Item>
                <Form.Item
                    name="id_categoria"
                    label="Categoría"
                    rules={[{ required: true, message: 'Por favor seleccione una categoría' }]}
                >
                    <Select
                        placeholder="Selecciona una categoría"
                        dropdownRender={menu => (
                            <>
                                {menu}
                                <div style={{ display: 'flex', padding: 8 }}>
                                    <Input
                                        style={{ flex: 'auto' }}
                                        value={newCategory}
                                        onChange={e => setNewCategory(e.target.value)}
                                    />
                                    <Button
                                        type="link"
                                        onClick={createCategory}
                                        loading={loading}
                                    >
                                        Añadir categoría
                                    </Button>
                                </div>
                            </>
                        )}
                        options={categories.map((category: any) => ({
                            value: category.id_categoria,
                            label: category.categoria,
                        }))}
                        showSearch
                        filterOption={(input, option: any) =>
                            option.label.toLowerCase().includes(input.toLowerCase())
                        }
                    />
                </Form.Item>
                <Form.Item
                    name='id_caracteristicas'
                    label='Características'
                >
                    <Select
                        placeholder='Selecciona una característica'
                        mode="multiple"
                        value={selectedFeatures}
                        onChange={setSelectedFeatures}
                        dropdownRender={menu => (
                            <>
                                {menu}
                                <div className="flex p-2">
                                    <Input
                                        className="flex-auto"
                                        value={newFeature}
                                        onChange={e => setNewFeature(e.target.value)}
                                    />
                                    <Button
                                        type="link"
                                        onClick={createFeature}
                                        loading={loading}
                                    >
                                        Añadir característica
                                    </Button>
                                </div>
                            </>
                        )}
                        options={filteredOptions}
                        showSearch
                        filterOption={(input, option: any) =>
                            option.label.toLowerCase().includes(input.toLocaleLowerCase())
                        }
                    />
                </Form.Item>

                <FeatureInputs
                    features={features}
                    selectedFeatures={selectedFeatures}
                    featureValues={featureValues}
                    setFeatureValues={setFeatureValues}
                    combinations={combinations}
                    setCombinations={setCombinations}
                />

                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading}>
                        Registrar Producto
                    </Button>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default ProductFormModal;
