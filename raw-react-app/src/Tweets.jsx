import React, { useState, useEffect, useMemo } from "react";
import Tweet from "./Tweet";

function Tweets() {
    const [tweetText, setTweetText] = useState("");
    const [tweets, setTweets] = useState([]);
    const [selectedAuthor, setSelectedAuthor] = useState("all");
    const [sortOrder, setSortOrder] = useState("desc");

    const [showMsg, setMsg] = useState("");
    const [textMsg, setTextMsg] = useState("");

    const msgStyle = {
        backgroundColor: '#666',
        color: '#fff',
        padding: '6px',
        borderRadius: '12px',
        position: 'absolute',
        display: showMsg ? 'block' : 'none',
        top: '10%',
        left: '50%',
        transform: 'translateX(-50%)'
    };

    async function loadTweets(order = sortOrder) {
        const res = await fetch(`http://localhost:3000/loadTweets?order=${order}`, { credentials: "include" });
        const data = await res.json();
        if (data.success) {
            setTweets(data.tweets);
        } else {
            setTextMsg(data.error);
            setMsg(true);
            setTimeout(() => setMsg(false), 3000);
        }
    }

    useEffect(() => { loadTweets(sortOrder) }, [sortOrder]);

    const handleUpload = (e) => {
        e.preventDefault();
        if (tweetText === "") {
            setTextMsg("Nie je napísaný tweet!");
            setMsg(true);
            setTimeout(() => setMsg(false), 3000);
        } else {
            fetch('http://localhost:3000/postTweet', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ tweetText })
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setTextMsg("Tweet bol uverejnený!");
                    setMsg(true);
                    setTimeout(() => setMsg(false), 3000);
                    setTweetText("");
                    loadTweets();
                } else {
                    setTextMsg(data.error);
                    setMsg(true);
                    setTimeout(() => setMsg(false), 3000);
                }
            })
            .catch(err => {
                console.error(err);
                setTextMsg("Nastala chyba komunikácie!");
                setMsg(true);
                setTimeout(() => setMsg(false), 3000);
            })
        }
    }

    const handleDelete = (tweetID) => {
        if (!confirm("Naozaj chceš vymazať svoj tweet?")) return;
        fetch('http://localhost:3000/removeTweet', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ tweetID })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                setTextMsg("Tweet bol vymazaný!");
                setMsg(true);
                setTimeout(() => setMsg(false), 3000);
                loadTweets();
            } else {
                setTextMsg(data.error);
                setMsg(true);
                setTimeout(() => setMsg(false), 3000);
            }
        })
        .catch(err => {
            console.error(err);
            setTextMsg("Nastala chyba komunikácie!");
            setMsg(true);
            setTimeout(() => setMsg(false), 3000);
        })
    }

    const handleLike = (tweetID) => {
        fetch('http://localhost:3000/likeTweet', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ tweetID })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                loadTweets();
            } else {
                setTextMsg(data.error);
                setMsg(true);
                setTimeout(() => setMsg(false), 3000);
            }
        })
        .catch(err => {
            console.error(err);
            setTextMsg("Nastala chyba komunikácie!");
            setMsg(true);
            setTimeout(() => setMsg(false), 3000);
        })
    }

    const authorOptions = useMemo(() => {
        const uniqueAuthors = new Map();
        tweets.forEach((tweet) => {
            if (tweet.author?._id && !uniqueAuthors.has(tweet.author._id)) {
                uniqueAuthors.set(tweet.author._id, `${tweet.author.name} ${tweet.author.surname}`);
            }
        });
        return Array.from(uniqueAuthors.entries()).map(([id, label]) => ({ id, label }));
    }, [tweets]);

    const filteredTweets = useMemo(() => {
        if (selectedAuthor === "all") {
            return tweets;
        }
        return tweets.filter((tweet) => tweet.author?._id === selectedAuthor);
    }, [tweets, selectedAuthor]);

    const handleFilterChange = (e) => {
        setSelectedAuthor(e.target.value);
    };

    const handleSortChange = (e) => {
        setSortOrder(e.target.value);
    };

    return (
        <>  
            <span style={msgStyle}>{textMsg}</span>
            <form className="filter-form">
                <div className="filter-field">
                    <label htmlFor="authorFilter">Filtrovať podľa autora</label>
                    <select id="authorFilter" value={selectedAuthor} onChange={handleFilterChange}>
                        <option value="all">Všetci používatelia</option>
                        {authorOptions.map(({ id, label }) => (
                            <option key={id} value={id}>{label}</option>
                        ))}
                    </select>
                </div>
                <div className="filter-field">
                    <label htmlFor="sortFilter">Zoradenie</label>
                    <select id="sortFilter" value={sortOrder} onChange={handleSortChange}>
                        <option value="desc">Najnovšie (DESC)</option>
                        <option value="asc">Najstaršie (ASC)</option>
                    </select>
                </div>
            </form>
            <div className="tweet-layout">
                <div className="tweet-list">
                    {filteredTweets.map((tweet) => (
                        <Tweet
                            key={tweet._id}
                            text={tweet.text}
                            author={tweet.author.name + " " + tweet.author.surname}
                            date={new Date(tweet.date).toLocaleDateString()}
                            likes={tweet.likes}
                            isLiked={tweet.isLiked}
                            onLike={() => handleLike(tweet._id)}
                            onDelete={() => handleDelete(tweet._id)}
                        />
                    ))}
                </div>
                <form className="tweet-form">
                    <h2>Napíš svoj tweet</h2>
                    <textarea type="text" value={tweetText} placeholder="Môj tweet ..." onChange={(e) => setTweetText(e.target.value)}></textarea>
                    <button onClick={handleUpload}>Uverejniť Tweet</button>
                </form>
            </div>
        </>
    );
}

export default Tweets;