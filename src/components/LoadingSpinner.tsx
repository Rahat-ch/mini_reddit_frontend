import React from 'react';
import styles from '../styles/LoadingSpinner.module.css'; 

type props = {
    message?: string
}

const LoadingSpinner = ({ message }:props) => (
    <div className={styles.spinnerContainer}>
        {message && <p className={styles.message}>{message}</p>}
        <div className={styles.spinner}></div>
    </div>
);

export default LoadingSpinner;
