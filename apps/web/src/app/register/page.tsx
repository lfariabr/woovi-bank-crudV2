"use client";
import styles from "../page.module.css";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const Register: React.FC = () => {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [taxVat, setTaxVat] = useState("");
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.push("/");
    };
    
    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Register</h1>
            <form className={styles.form} onSubmit={handleSubmit}>
                <input 
                    className={styles.input}
                    type="email" 
                    placeholder="Email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required
                />
                <input 
                    className={styles.input}
                    type="password" 
                    placeholder="Password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required
                />
                <input 
                    className={styles.input}
                    type="name"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
                <input 
                    className={styles.input}
                    type="phone"
                    placeholder="Phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                />
                <input 
                    className={styles.input}
                    type="taxVat"
                    placeholder="Tax Vat"
                    value={taxVat}
                    onChange={(e) => setTaxVat(e.target.value)}
                    required
                />
                <button className={styles.button} type="submit">Register</button>
                <p>Already have an account? <Link className={styles.link} href="/login">Login here</Link></p>
            </form>
        </div>
    );
};

export default Register;
