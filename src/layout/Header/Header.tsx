import { Button, Input, message } from "antd";
import "./Header.css";
import logoImg from "../../../public/logo.png";
import { logoutUserAPI } from "../../api/user";
import { useContext } from "react";
import { UserContext } from "../../context/userContext";
const { Search } = Input;

const Header = () => {
  const { setUser } = useContext(UserContext)!;
  const handleLogout = async () => {
    try {
      const res = await logoutUserAPI();
      if (!res?.success) {
        message.error("Error al cerrar sesión");
      }
      setUser(null);
      message.success("Sesión cerrada correctamente");
    } catch (error) {
      message.error("Error al cerrar sesión");
      console.error(error);
    }
  };

  return (
    <div className="flex justify-between items-center p-5 bg-blue h-16 border-light-gray">
      <div className="flex items-center">
        <img src={logoImg} alt="logo" className="w-10 h-auto" />
        <h1 className="ml-4 text-2xl text-light-blue font-bold">ME ENCARGO</h1>
      </div>

      <Search
        placeholder="Buscar"
        // onSearch={(value) => }
        className="flex-grow max-w-xl mx-5"
        style={{ width: 400 }}
      />

      <div className="flex items-center"></div>
      <Button
        onClick={handleLogout}
        type="text"
        className="bg-light-blue text-dark-blue"
      >
        Cerrar sesión
      </Button>
    </div>
  );
};

export default Header;
