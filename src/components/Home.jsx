import Layout from "./Layout";
import { addWebAuthn } from "../services/API";
const Home = ({user, setUser}) => {
  return (
    <div>
        <Layout user={user} setUser={setUser}>
            <p>Welcome to project scrubz {user && user.account ? user?.account?.name : "Guest"}</p>

            <button onClick={() =>{ 
              console.log(user)
              addWebAuthn(user)}
              }>Add Authenticator / Passkey</button>
        </Layout>
        </div>
        )
  }

export default Home;