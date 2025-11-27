import React, { useState, useEffect } from "react";

function Profil({ setLogged, setUser }) {
    const [userName, setUserName] = useState("");
    const [userSurname, setUserSurname] = useState("");
    const [userEmail, setUserEmail] = useState("");
    const [userNewPass, setUserNewPass] = useState("");

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

    const handleLogout = () => {
        fetch('http://localhost:3000/logout', { 
            method: 'POST',
            credentials: 'include'
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                setLogged(false);
                setUser("");
            } else {
                setTextMsg("Nastala chyba pri odhlasovaní!");
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

    useEffect(() => {
        const loadUser = async () => {
          try {
            const res = await fetch("http://localhost:3000/profile", {
              credentials: "include"
            });
            const data = await res.json();
            if (data.success) {
              setUserName(data.user.name);
              setUserSurname(data.user.surname);
              setUserEmail(data.user.email);
            } else {
              handleLogout;
            }
          } catch (err) {
            console.error(err);
            setTextMsg("Nastala chyba komunikácie!");
            setMsg(true);
            setTimeout(() => setMsg(false), 3000);
          }
        };
    
        loadUser();
      }, []);

      const handleEdit = () => {
        if (userName === "" || userSurname === "" || userEmail ==="") {
            setTextMsg("Polia ostali prázdne!");
            setMsg(true);
            setTimeout(() => setMsg(false), 3000);
            return;
        }
        if (userNewPass !== "" && userNewPass.length < 8) {
            setTextMsg("Heslo je krátke!");
            setMsg(true);
            setTimeout(() => setMsg(false), 3000);
            return;
        }
        fetch('http://localhost:3000/userEdit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ userName, userSurname, userEmail, userNewPass })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                setTextMsg("Údaje boli zmenené!");
                setMsg(true);
                setTimeout(() => setMsg(false), 3000);
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
        });
      }

    return (
        <>
            <span style={msgStyle}>{textMsg}</span>
            <div className="user-box">
                <i className="user-icon"></i>
                <span>{userName} {userSurname}</span>
            </div>
            <div className="user-info-box">
                <input type="text" value={userName} placeholder="Meno" onChange={(e) => setUserName(e.target.value)} />
                <input type="text" value={userSurname} placeholder="Priezvisko" onChange={(e) => setUserSurname(e.target.value)} />
                <input type="email" value={userEmail} placeholder="Email" onChange={(e) => setUserEmail(e.target.value)} />
                <input type="password" value={userNewPass} placeholder="Nové heslo" onChange={(e) => setUserNewPass(e.target.value)} />
                <div className="button-box">
                    <button onClick={handleEdit}>Uložiť</button>
                    <button onClick={handleLogout}>Odhlásiť</button>
                </div>
            </div>
        </>
    );
}

export default Profil;