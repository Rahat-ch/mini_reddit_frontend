// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Blog {
    struct User {
        string username;
        bool isRegistered;
    }

    struct Comment {
        address commenter;
        string text;
    }

    struct TopicPost {
        address author;
        string title;
        string content;
        uint256[] commentIds;
    }

    mapping(address => User) public users;
    mapping(string => address) public addressByUsername;  // Map username to address
    mapping(string => bool) public usernameExists;
    TopicPost[] public topicPosts;
    Comment[] public comments;

    modifier onlyRegisteredUser() {
        require(users[msg.sender].isRegistered, "Only registered users can access this function");
        _;
    }

    function registerUser(string memory _username) public {
        require(bytes(_username).length > 0, "Username must not be empty");
        require(!users[msg.sender].isRegistered, "User is already registered");
        require(!usernameExists[_username], "Username already exists");

        users[msg.sender] = User(_username, true);
        usernameExists[_username] = true;
        addressByUsername[_username] = msg.sender;
    }

    function createTopicPost(string memory _title, string memory _content) public onlyRegisteredUser {
        require(bytes(_title).length > 0 && bytes(_content).length > 0, "Title and content must not be empty");
        topicPosts.push(TopicPost(msg.sender, _title, _content, new uint256[](0)));
    }

    function addComment(uint256 _postIndex, string memory _commentText) public onlyRegisteredUser {
        require(_postIndex < topicPosts.length, "Invalid post index");
        require(bytes(_commentText).length > 0, "Comment must not be empty");

        uint256 commentId = comments.length;
        comments.push(Comment(msg.sender, _commentText));
        topicPosts[_postIndex].commentIds.push(commentId);
    }

    function getTopicPostsCount() public view returns (uint256) {
        return topicPosts.length;
    }

    function getTopicPost(uint256 _postIndex) public view returns (address, string memory, string memory, uint256) {
        require(_postIndex < topicPosts.length, "Invalid post index");
        TopicPost storage post = topicPosts[_postIndex];
        return (post.author, post.title, post.content, post.commentIds.length);
    }

    function getComment(uint256 _commentId) public view returns (address, string memory) {
        require(_commentId < comments.length, "Invalid comment ID");
        Comment memory comment = comments[_commentId];
        return (comment.commenter, comment.text);
    }

    function getPostComments(uint256 _postIndex) public view returns (string[] memory, string[] memory) {
        require(_postIndex < topicPosts.length, "Invalid post index");
        TopicPost storage post = topicPosts[_postIndex];
        uint256 commentCount = post.commentIds.length;

        string[] memory usernames = new string[](commentCount);
        string[] memory commentTexts = new string[](commentCount);

        for (uint256 i = 0; i < commentCount; i++) {
            Comment memory comment = comments[post.commentIds[i]];
            usernames[i] = users[comment.commenter].username;
            commentTexts[i] = comment.text;
        }

        return (usernames, commentTexts);
    }

    function getAddressByUsername(string memory _username) public view returns (address) {
        return addressByUsername[_username];
    }
}

