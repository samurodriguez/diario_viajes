import "./style.css";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlusCircle } from "@fortawesome/free-solid-svg-icons";
import { useUserTokenContext } from "../../contexts/UserTokenContext";
import useUserProfile from "../../hooks/useUserProfile";
import Avatar from "../Avatar";
import { toast } from "react-toastify";

const Header = () => {
  const [token, setToken] = useUserTokenContext();
  const [user] = useUserProfile(token);
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);

  useEffect(() => {
    const handler = () => {
      setShowAvatarMenu(false);
    };

    if (showAvatarMenu) {
      window.addEventListener("click", handler);
    }

    return () => {
      window.removeEventListener("click", handler);
    };
  }, [showAvatarMenu]);

  return (
    <div className="app_header">
      <Link to="/create/entry" className="header_create_entry">
        <FontAwesomeIcon icon={faPlusCircle} />
      </Link>
      <Link to="/" className="header_title">
        Diario de viajes
      </Link>
      {!token ? (
        <Link className="header_link" to="/login">
          Login
        </Link>
      ) : (
        <>
          <div
            className="header_avatar"
            onClick={() => setShowAvatarMenu(!showAvatarMenu)}
          >
            <Avatar avatar={user.avatar} name={user.name} />
          </div>
          {showAvatarMenu && (
            <div className="header_avatar_menu">
              <Link to="/profile">Profile</Link>
              <div
                className="menu_logout"
                onClick={() => {
                  setToken("");
                  toast.success("Has cerrado sesión");
                }}
              >
                Log out
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Header;
