import "./style.css";
import { useUserTokenContext } from "../../contexts/UserTokenContext";
import useUserProfile from "../../hooks/useUserProfile";
import UserProfile from "../../components/UserProfile";
import { Redirect } from "react-router";

const ProfilePage = () => {
  const [token] = useUserTokenContext();
  const [user] = useUserProfile(token);

  if (!token) {
    return <Redirect to="/login" />;
  }

  return (
    <div className="profile_page page">
      <h2 className="profile_title">Profile</h2>
      {Object.values(user).length > 0 && (
        <UserProfile
          id={user.id}
          name={user.name}
          avatar={user.avatar}
          email={user.email}
        />
      )}
    </div>
  );
};

export default ProfilePage;
