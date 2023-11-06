import React, { useState, ChangeEvent, FormEvent } from 'react';
import styles from '@/styles/PostModal.module.css';
import { useContractContext } from '@/contexts/ContractContext';
import { useBiconomy } from '@/contexts/BiconomyContext';
import { IHybridPaymaster, SponsorUserOperationDto, PaymasterMode } from "@biconomy/paymaster"
import { DEFAULT_SESSION_KEY_MANAGER_MODULE, SessionKeyManagerModule  } from "@biconomy/modules";
import LoadingSpinner from './LoadingSpinner';
import { ethers } from 'ethers';

const PostModal = () => {
    const [showModal, setShowModal] = useState(false);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);

    const { blogContract, getBlogPosts } = useContractContext()
    const { smartAccount, smartAccountAddress } = useBiconomy()

    const handleTitleChange = (event: ChangeEvent<HTMLInputElement>) => {
        setTitle(event.target.value);
    };

    const handleContentChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
        setContent(event.target.value);
    };

    const handleCreatePost = async (event: FormEvent<HTMLFormElement>) => {
        console.log("handle create post")
        event.preventDefault()
        setLoading(true)
        setShowModal(false)
        const contractAddress = "0x5ec92976e3e26a987e2d788353f14e453c386cdb"
        
        try {
        console.log("in try")
        const moduleAddr = "0x6D3CBf2A5C558FDA8d01E7DCa4A0d87a5C94143e"

        const sessionKeyPrivKey = window.localStorage.getItem("sessionPKey");
        console.log("sessionKeyPrivKey", sessionKeyPrivKey);
        if (!sessionKeyPrivKey) {
        return;
        }
        const sessionSigner = new ethers.Wallet(sessionKeyPrivKey);
        console.log("sessionSigner", sessionSigner);

        // generate sessionModule
        const sessionModule = await SessionKeyManagerModule.create({
        moduleAddress: DEFAULT_SESSION_KEY_MANAGER_MODULE,
        smartAccountAddress: smartAccountAddress as string,
        });

        // set active module to sessionModule
        let moduleSmartAccount = smartAccount?.setActiveValidationModule(sessionModule);

        console.log("after module")
        const createTopic = await blogContract.populateTransaction.createTopicPost(title, content)
    
        const tx1 = {
          to: contractAddress,
          data: createTopic.data
        }
        console.log({ sessionSigner })
        let userOp = await smartAccount?.buildUserOp([tx1], {
            skipBundlerGasEstimation: false,
            params: {
            sessionSigner: sessionSigner,
            sessionValidationModule: moduleAddr,
        },
        })
        console.log({ userOp })
        const biconomyPaymaster = moduleSmartAccount?.paymaster as IHybridPaymaster<SponsorUserOperationDto>
    
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
          const userOpResponse = await moduleSmartAccount?.sendUserOp(userOp, {
            sessionSigner: sessionSigner,
            sessionValidationModule: moduleAddr,
        });
          console.log("userOpHash", userOpResponse);
          if(!userOpResponse) return
          const { receipt } = await userOpResponse.wait();
          console.log("txHash", receipt.transactionHash);
        
        console.log({ receipt })
        await getBlogPosts()
            setLoading(false)
            setContent("")
            setTitle("")
        } catch (error) {
            console.error(error)
            setLoading(false)
            setContent("")
            setTitle("")
        }
      }

    const toggleModal = () => {
        setShowModal(!showModal);
    };

    
    return (
        <>
            <button className={styles.button} onClick={toggleModal}>
                Create Post
            </button>
            { loading && <LoadingSpinner />}
            {showModal && (
                <div className={styles.modal}>
                    <div className={styles.modalContent}>
                        <span className={styles.close} onClick={toggleModal}>&times;</span>
                        <h2>Create a New Post</h2>
                        <form onSubmit={handleCreatePost}>
                            <div>
                                <label>Title:</label>
                                <input onChange={handleTitleChange} value={title} type="text" name="title" required className={styles.textInput} />
                            </div>
                            <div>
                                <label>Content:</label>
                                <textarea onChange={handleContentChange} value={content} name="content" rows={4} required className={styles.textArea}></textarea>
                            </div>
                            <button type="submit" className={styles.submitButton}>Submit</button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default PostModal;
