import React, { createContext, useContext, useState, PropsWithChildren } from 'react';
import {ethers} from "ethers";
import abi from "@/utils/abi.json"

type Post = {
  username: string;
  title: string;
  content: string;
  postIndex: number;
};

type Comment = {
  userComment: string;
  username: string;
}


type ContractContextType = {
  // todo add type for contract
  blogContract: any;
  getBlogPosts: () => Promise<void>;
  getPostByIndex: (_postIndex: number) => Promise<void>;
  getPostComments: (_postIndex: number) => Promise<void>;
  allPosts: Post[];
  post: Post | null,
  comments: Comment[]
};

const initialState: ContractContextType = {
  blogContract: {},
  getBlogPosts: async () => {},
  getPostByIndex: async (_postIndex: number) => {},
  getPostComments: async (_posIndex: number) => {},
  allPosts: [],
  post: null,
  comments: []
};

const ContractContext = createContext<ContractContextType>(initialState);

export const ContractProvider = ({ children }: PropsWithChildren<{}>) => {

  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [post, setPost] = useState<Post | null >(null)
  const [comments, setComments] = useState<Comment[]>([])

  const contractAddress = "0x5ec92976e3e26a987e2d788353f14e453c386cdb"
  const provider = new ethers.providers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);

  const blogContract = new ethers.Contract(
    contractAddress,
    abi,
    provider
  );

  const getBlogPosts = async () => {
    const count = await blogContract.getTopicPostsCount()
    const allPosts = [];

    for (let index = 0; index < count.toNumber(); index++) {
      const currentPost = await blogContract.getTopicPost(index)
      const user = await blogContract.users(currentPost[0])
      const formattedPostData = {
        username: user[0],
        title: currentPost[1],
        content: currentPost[2],
        postIndex: index
      };

      allPosts.unshift(formattedPostData)
    }

    setAllPosts(allPosts)
  }

  const getPostByIndex = async (_postIndex:number) => {
    const post = await blogContract.getTopicPost(_postIndex)
    const user = await blogContract.users(post[0])

    const formattedPostData = {
      username: user[0],
      title: post[1],
      content: post[2],
      postIndex: _postIndex
    };

    setPost(formattedPostData)
  }

  const getPostComments = async (_postIndex:number) => {
    const comments = await blogContract.getPostComments(_postIndex)
    const commentsArray: Comment[] = [];
    for (let index = 0; index < comments[0].length; index++) {
      const username:string = comments[0][index] as string;
      const userComment:string = comments[1][index] as string;
      const singleComment: Comment = { userComment, username}
      commentsArray.unshift(singleComment)
    }
    setComments(commentsArray)
  }
  return (
    <ContractContext.Provider value={{ 
      blogContract, 
      getBlogPosts, 
      allPosts, 
      getPostByIndex,
      post,
      getPostComments,
      comments
       }}>
      {children}
    </ContractContext.Provider>
  )
}

export const useContractContext = () => useContext(ContractContext);


