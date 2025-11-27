import React, { useState, useEffect } from "react";
import LogIn from "./LogIn.jsx";
import Header from "./Header.jsx";
import Tweets from "./Tweets.jsx";
import Profil from "./Profile.jsx";
import Footer from "./Footer.jsx";
import "./index.css";
import "./login.css";
import "./tweets.css";
import "./profile.css";

function App() {
  const [isLogged, setLogged] = useState(false);
  const [user, setUser] = useState("");
  const [activePage, setPage] = useState("tweets");
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('http://localhost:3000/profile', {
          credentials: 'include'
        });
        const data = await response.json();
        if (data.success) {
          setLogged(true);
          setUser(data.user);
        } else {
          setLogged(false);
          setUser("");
        }
      } catch (err) {
        console.error('Chyba pri kontrole session:', err);
        setLogged(false);
        setUser("");
      };
    };
    checkSession();
  }, []);

  return (
    <>
      {!isLogged ? (
        <LogIn setLogged={setLogged} setUser={setUser} />
      ) : (
        <>
        <Header setPage={setPage} />
        {activePage === "tweets" && <Tweets />}
        {activePage === "profil" && <Profil setLogged={setLogged} setUser={setUser} />}
        <Footer />
        </>
      )}
    </>
  );
}

export default App;