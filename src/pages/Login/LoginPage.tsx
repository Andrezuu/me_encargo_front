import { useContext } from "react";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Form, Input, message } from "antd";
import { checkLogin, getUserByCookie } from "../../api/user";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../context/userContext";

const LoginPage = () => {
  const { setUser } = useContext(UserContext)!;
  const navigate = useNavigate();

  const handleFinish = async (values: any) => {
    try {
      await checkLogin(values);
      const user = await getUserByCookie();
      setUser(user);
      message.success("¡Inicio de sesión exitoso!");
      navigate("/product");
    } catch (error) {
      message.error("Error al iniciar sesión");
      console.error(error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <img
            alt="logo"
            src="/src/assets/logo.png"
            className="mx-auto h-12 w-auto"
          />
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Me encargo</h2>
        </div>
        <Form
          name="login"
          initialValues={{ autoLogin: true }}
          onFinish={handleFinish}
          className="mt-8 space-y-6"
        >
          <Form.Item
            name="email"
            rules={[
              {
                required: true,
                message: "¡Por favor ingrese su email!",
              },
            ]}
          >
            <Input
              size="large"
              prefix={<UserOutlined className="site-form-item-icon" />}
              placeholder="Correo electrónico"
            />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[
              {
                required: true,
                message: "¡Por favor ingrese su contraseña!",
              },
            ]}
          >
            <Input.Password
              size="large"
              prefix={<LockOutlined className="site-form-item-icon" />}
              placeholder="Contraseña"
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" size="large" block>
              Iniciar sesión
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default LoginPage;
