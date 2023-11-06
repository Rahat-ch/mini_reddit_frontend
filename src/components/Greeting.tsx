import { useBiconomy } from "@/contexts/BiconomyContext"
import { useContractContext } from "@/contexts/ContractContext"
import { useEffect, useState } from "react"
import { IHybridPaymaster, SponsorUserOperationDto, PaymasterMode } from "@biconomy/paymaster"
import { SessionKeyManagerModule, DEFAULT_SESSION_KEY_MANAGER_MODULE  } from "@biconomy/modules";
import { defaultAbiCoder } from "ethers/lib/utils";
import { generateRandomUsername } from "@/utils/helpers"
import { usePrivy } from "@privy-io/react-auth"
import { ethers } from "ethers";
import styles from "@/styles/Home.module.css";


const Greeting = () => {
  const [ loading, setLoading ] = useState<boolean>(false)
  const [ username, setUserName ] = useState<string>("")
  const [isSessionKeyModuleEnabled, setIsSessionKeyModuleEnabled] = useState<boolean>(false);
  const { smartAccountAddress, smartAccount } = useBiconomy()
  const { blogContract } = useContractContext()
  const { ready, authenticated } = usePrivy()

  const handleCreateAccount = async () => {

    const contractAddress = "0x5ec92976e3e26a987e2d788353f14e453c386cdb"
    const newUser = generateRandomUsername()
    const registration = await blogContract.populateTransaction.registerUser(newUser)

    const tx1 = {
      to: contractAddress,
      data: registration.data
    }
    console.log({ registration })
    let userOp = await smartAccount?.buildUserOp([tx1])
    console.log({ userOp })
    const biconomyPaymaster = smartAccount?.paymaster as IHybridPaymaster<SponsorUserOperationDto>

    let paymasterServiceData: SponsorUserOperationDto = {
      mode: PaymasterMode.SPONSORED,
      smartAccountInfo: {
        name:"BICONOMY",
        version: '2.0.0',
      },
    }

    if(!userOp) return
    const paymasterAndDataResponse = await biconomyPaymaster.getPaymasterAndData(userOp, paymasterServiceData)

    userOp.paymasterAndData = paymasterAndDataResponse.paymasterAndData;
      const userOpResponse = await smartAccount?.sendUserOp(userOp);
      console.log("userOpHash", userOpResponse);
      if(!userOpResponse) return
      const { receipt } = await userOpResponse.wait();
      console.log("txHash", receipt.transactionHash);
    
    const user = await blogContract.users(smartAccountAddress)
    setUserName(user[0])
    setLoading(false)
  }

  useEffect(() => {
    if(!authenticated || !smartAccountAddress) return
    const getOrCreateUser = async () => {
    setLoading(true)
    const user = await blogContract.users(smartAccountAddress)
    if(!user[0]){
      handleCreateAccount()
    } else {
      setUserName(user[0])
      setLoading(false)
    }
    }
    getOrCreateUser()
  },[smartAccountAddress, authenticated])

  useEffect(() => {
    let checkSessionModuleEnabled = async () => {
      if( !smartAccount) {
        setIsSessionKeyModuleEnabled(false);
        return
      }
      try {
        const isEnabled = await smartAccount.isModuleEnabled(DEFAULT_SESSION_KEY_MANAGER_MODULE)
        console.log("isSessionKeyModuleEnabled", isEnabled);
        setIsSessionKeyModuleEnabled(isEnabled);
        return;
      } catch(err: any) {
        console.error(err)
        setIsSessionKeyModuleEnabled(false);
        return;
      }
    }
    checkSessionModuleEnabled()
  },[isSessionKeyModuleEnabled, smartAccount])

  const createSession = async (enableSessionKeyModule: boolean) => {
    if(!smartAccount) return
    console.log("creating session")
    try {
      const moduleAddr = "0x6D3CBf2A5C558FDA8d01E7DCa4A0d87a5C94143e"
      // -----> setMerkle tree tx flow
      // create dapp side session key
      const sessionSigner = ethers.Wallet.createRandom();
      const sessionKeyEOA = await sessionSigner.getAddress();
      console.log("sessionKeyEOA", sessionKeyEOA);
      // BREWARE JUST FOR DEMO: update local storage with session key
      window.localStorage.setItem("sessionPKey", sessionSigner.privateKey);

      // generate sessionModule
      const sessionModule = await SessionKeyManagerModule.create({
        moduleAddress: DEFAULT_SESSION_KEY_MANAGER_MODULE,
        smartAccountAddress: smartAccountAddress as string,
      });

      // create session key data
      const sessionKeyData = defaultAbiCoder.encode(
        ["address", "address"],
        [
          sessionKeyEOA,
          "0x5ec92976e3e26a987e2d788353f14e453c386cdb", // blog contract address
        ]
      );

      const sessionTxData = await sessionModule.createSessionData([
        {
          validUntil: 0,
          validAfter: 0,
          sessionValidationModule: moduleAddr,
          sessionPublicKey: sessionKeyEOA,
          sessionKeyData: sessionKeyData,
        },
      ]);
      console.log("sessionTxData", sessionTxData);

      // tx to set session key
      const setSessiontrx = {
        to: DEFAULT_SESSION_KEY_MANAGER_MODULE, // session manager module address
        data: sessionTxData.data,
      };

      const transactionArray = [];

      if (enableSessionKeyModule) {
        // -----> enableModule session manager module
        const enableModuleTrx = await smartAccount.getEnableModuleData(
          DEFAULT_SESSION_KEY_MANAGER_MODULE
        );
        transactionArray.push(enableModuleTrx);
      }

      transactionArray.push(setSessiontrx)

      let userOp = await smartAccount.buildUserOp(transactionArray);


      const biconomyPaymaster = smartAccount?.paymaster as IHybridPaymaster<SponsorUserOperationDto>
  
      let paymasterServiceData: SponsorUserOperationDto = {
        mode: PaymasterMode.SPONSORED,
        smartAccountInfo: {
          name:"BICONOMY",
          version: '2.0.0',
        },
      }
  
      if(!userOp) return
      const paymasterAndDataResponse = await biconomyPaymaster.getPaymasterAndData(userOp, paymasterServiceData)
  
      userOp.paymasterAndData = paymasterAndDataResponse.paymasterAndData;
      const userOpResponse = await smartAccount.sendUserOp(
        userOp
      );
      console.log(`userOp Hash: ${userOpResponse.userOpHash}`);
      const transactionDetails = await userOpResponse.wait();
      console.log("txHash", transactionDetails.receipt.transactionHash);

    } catch(err: any) {
      console.error(err)
    }
  }

  return(
    <>
      {loading && <h1 className={styles.greeting}>Loading Account...</h1>}
      {authenticated && username && <h3 className={styles.greeting}>Hello {username}</h3>}
      {isSessionKeyModuleEnabled ? (
        <button onClick={() => createSession(false)}>Create Session</button>
      ): (
        <button onClick={() => createSession(true)}>Start and Create Session</button>
      )}
    </>
  )
}

export default Greeting