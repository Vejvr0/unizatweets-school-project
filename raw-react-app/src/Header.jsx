import React from "react";
import logo from "../assets/logo.svg";

function Header({ setPage }) {
  return (
    <header>
      <div className="head-bar">
        <div className="head-logo" onClick={() => {
          window.location.href = '/'
        }}>
          <img src={logo} alt="logo UnizaTweets" />
          <h1>Uniza Tweets</h1>
        </div>
        <nav className="navtabs">
          <span onClick={() => setPage("tweets")}>Tweets</span>
          <span onClick={() => setPage("profil")}>Profil</span>
        </nav>
      </div>
    </header>
  );
}

export default Header;
