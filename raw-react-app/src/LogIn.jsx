import React, { useState } from "react";

function LogIn({ setLogged, setUser }) {
    const [activeForm, setForm] = useState("login");
    const [regName, setRegName] = useState("");
    const [regSurname, setRegSurname] = useState("");
    const [regEmail, setRegEmail] = useState("");
    const [regPass, setRegPass] = useState("");
    const [logEmail, setLogEmail] = useState("");
    const [logPass, setLogPass] = useState("");

    const [showMsg, setMsg] = useState("");
    const [textMsg, setTextMsg] = useState("");

    const msgStyle = {
        backgroundColor: '#666',
        color: '#fff',
        padding: '6px',
        borderRadius: '12px',
        position: 'absolute',
        display: showMsg ? 'block' : 'none',
        top: '10%'
    };

    const handleLogin = (e) => {
        e.preventDefault();
        if (logEmail === "" || logPass === "") {
            setTextMsg("Polia ostali prázdne!");
            setMsg(true);
            setTimeout(() => setMsg(false), 3000);
        } else {
            fetch('http://localhost:3000/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({logEmail, logPass})
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setLogEmail("");
                    setLogPass("");
                    fetch('http://localhost:3000/profile', { credentials: 'include' })
                    .then(res => res.json())
                    .then(data => {
                        if (data.success) {
                            setLogged(true);
                            setUser(data.user);
                        } else {
                            setTextMsg("Neautorizovaný prístup!");
                            setMsg(true);
                            setTimeout(() => setMsg(false), 3000);
                        }
                    })
                } else {
                    setTextMsg(data.error);
                    setMsg(true);
                    setTimeout(() => setMsg(false), 3000);
                    setLogEmail("");
                    setLogPass("");
                }
            })
            .catch(err => {
                console.error(err);
                setTextMsg("Nastala chyba komunikácie!");
                setMsg(true);
                setTimeout(() => setMsg(false), 3000);
            });
        }
    }

    const handleRegister = (e) => {
        e.preventDefault();
        if (regName === "" || regSurname === "" || regEmail === "" || regPass === "") {
            setTextMsg("Polia ostali prázdne!");
            setMsg(true);
            setTimeout(() => setMsg(false), 3000);
        } else if (regPass.length < 8) {
            setTextMsg("Heslo je krátke!");
            setMsg(true);
            setTimeout(() => setMsg(false), 3000);
        } else {
            fetch('http://localhost:3000/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({regName, regSurname, regEmail, regPass})
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setRegName("");
                    setRegSurname("");
                    setRegEmail("");
                    setRegPass("");
                    setForm("login");
                } else {
                    setTextMsg(data.error);
                    setMsg(true);
                    setTimeout(() => setMsg(false), 3000);
                    setRegName("");
                    setRegSurname("");
                    setRegEmail("");
                    setRegPass("");
                }
            })
            .catch(err => {
                console.error(err);
                setTextMsg("Nastala chyba komunikácie!");
                setMsg(true);
                setTimeout(() => setMsg(false), 3000);
            });
        }
    }

    return (
        <>
            <div className="form-overlay">
                <span style={msgStyle}>{textMsg}</span>
                {activeForm === "login" && 
                    <form className="form" onSubmit={handleLogin}>
                        <h2>Prihlásiť sa</h2>
                        <input type="email" value={logEmail} placeholder="Email" onChange={(e) => setLogEmail(e.target.value)} />
                        <input type="password" value={logPass} placeholder="Heslo" onChange={(e) => setLogPass(e.target.value)} />
                        <button type="submit">Prihlásiť sa</button>
                        <span onClick={() => setForm("register")}>Vytvoriť účet</span>
                    </form>
                }

                {activeForm === "register" &&
                    <form className="form" onSubmit={handleRegister}>
                        <h2>Zaregistrovať sa</h2>
                        <input type="text" value={regName} placeholder="Meno" onChange={(e) => setRegName(e.target.value)} />
                        <input type="text" value={regSurname} placeholder="Priezvisko" onChange={(e) => setRegSurname(e.target.value)} />
                        <input type="email" value={regEmail} placeholder="Email" onChange={(e) => setRegEmail(e.target.value)} />
                        <input type="password" value={regPass} placeholder="Heslo" onChange={(e) => setRegPass(e.target.value)} />
                        <button type="submit">Vytvoriť účet</button>
                        <span onClick={() => setForm("login")}>Už mám účet</span>
                    </form>
                }
            </div>
        </>
    );
}

export default LogIn;