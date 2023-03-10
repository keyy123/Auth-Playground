import Layout from "./Layout";

const Home = ({user, setUser}) => {
  return (
    <div>
        <Layout user={user} setUser={setUser}>
            <p>Welcome to project scrubz {user && user.account ? user?.account?.name : "Guest"}</p>
        </Layout>
        </div>
        )
  }

export default Home;