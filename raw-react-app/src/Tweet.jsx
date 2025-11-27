import React from "react";

function  Tweet({ text, author, date, likes, isLiked, onLike, onDelete }) {
    return (
        <>
            <div className="tweet" onDoubleClick={onDelete}>
                <div className="tweet-content">
                    <p>{text}</p>
                </div>
                <div className="tweet-footer">
                    <span className="author">{author}</span>
                    <span className="date">{date}</span>
                    <div className="like-box">
                        <i className={`like-btn ${isLiked ? 'liked' : ''}`} onClick={onLike}></i>
                        <span className="likes">{likes}</span>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Tweet;