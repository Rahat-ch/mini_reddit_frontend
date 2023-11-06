import Posts from "@/components/Posts";
import { useBiconomy } from "@/contexts/BiconomyContext";
import { usePrivy } from "@privy-io/react-auth";
import styles from "@/styles/Home.module.css"


export default function Home() {
  const { ready, authenticated, login, logout } = usePrivy();
  const { smartAccountAddress } = useBiconomy()

  return (
    <>
    {!authenticated && <div className={styles.loginContainer}>
      <h1 className={styles.title}>Log in to Micro Blog</h1>
      <button className={styles.loginButton} onClick={login}>
                Login
      </button>
      </div>}
    {ready && authenticated && <button className={styles.logoutButton} onClick={logout}>Logout</button>}
     {smartAccountAddress && ready && authenticated && <Posts />}
    </>
  )
}
