import { useContractContext } from "@/contexts/ContractContext"
import styles from "@/styles/reddit.module.css"
import { useEffect } from "react"
import Link from "next/link";
import PostModal from "./PostModal";

type PostType = {
  postIndex: number;
  title: string;
  content: string;
  username: string;
};


const Posts= () => {
  const { getBlogPosts, allPosts } = useContractContext()

  useEffect(() => {
    getBlogPosts()
  },[])

  return (
    <div className={styles.container}>
      <PostModal />
      {allPosts.length > 0 && 
      allPosts.map((post: PostType) => (
        <Link key={post.postIndex} href={`/${post.postIndex}`}>
        <div className={styles.post}>
          <div className={styles.postTitle}>{post.title}</div>
          <div className={styles.postContent}>{post.content}</div>
          <p>Posted by: {post.username}</p>
        </div>
        </Link>
      ))}
    </div>
  )
}

export default Posts;