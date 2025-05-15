"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../page.module.css";
import Link from "next/link";

// interface LoginProps {
//     email: string;
//     password: string;
// }

const Login: React.FC = () => {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.push("/");
    };
    
    return (
        <div className={styles.container}>
            <h1>Login</h1>
            <form onSubmit={handleSubmit}>
                <input 
                    type="email" 
                    placeholder="Email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                />
                <input 
                    type="password" 
                    placeholder="Password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                />
                <button className={styles.button} type="submit">Login</button>
                <p>No account? <Link className={styles.link} href="/register">Register here</Link></p>
            </form>
        </div>
    );
};

export default Login;
