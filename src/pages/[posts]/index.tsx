import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { GetStaticPaths, GetStaticProps } from 'next';
import { ethers } from 'ethers';
import abi from '@/utils/abi.json';
import styles from "@/styles/reddit.module.css"
import { useContractContext } from '@/contexts/ContractContext';
import Link from 'next/link';
import CommentModal from '@/components/CommentModal';

type Post = {
  username: string;
  title: string;
  content: string;
  postIndex: number;
};

type PostProps = {
  post: Post;
};

type Comment = {
  userComment: string;
  username: string;
}

function PostPage({ post }: PostProps) {
  const { getPostComments, comments } = useContractContext()
  useEffect(() => {
    getPostComments(post.postIndex)
  },[])
  if (!post) return <p className={styles.container}>Post not found</p>;

  return (
    <div className={styles.container}>
      <Link href="/">
        <button className={styles.backButton}>
            &larr;
        </button>
    </Link>
      <div className={styles.post}>
      <div className={styles.postTitle}>{post.title}</div>
      <p className={styles.postContent}>{post.content}</p>
      <p className={styles.username}>By: {post.username}</p>
    </div>
    <CommentModal postIndex={post.postIndex}/>
    {comments.length > 0 && 
      comments.map((comment: Comment, i) => (
        <div key={i} className={styles.post}>
          <p className={styles.postContent}>{comment.userComment}</p>
          <p className={styles.username}>By: {comment.username}</p>
        </div>
      ))}
    </div>
  );
}

export default PostPage;

export const getStaticPaths: GetStaticPaths = async () => {
  const contractAddress = '0x5ec92976e3e26a987e2d788353f14e453c386cdb';
  const provider = new ethers.providers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);

  const blogContract = new ethers.Contract(contractAddress, abi, provider);
  const count = await blogContract.getTopicPostsCount();

  const paths = Array.from({ length: count.toNumber() }).map((_, index) => ({
    params: { posts: index.toString() }
  }));

  return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps<PostProps> = async (context) => {
  const postIndex = Number(context.params?.posts);
  
  const contractAddress = '0x5ec92976e3e26a987e2d788353f14e453c386cdb';
  const provider = new ethers.providers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);

  const blogContract = new ethers.Contract(contractAddress, abi, provider);
  const post = await blogContract.getTopicPost(postIndex);
  const user = await blogContract.users(post[0]);

  if (!post || !user) {
    return { notFound: true };
  }

  const formattedPostData: Post = {
    username: user[0],
    title: post[1],
    content: post[2],
    postIndex: postIndex
  };

  return { props: { post: formattedPostData } };
};
