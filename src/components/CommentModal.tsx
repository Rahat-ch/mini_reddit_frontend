import React, { useState, ChangeEvent, FormEvent } from 'react';
import styles from '@/styles/PostModal.module.css';
import { useContractContext } from '@/contexts/ContractContext';
import { useBiconomy } from '@/contexts/BiconomyContext';
import { IHybridPaymaster, SponsorUserOperationDto, PaymasterMode } from "@biconomy/paymaster"
import LoadingSpinner from './LoadingSpinner';

type props = {
  postIndex: number;
}

const CommentModal = ({ postIndex }: props) => {
    const [showModal, setShowModal] = useState(false);
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);

    const { blogContract, getPostComments } = useContractContext()
    const { smartAccount } = useBiconomy()


    const handleContentChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
        setContent(event.target.value);
    };

    const handleCreateComment = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setLoading(true)
        setShowModal(false)
        const contractAddress = "0x5ec92976e3e26a987e2d788353f14e453c386cdb"
        
        try {
            const createComment = await blogContract.populateTransaction.addComment(postIndex, content)
    
        const tx1 = {
          to: contractAddress,
          data: createComment.data
        }

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
        
        await getPostComments(postIndex)
            setLoading(false)
            setContent("")
        } catch (error) {
            console.error(error)
            setLoading(false)
            setContent("")
        }
      }

    const toggleModal = () => {
        setShowModal(!showModal);
    };

    
    return (
        <>
            <button className={styles.button} onClick={toggleModal}>
                Add Comment
            </button>
            { loading && <LoadingSpinner />}
            {showModal && (
                <div className={styles.modal}>
                    <div className={styles.modalContent}>
                        <span className={styles.close} onClick={toggleModal}>&times;</span>
                        <h2>Add Comment</h2>
                        <form onSubmit={handleCreateComment}>
                            <div>
                                <label>Comment:</label>
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

export default CommentModal;
